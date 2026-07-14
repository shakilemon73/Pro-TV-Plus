# PRO TV PLUS — Cloudflare Pages Deployment Guide

> **What runs where:**  
> | Layer | Technology | Runs on |
> |---|---|---|
> | Frontend | Plain HTML + CSS + JS (`public/`) | Cloudflare CDN (150+ PoPs) |
> | API routes | Pages Functions (`functions/api/`) | Cloudflare Workers runtime |
> | Dev server | Node.js Express (`server.js`) | Replit only — **not deployed** |

---

## 1. Prerequisites

| Tool | Install |
|---|---|
| Node.js ≥ 18 | https://nodejs.org |
| Wrangler CLI | `npm install -g wrangler` |
| Cloudflare account | https://dash.cloudflare.com (free tier is enough) |
| Git | any version |

---

## 2. Project Structure (what Cloudflare sees)

```
/
├── public/                  ← Static build output (served by CDN)
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   ├── _headers             ← Cloudflare cache + security headers
│   └── _redirects           ← SPA fallback / redirect rules
│
├── functions/               ← Cloudflare Pages Functions (Workers)
│   └── api/
│       ├── proxy.js         ← GET /api/proxy   — HLS stream proxy
│       ├── health.js        ← GET /api/health  — health check
│       ├── app-update.js    ← GET /api/app-update — update manifest
│       └── download-apk.js  ← GET /api/download-apk — APK redirect
│
├── wrangler.toml            ← Wrangler / Pages project config
└── server.js                ← Dev only (Replit) — ignored by Cloudflare
```

**Cloudflare Pages settings:**
- **Build command:** *(leave blank — no build step needed)*
- **Build output directory:** `public`
- **Functions directory:** `functions` *(auto-detected)*

---

## 3. Method A — Deploy via Cloudflare Dashboard (easiest)

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "ready for cloudflare"
git push origin main
```

### Step 2 — Create a Pages project

1. Open **https://dash.cloudflare.com**
2. Left sidebar → **Workers & Pages** → **Create**
3. Choose **Pages** tab → **Connect to Git**
4. Authorize GitHub, select your repo (`pro-tv-plus` or whatever it's called)
5. Click **Begin setup**

### Step 3 — Configure build settings

| Field | Value |
|---|---|
| Project name | `pro-tv-plus` (or any name) |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | *(blank)* |
| Build output directory | `public` |

Click **Save and Deploy**.

### Step 4 — Wait ~30 seconds

Cloudflare copies your `public/` files to the CDN and deploys your `functions/api/` as Workers. You'll get a URL like:

```
https://pro-tv-plus.pages.dev
```

---

## 4. Method B — Deploy via Wrangler CLI

```bash
# 1. Login
wrangler login

# 2. Create the project (first time only)
wrangler pages project create pro-tv-plus

# 3. Deploy
wrangler pages deploy public --project-name=pro-tv-plus
```

For subsequent deploys just run:

```bash
wrangler pages deploy public --project-name=pro-tv-plus
```

---

## 5. Custom Domain

1. Dashboard → your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter your domain (e.g. `protvplus.com`)
3. Cloudflare will show you nameserver or CNAME records to add
4. If your domain is **already on Cloudflare DNS**, the CNAME is added automatically — done in seconds
5. SSL is provisioned automatically (Let's Encrypt)

---

## 6. Environment Variables (if needed)

This project has **no required env vars** for the deployed version. If you add secrets later:

1. Dashboard → Pages project → **Settings** → **Environment variables**
2. Add key/value pairs for **Production** and/or **Preview**
3. They become available in Functions via `context.env.MY_VAR`

---

## 7. How the API Routes Work on Cloudflare

Each file in `functions/api/` maps directly to a URL path:

| File | URL | What it does |
|---|---|---|
| `functions/api/proxy.js` | `/api/proxy?url=...` | Proxies HLS streams, rewrites M3U8 segment URLs so the browser can load them cross-origin |
| `functions/api/health.js` | `/api/health` | Returns `{"status":"ok"}` — useful for uptime monitors |
| `functions/api/app-update.js` | `/api/app-update` | Fetches update manifest from GitHub, caches at the edge for 5 min |
| `functions/api/download-apk.js` | `/api/download-apk` | 302 redirect to Dropbox APK direct-download link |

The proxy is the most important one — when a viewer's browser is on `https://` and tries to load an `http://` stream, browsers block it (mixed content). The proxy runs on the same `https://` origin, so the request goes:

