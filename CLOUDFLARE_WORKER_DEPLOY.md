# Cloudflare Worker Deployment Guide

## Deploy Your Free HLS Proxy Worker

### Prerequisites
- Node.js ≥ 18
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account (free tier)

### Step 1: Login to Cloudflare
```bash
wrangler login
```
This will open your browser to authenticate with Cloudflare.

### Step 2: Deploy the Worker
```bash
# From your project directory
wrangler deploy worker.js --name pro-tv-proxy
```

### Step 3: Get Your Worker URL
After deployment, Wrangler will show you your worker URL:
```
Published pro-tv-proxy (2.5 sec)
  https://pro-tv-proxy.YOUR-ACCOUNT.workers.dev
```

### Step 4: Update Your Application

Replace the placeholder URL in both files:

**In `public/app.js` (line 228):**
```javascript
const CLOUDFLARE_WORKER_URL = 'https://pro-tv-proxy.YOUR-ACCOUNT.workers.dev/?url=';
```

**In `src/components/VideoPlayer.tsx` (line 104):**
```javascript
const CLOUDFLARE_WORKER_URL = 'https://pro-tv-proxy.YOUR-ACCOUNT.workers.dev/?url=';
```

Replace `YOUR-ACCOUNT` with your actual Cloudflare account name.

### Step 5: Test the Proxy
```bash
# Test with a sample stream
curl "https://pro-tv-proxy.YOUR-ACCOUNT.workers.dev/?url=https://test-streams.mux.dev/x36xhg/main.m3u8"
```

## Worker Features

- **HLS Playlist Rewriting**: Automatically rewrites segment URLs in M3U8 files
- **CORS Support**: Full CORS headers for cross-origin requests
- **Binary Streaming**: Efficient streaming of TS segments
- **Security**: Protocol validation and SSRF protection
- **Performance**: Edge caching and streaming responses

## Free Tier Limits

- **100,000 requests/day** (plenty for streaming)
- **10ms CPU time/invocation** (sufficient for proxy operations)
- **Unlimited bandwidth**
- **Global edge network** (300+ locations)

## Custom Domain (Optional)

To use your own domain:

1. Add to `wrangler.worker.toml`:
```toml
routes = [
  { pattern = "proxy.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

2. Deploy again:
```bash
wrangler deploy worker.js --name pro-tv-proxy
```

3. Update your application URL to use your custom domain.

## Troubleshooting

### Worker returns 404
- Check the worker name matches deployment
- Verify the URL format: `https://worker-name.account.workers.dev/?url=ENCODED_URL`

### CORS errors
- The worker includes full CORS headers
- Check your browser console for specific errors

### Stream not playing
- Test the original stream URL directly
- Check Cloudflare Worker logs: `wrangler tail pro-tv-proxy`
- Verify the worker is rewriting URLs correctly

## Performance Tips

1. **Enable Cache**: The worker respects upstream cache headers
2. **Monitor Usage**: Check Cloudflare dashboard for request counts
3. **Scale**: Free tier handles 100K requests/day (upgrade if needed)

## Alternative: Quick Dashboard Deploy

If you prefer GUI over CLI:

1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages
3. Create Application → Create Worker
4. Name it `pro-tv-proxy`
5. Paste the contents of `worker.js`
6. Deploy
7. Use the provided URL in your application
