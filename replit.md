# PRO TV PLUS — Next-Gen IPTV Hub & EPG Client

A fully static HTML + vanilla JavaScript frontend with a Node.js/Express backend. No build step required — just `node server.js` and everything is served directly.

## How to run

```bash
node server.js
```

The workflow **"Start application"** runs this automatically on port **5000**.

## Architecture

```
server.js          → Express backend (API routes + static file serving)
public/
  index.html       → Full single-page application (HTML)
  style.css        → All styles (dark theme, glassmorphism, animations)
  app.js           → All frontend logic (HLS player, channel grid, M3U parser, etc.)
  images/          → App screenshot assets
  _redirects       → Cloudflare Pages SPA redirect rule
  og-image.jpg     → Open Graph image
```

## Backend API routes (server.js)

| Route | Description |
|---|---|
| `GET /api/proxy?url=<m3u8>` | HLS stream proxy — rewrites playlist URLs and pipes TS segments to bypass CORS/Mixed-Content |
| `GET /api/health` | Health check |
| `GET /api/app-update` | Fetches & caches app update JSON from GitHub (5 min TTL) |
| `GET /api/download-apk` | Proxies APK download from GitHub releases |

## Frontend features (public/app.js)

- **HLS.js player** loaded from CDN — proxy-aware, auto-retries, quality switching
- **15 preset channels** across Sports, Bangla, News, Hindi/Urdu, Movies, Kids
- **Category navigation** — filters channel grid instantly
- **EPG schedule grid** — shows now playing, progress bar, next programme
- **M3U Sandbox** — paste any M3U playlist and stream channels directly
- **APK download section** — QR code, progress simulation, version info from API
- **FAQ accordion**
- **Live viewer counter** — animated ticker
- **Download overlay** — animated circular progress

## No build step

The frontend uses:
- **HLS.js** via CDN (`cdn.jsdelivr.net`)
- **Lucide icons** via CDN (`unpkg.com/lucide`)
- **Google Fonts** via CDN (Archivo, Inter, JetBrains Mono)
- Pure vanilla JS (no React, no TypeScript, no bundler)

## User preferences

- Prefers vanilla HTML/CSS/JS frontend with Node.js/Express backend (no framework build steps)
