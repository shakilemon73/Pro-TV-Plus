export const onRequest = async (context: any) => {
  const request = context.request;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400, headers: corsHeaders });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': new URL(targetUrl).origin,
      },
    });

    if (!response.ok) {
      return new Response(`Failed to fetch target stream: ${response.statusText}`, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const contentType = response.headers.get('content-type') || '';

    const isPlaylist = targetUrl.includes('.m3u8') || 
                       contentType.includes('application/mpegurl') || 
                       contentType.includes('application/x-mpegurl') || 
                       contentType.includes('vnd.apple.mpegurl');

    if (isPlaylist) {
      const bodyText = await response.text();
      const lines = bodyText.split(/\r?\n/);
      
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        
        if (trimmed.startsWith('#')) {
          if (trimmed.includes('URI=')) {
            return trimmed.replace(/URI="([^"]+)"/g, (match, p1) => {
              try {
                const absUrl = new URL(p1, targetUrl).href;
                return `URI="/api/proxy?url=${encodeURIComponent(absUrl)}"`;
              } catch (e) {
                return match;
              }
            });
          }
          return line;
        }
        
        try {
          const absoluteUrl = new URL(trimmed, targetUrl).href;
          return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        } catch (e) {
          return line;
        }
      });

      return new Response(rewrittenLines.join('\n'), {
        headers: {
          'Content-Type': 'application/x-mpegURL',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders,
        },
      });
    } else {
      // It's a segment (.ts chunk) or other asset
      const responseHeaders = new Headers(response.headers);
      
      // Inject standard CORS headers
      for (const [key, value] of Object.entries(corsHeaders)) {
        responseHeaders.set(key, value);
      }
      
      if (!responseHeaders.get('Content-Type') && targetUrl.includes('.ts')) {
        responseHeaders.set('Content-Type', 'video/mp2t');
      }

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    }
  } catch (error: any) {
    return new Response(`Proxy connection failed: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
};
