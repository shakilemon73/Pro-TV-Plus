import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveUrl(relative, base) {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '5000', 10);

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // ─── API ROUTES ──────────────────────────────────────────────────────────────

  // HLS stream proxy — rewrites playlist URLs and pipes segments
  app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing url parameter');

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': new URL(targetUrl).origin,
        }
      });

      if (!response.ok) return res.status(response.status).send(`Upstream error: ${response.statusText}`);

      const contentType = response.headers.get('content-type') || '';
      const isM3u8 = targetUrl.includes('.m3u8') ||
        contentType.includes('mpegurl') || contentType.includes('vnd.apple.mpegurl');

      if (isM3u8) {
        const text = await response.text();
        const rewritten = text.split(/\r?\n/).map(line => {
          const t = line.trim();
          if (!t) return line;
          if (t.startsWith('#')) {
            if (t.includes('URI=')) {
              return t.replace(/URI="([^"]+)"/g, (_, p1) =>
                `URI="/api/proxy?url=${encodeURIComponent(resolveUrl(p1, targetUrl))}"`);
            }
            return line;
          }
          return `/api/proxy?url=${encodeURIComponent(resolveUrl(t, targetUrl))}`;
        }).join('\n');
        res.setHeader('Content-Type', 'application/x-mpegURL');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.send(rewritten);
      }

      // Binary segment
      const buf = Buffer.from(await response.arrayBuffer());
      if (contentType) res.setHeader('Content-Type', contentType);
      else if (targetUrl.includes('.ts')) res.setHeader('Content-Type', 'video/mp2t');
      const cc = response.headers.get('cache-control');
      res.setHeader('Cache-Control', cc || 'public, max-age=86400');
      return res.send(buf);
    } catch (err) {
      console.error('Proxy error:', err.message);
      return res.status(500).send(`Proxy failed: ${err.message}`);
    }
  });

  // Health check
  app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

  // App update info (cached 5 min)
  let cachedUpdate = null;
  let lastCache = 0;
  const CACHE_TTL = 5 * 60 * 1000;

  app.get('/api/app-update', async (req, res) => {
    const now = Date.now();
    if (cachedUpdate && now - lastCache < CACHE_TTL) return res.json(cachedUpdate);
    try {
      const r = await fetch('https://github.com/shakilemon73/my-m3u-playlist/raw/refs/heads/main/app-update.json');
      if (!r.ok) throw new Error(`GitHub ${r.status}`);
      const data = await r.json();
      cachedUpdate = data;
      lastCache = now;
      return res.json(data);
    } catch (err) {
      console.error('app-update fetch failed:', err.message);
      if (cachedUpdate) return res.json(cachedUpdate);
      return res.status(500).json({
        versionCode: 100, versionName: '1.0.0',
        apkUrl: 'https://github.com/shakilemon73/my-m3u-playlist/raw/refs/heads/main/releases/download/app-release.apk',
        changelog: '• Performance improvements\n• Stability fixes'
      });
    }
  });

  // APK download — redirect directly to Dropbox
  const DROPBOX_APK = 'https://www.dropbox.com/scl/fi/lcjf06lcq03dlbvnrl4jl/Pro-TV-Plus.apk?rlkey=6nip42uztf7k9r119hbho4opr&st=1ml1uoyu&dl=1';
  app.get('/api/download-apk', (req, res) => {
    res.redirect(302, DROPBOX_APK);
  });

  // ─── STATIC FILES ─────────────────────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, 'public')));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PRO TV PLUS server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
