// Cloudflare Pages Function — /api/proxy
// Proxies HLS .m3u8 playlists (rewriting segment URLs) and binary .ts segments.

export const onRequest = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400, headers: corsHeaders });
  }

  // Basic SSRF guard — only allow http/https
  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
      return new Response('Invalid protocol', { status: 400, headers: corsHeaders });
    }
  } catch {
    return new Response('Invalid url parameter', { status: 400, headers: corsHeaders });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': parsedTarget.origin,
        'Origin': parsedTarget.origin,
      },
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status} ${upstream.statusText}`, {
        status: upstream.status,
        headers: corsHeaders,
      });
    }

    const contentType = upstream.headers.get('content-type') || '';
    const isPlaylist =
      targetUrl.includes('.m3u8') ||
      targetUrl.includes('.m3u')  ||
      contentType.includes('mpegurl') ||
      contentType.includes('vnd.apple.mpegurl');

    if (isPlaylist) {
      const body = await upstream.text();
      const rewritten = body.split(/\r?\n/).map(line => {
        const t = line.trim();
        if (!t) return line;
        if (t.startsWith('#')) {
          // Rewrite URI="..." attributes inside EXT-X-KEY, EXT-X-MAP, etc.
          if (t.includes('URI=')) {
            return t.replace(/URI="([^"]+)"/g, (_, p1) => {
              try {
                const abs = new URL(p1, targetUrl).href;
                return `URI="/api/proxy?url=${encodeURIComponent(abs)}"`;
              } catch { return `URI="${p1}"`; }
            });
          }
          return line;
        }
        // Segment / child playlist URL
        try {
          const abs = new URL(t, targetUrl).href;
          return `/api/proxy?url=${encodeURIComponent(abs)}`;
        } catch { return line; }
      }).join('\n');

      return new Response(rewritten, {
        headers: {
          'Content-Type': 'application/x-mpegURL',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders,
        },
      });
    }

    // Binary segment (.ts) or other asset — stream through
    const outHeaders = new Headers(corsHeaders);
    if (contentType) {
      outHeaders.set('Content-Type', contentType);
    } else if (targetUrl.includes('.ts')) {
      outHeaders.set('Content-Type', 'video/mp2t');
    }

    const cc = upstream.headers.get('cache-control');
    outHeaders.set('Cache-Control', cc || 'public, max-age=86400');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: outHeaders,
    });
  } catch (err) {
    return new Response(`Proxy failed: ${err.message}`, {
      status: 502,
      headers: corsHeaders,
    });
  }
};
