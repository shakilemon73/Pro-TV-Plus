import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Helper to resolve relative URLs
function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return relative;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // HLS stream proxy to bypass browser Mixed-Content (HTTP on HTTPS) and CORS blocks
  app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      // Set up options for the fetch call
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': new URL(targetUrl).origin,
        }
      });

      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch target stream: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      
      // If it's an M3U8 playlist, we rewrite relative URLs inside it to keep them proxied
      if (targetUrl.includes('.m3u8') || contentType.includes('application/mpegurl') || contentType.includes('application/x-mpegurl') || contentType.includes('vnd.apple.mpegurl')) {
        const bodyText = await response.text();
        const lines = bodyText.split(/\r?\n/);
        
        const rewrittenLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return line;
          
          // Comment line
          if (trimmed.startsWith('#')) {
            // Check if there are URIs inside attributes, e.g. URI="something.m3u8"
            if (trimmed.includes('URI=')) {
              return trimmed.replace(/URI="([^"]+)"/g, (match, p1) => {
                const absUrl = resolveUrl(p1, targetUrl);
                return `URI="/api/proxy?url=${encodeURIComponent(absUrl)}"`;
              });
            }
            return line;
          }
          
          // It's a stream URL line (either relative or absolute)
          const absoluteUrl = resolveUrl(trimmed, targetUrl);
          return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        });

        res.setHeader('Content-Type', 'application/x-mpegURL');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.send(rewrittenLines.join('\n'));
      } else {
        // It's a binary segment (like .ts chunk) or other media file - pipe it back
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Pass through content-type and cache-control headers if available
        if (contentType) {
          res.setHeader('Content-Type', contentType);
        } else if (targetUrl.includes('.ts')) {
          res.setHeader('Content-Type', 'video/mp2t');
        }
        
        const cacheControl = response.headers.get('cache-control');
        if (cacheControl) {
          res.setHeader('Cache-Control', cacheControl);
        } else {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
        
        return res.send(buffer);
      }
    } catch (error: any) {
      console.error('Error proxying HLS stream:', error);
      return res.status(500).send(`Proxy connection failed: ${error.message}`);
    }
  });

  // Standard API health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Integrate Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware mounted.');
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
