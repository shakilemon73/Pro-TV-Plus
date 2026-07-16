// Cloudflare Worker - HLS Stream Proxy
// Deploy this to Cloudflare Workers for free, high-performance video streaming
// Enhanced to handle token-based streams and preserve query parameters

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const workerUrl = `${url.protocol}//${url.host}`;
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing url parameter', {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    // Security check - only allow http/https
    let parsedTarget;
    try {
      parsedTarget = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
        return new Response('Invalid protocol', {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
        });
      }
    } catch (err) {
      return new Response('Invalid url parameter', {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    try {
      // Fetch the target stream with appropriate headers
      const upstreamResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': parsedTarget.origin,
          'Origin': parsedTarget.origin,
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });

      if (!upstreamResponse.ok) {
        return new Response(`Upstream error: ${upstreamResponse.status} ${upstreamResponse.statusText}`, {
          status: upstreamResponse.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
        });
      }

      const contentType = upstreamResponse.headers.get('content-type') || '';
      
      // Check if this is an M3U8 playlist
      const isPlaylist =
        targetUrl.includes('.m3u8') ||
        targetUrl.includes('.m3u') ||
        contentType.includes('mpegurl') ||
        contentType.includes('vnd.apple.mpegurl');

      if (isPlaylist) {
        // Rewrite M3U8 playlist to proxy segment URLs while preserving tokens
        const body = await upstreamResponse.text();
        const rewritten = body.split(/\r?\n/).map(line => {
          const trimmed = line.trim();
          if (!trimmed) return line;
          
          // Handle comments and directives
          if (trimmed.startsWith('#')) {
            // Rewrite URI="..." attributes in EXT-X-KEY, EXT-X-MAP, etc.
            if (trimmed.includes('URI=')) {
              return trimmed.replace(/URI="([^"]+)"/g, (_, uri) => {
                try {
                  const absoluteUrl = new URL(uri, targetUrl).href;
                  return `URI="${workerUrl}/?url=${encodeURIComponent(absoluteUrl)}"`;
                } catch {
                  return `URI="${uri}"`;
                }
              });
            }
            return line;
          }
          
          // Rewrite segment URLs and child playlist URLs
          // Skip if it's already a proxy URL or looks like a full URL
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            // It's already an absolute URL, proxy it
            try {
              return `${workerUrl}/?url=${encodeURIComponent(trimmed)}`;
            } catch {
              return line;
            }
          }
          
          // It's a relative URL, resolve it against the target URL
          try {
            const absoluteUrl = new URL(trimmed, targetUrl).href;
            return `${workerUrl}/?url=${encodeURIComponent(absoluteUrl)}`;
          } catch {
            return line;
          }
        }).join('\n');

        return new Response(rewritten, {
          headers: {
            'Content-Type': 'application/x-mpegURL',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
          },
        });
      }

      // Stream through binary data (TS segments, FLV, native video, etc.)
      const responseHeaders = new Headers();
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');
      responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
      
      // Set appropriate content type based on file extension or upstream header
      if (contentType) {
        responseHeaders.set('Content-Type', contentType);
      } else if (targetUrl.includes('.ts')) {
        responseHeaders.set('Content-Type', 'video/mp2t');
      } else if (targetUrl.includes('.flv')) {
        responseHeaders.set('Content-Type', 'video/x-flv');
      } else if (targetUrl.includes('.m4s')) {
        responseHeaders.set('Content-Type', 'video/mp4');
      } else if (targetUrl.includes('.mp4')) {
        responseHeaders.set('Content-Type', 'video/mp4');
      } else if (targetUrl.includes('.webm')) {
        responseHeaders.set('Content-Type', 'video/webm');
      } else if (targetUrl.includes('.mkv')) {
        responseHeaders.set('Content-Type', 'video/x-matroska');
      } else if (targetUrl.includes('.avi')) {
        responseHeaders.set('Content-Type', 'video/x-msvideo');
      } else {
        responseHeaders.set('Content-Type', 'application/octet-stream');
      }

      // Copy important headers from upstream
      const contentLength = upstreamResponse.headers.get('content-length');
      if (contentLength) {
        responseHeaders.set('Content-Length', contentLength);
      }

      const cacheControl = upstreamResponse.headers.get('cache-control');
      responseHeaders.set('Cache-Control', cacheControl || 'public, max-age=86400');

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: responseHeaders,
      });

    } catch (err) {
      return new Response(`Proxy error: ${err.message}`, {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};