```
Browser (https) → /api/proxy → upstream http:// stream server
```

---

## 8. Caching Strategy

Defined in `public/_headers`:

| Resource | Cache |
|---|---|
| `index.html` | `no-cache` (always revalidate) |
| `app.js` | 5 min + stale-while-revalidate |
| `style.css` | 1 hour |
| `assets/*` | 1 year immutable |
| `/api/*` | `no-store` (never cached at CDN) |

---

## 9. Common Issues & Fixes

### ❌ "Functions not running" — API returns 404

**Cause:** Functions directory not detected.  
**Fix:** Make sure `functions/` is at the **repo root** (not inside `public/`). Cloudflare auto-detects it.

---

### ❌ "Mixed content blocked" — stream won't load over HTTPS

**Cause:** Stream URL is `http://` but the site is `https://`.  
**Fix:** Already handled — the player in `app.js` automatically routes `http://` streams through `/api/proxy` when on an `https://` page.

---

### ❌ "Could not resolve module" error in Functions

**Cause:** Functions cannot `import` npm packages the same way Node.js can.  
**Fix:** All four functions use only the built-in `fetch` and `Response` globals — no imports needed. Do not add `require('express')` etc.

---

### ❌ APK download not working

**Cause:** Dropbox `dl=0` parameter or expired share link.  
**Fix:** Update `DROPBOX_APK` in `functions/api/download-apk.js` and `public/app.js` with the new link. Make sure it ends with `dl=1`.

---

### ❌ Pages deploy succeeds but site shows old version

**Cause:** Browser cache.  
**Fix:** Hard-refresh (`Ctrl+Shift+R`). Cloudflare purges its CDN automatically on each deploy.

---

### ❌ `.ts` stream (like FS1) not playing

**Cause:** Some raw MPEG-TS streams need the proxy because they're on `http://`.  
**Fix:** Already handled via `mpegts.js` + the `/api/proxy` fallback in `app.js`.

---

## 10. Verifying the Deploy

After deploying, test each endpoint:

```bash
# Replace with your actual domain
BASE=https://pro-tv-plus.pages.dev

# Health check
curl $BASE/api/health
# Expected: {"status":"ok","runtime":"cloudflare-pages"}

# APK redirect (should 302 to Dropbox)
curl -I $BASE/api/download-apk
# Expected: HTTP/2 302  Location: https://www.dropbox.com/...

# Update manifest
curl $BASE/api/app-update
# Expected: JSON with versionCode, versionName, apkUrl, changelog

# Proxy a test stream (replace URL with any http:// .m3u8)
curl "$BASE/api/proxy?url=http://example.com/stream.m3u8"
# Expected: rewritten M3U8 playlist content
```

---

## 11. Continuous Deployment (auto-deploy on push)

Once connected to GitHub via Method A, **every `git push` to `main` triggers an automatic deploy** — no extra steps needed.

Preview deployments are also created for every pull request at:
```
https://<branch-name>.<project>.pages.dev
```

---

## 12. Free Tier Limits (Cloudflare Pages)

| Resource | Free limit |
|---|---|
| Requests/month | Unlimited |
| Bandwidth | Unlimited |
| Builds/month | 500 |
| Function invocations/day | 100,000 |
| Function CPU time/invocation | 10 ms (most proxy calls use < 1 ms) |
| Custom domains | Unlimited |

The HLS proxy function does light text rewriting — well within the 10 ms CPU budget per request. Binary `.ts` segment passthrough uses streaming (`response.body` pipe) so CPU time is minimal.

---

*Last updated: July 2026*
