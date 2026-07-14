import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Helper to resolve relative URLs
function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return relative;
  }
}

// Database configuration & initialization
const DATA_DIR = path.join(process.cwd(), 'data');
const PLAYLISTS_FILE = path.join(DATA_DIR, 'playlists.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PLAYLISTS_FILE)) {
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify([
      {
        id: 'demo-playlist',
        name: 'Demo IPTV Channels',
        url: '',
        createdAt: new Date().toISOString(),
        channelsCount: 4,
        channels: [
          {
            name: 'Apex Cricket Premium HD',
            logo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
            category: 'Sports',
            url: 'https://test-streams.mux.dev/x36xhg/main.m3u8'
          },
          {
            name: 'Global Football Network Live',
            logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400',
            category: 'Sports',
            url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
          },
          {
            name: 'Global Broadcast 24/7 News',
            logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
            category: 'News',
            url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
          },
          {
            name: 'Classic Cinematic Streams',
            logo: 'https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?w=400',
            category: 'Cinema',
            url: 'https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8'
          }
        ]
      }
    ], null, 2));
  }
  if (!fs.existsSync(FAVORITES_FILE)) {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
  }
}

initDatabase();

// Helper to parse M3U data on the backend
function parseM3uData(text: string): any[] {
  const lines = text.split('\n');
  const channels: any[] = [];
  let currentItem: any = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Extract channel name (everything after the last comma)
      const commaIndex = line.lastIndexOf(',');
      const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unnamed Channel';

      // Extract logo URL
      const logoMatch = line.match(/tvg-logo="([^"]+)"/) || line.match(/logo="([^"]+)"/);
      const logo = logoMatch ? logoMatch[1] : undefined;

      // Extract category group
      const groupMatch = line.match(/group-title="([^"]+)"/) || line.match(/category="([^"]+)"/);
      const category = groupMatch ? groupMatch[1] : 'Uncategorized';

      currentItem = { name, logo, category };
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentItem.name) {
        currentItem.url = line;
        channels.push(currentItem);
        currentItem = {};
      }
    }
  }
  return channels;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add body parser middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Middleware for CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT, DELETE');
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

  // App updates JSON server-side proxy cache (5 minutes)
  let cachedUpdateData: any = null;
  let lastCacheTime = 0;
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  app.get('/api/app-update', async (req, res) => {
    const now = Date.now();
    if (cachedUpdateData && (now - lastCacheTime < CACHE_DURATION_MS)) {
      return res.json(cachedUpdateData);
    }

    try {
      const response = await fetch('https://github.com/shakilemon73/my-m3u-playlist/raw/refs/heads/main/app-update.json');
      if (!response.ok) {
        throw new Error(`GitHub returned status ${response.status}`);
      }
      const data = await response.json();
      cachedUpdateData = data;
      lastCacheTime = now;
      return res.json(data);
    } catch (error: any) {
      console.error('Failed to fetch app-update.json from GitHub:', error);
      // Serve stale cache as fallback if available, otherwise return error
      if (cachedUpdateData) {
        return res.json(cachedUpdateData);
      }
      return res.status(500).json({ 
        error: 'Failed to fetch update metadata', 
        message: error.message,
        // Fallback placeholders
        versionCode: 100,
        versionName: '1.0.0',
        apkUrl: 'https://www.dropbox.com/scl/fi/jqizyd1z758rq4fs5zpxu/protvplus.apk?rlkey=qsu1dt1fxg5vue17mgi4l7d9u&st=u0te745i&dl=1',
        changelog: '• Performance improvements\n• Stability fixes'
      });
    }
  });

  // Proxy download route to prevent cross-origin blocks and trigger native download
  app.get('/api/download-apk', async (req, res) => {
    const targetUrl = (req.query.url as string) || (cachedUpdateData?.apkUrl) || 'https://www.dropbox.com/scl/fi/jqizyd1z758rq4fs5zpxu/protvplus.apk?rlkey=qsu1dt1fxg5vue17mgi4l7d9u&st=u0te745i&dl=1';
    
    try {
      console.log(`Proxying APK download from: ${targetUrl}`);
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="app-release.apk"');
      res.setHeader('Content-Length', buffer.byteLength.toString());
      
      return res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Failed to proxy APK download:', error);
      // Graceful fallback: redirect user directly to download URL
      return res.redirect(targetUrl);
    }
  });

  // ==========================================
  // PLAYLISTS ENDPOINTS (Database API)
  // ==========================================

  // GET /api/playlists - Fetch all playlists
  app.get('/api/playlists', (req, res) => {
    try {
      const data = fs.readFileSync(PLAYLISTS_FILE, 'utf-8');
      const playlists = JSON.parse(data);
      // Don't send entire channels array in the list for better performance unless requested
      const summary = playlists.map((p: any) => ({
        id: p.id,
        name: p.name,
        url: p.url,
        createdAt: p.createdAt,
        channelsCount: p.channelsCount || (p.channels ? p.channels.length : 0)
      }));
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve playlists', details: error.message });
    }
  });

  // GET /api/playlists/:id - Fetch a single playlist with channels
  app.get('/api/playlists/:id', (req, res) => {
    try {
      const data = fs.readFileSync(PLAYLISTS_FILE, 'utf-8');
      const playlists = JSON.parse(data);
      const playlist = playlists.find((p: any) => p.id === req.params.id);
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      res.json(playlist);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve playlist', details: error.message });
    }
  });

  // POST /api/playlists - Save a new playlist (either from M3U URL or raw content)
  app.post('/api/playlists', async (req, res) => {
    try {
      const { name, url, content } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Playlist name is required' });
      }

      let m3uText = '';
      if (url) {
        // Fetch from URL
        const response = await fetch(url);
        if (!response.ok) {
          return res.status(400).json({ error: `Failed to fetch M3U from URL: ${response.statusText}` });
        }
        m3uText = await response.text();
      } else if (content) {
        m3uText = content;
      } else {
        return res.status(400).json({ error: 'Either playlist M3U URL or raw text content is required' });
      }

      const parsedChannels = parseM3uData(m3uText);
      if (parsedChannels.length === 0) {
        return res.status(400).json({ error: 'No valid streaming channels found in the provided M3U' });
      }

      const playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf-8'));
      const newPlaylist = {
        id: 'pl-' + Math.random().toString(36).substring(2, 11),
        name: name,
        url: url || '',
        createdAt: new Date().toISOString(),
        channelsCount: parsedChannels.length,
        channels: parsedChannels
      };

      playlists.push(newPlaylist);
      fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));

      res.status(201).json({
        id: newPlaylist.id,
        name: newPlaylist.name,
        channelsCount: newPlaylist.channelsCount,
        createdAt: newPlaylist.createdAt
      });
    } catch (error: any) {
      console.error('Error saving playlist:', error);
      res.status(500).json({ error: 'Failed to save playlist', details: error.message });
    }
  });

  // DELETE /api/playlists/:id - Delete a playlist
  app.delete('/api/playlists/:id', (req, res) => {
    try {
      const playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf-8'));
      const filtered = playlists.filter((p: any) => p.id !== req.params.id);
      
      if (playlists.length === filtered.length) {
        return res.status(404).json({ error: 'Playlist not found' });
      }

      fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(filtered, null, 2));
      res.json({ success: true, message: 'Playlist deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete playlist', details: error.message });
    }
  });

  // ==========================================
  // FAVORITES ENDPOINTS (Database API)
  // ==========================================

  // GET /api/favorites - Get all favorites
  app.get('/api/favorites', (req, res) => {
    try {
      const data = fs.readFileSync(FAVORITES_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve favorites', details: error.message });
    }
  });

  // POST /api/favorites - Save a channel to favorites
  app.post('/api/favorites', (req, res) => {
    try {
      const channel = req.body;
      if (!channel || !channel.id || !channel.name || !channel.streamUrl) {
        return res.status(400).json({ error: 'Invalid channel object structure' });
      }

      const favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
      // Prevent duplicates based on ID or streamUrl
      const exists = favorites.some((f: any) => f.id === channel.id || f.streamUrl === channel.streamUrl);
      if (!exists) {
        favorites.push(channel);
        fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
      }
      res.status(201).json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to save favorite', details: error.message });
    }
  });

  // DELETE /api/favorites/:id - Remove a channel from favorites
  app.delete('/api/favorites/:id', (req, res) => {
    try {
      const targetId = req.params.id;
      const favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
      const filtered = favorites.filter((f: any) => f.id !== targetId && f.streamUrl !== targetId);
      
      fs.writeFileSync(FAVORITES_FILE, JSON.stringify(filtered, null, 2));
      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete favorite', details: error.message });
    }
  });

  // ==========================================
  // RECENT HISTORY ENDPOINTS (Database API)
  // ==========================================

  // GET /api/history - Get played history
  app.get('/api/history', (req, res) => {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve history', details: error.message });
    }
  });

  // POST /api/history - Add a played channel to history
  app.post('/api/history', (req, res) => {
    try {
      const channel = req.body;
      if (!channel || !channel.name || !channel.streamUrl) {
        return res.status(400).json({ error: 'Invalid channel object structure' });
      }

      let history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
      // Remove duplicate of the same stream
      history = history.filter((h: any) => h.streamUrl !== channel.streamUrl && h.id !== channel.id);
      
      // Prepend newest item
      const historyItem = {
        ...channel,
        playedAt: new Date().toISOString()
      };
      history.unshift(historyItem);
      
      // Limit to last 25 items
      if (history.length > 25) {
        history = history.slice(0, 25);
      }

      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
      res.status(201).json(history);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add to history', details: error.message });
    }
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
