// Cloudflare Pages Function — /api/app-update
// Fetches the update manifest from GitHub and caches it at the edge for 5 minutes.

const UPDATE_URL =
  'https://github.com/shakilemon73/my-m3u-playlist/raw/refs/heads/main/app-update.json';

const FALLBACK = {
  versionCode: 100,
  versionName: '1.0.0',
  apkUrl:
    'https://www.dropbox.com/scl/fi/lcjf06lcq03dlbvnrl4jl/Pro-TV-Plus.apk?rlkey=6nip42uztf7k9r119hbho4opr&st=1ml1uoyu&dl=0',
  changelog: '• Performance improvements\n• Stability fixes',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export const onRequest = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Cache at Cloudflare edge for 5 minutes via Cache API
    const cache = caches.default;
    const cacheKey = new Request(UPDATE_URL);
    let cached = await cache.match(cacheKey);
    if (cached) {
      const data = await cached.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT', ...corsHeaders },
      });
    }

    const upstream = await fetch(UPDATE_URL, {
      headers: { 'User-Agent': 'PRO-TV-PLUS/1.0' },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!upstream.ok) throw new Error(`GitHub ${upstream.status}`);
    const data = await upstream.json();

    // Store in edge cache
    const toStore = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
    context.waitUntil(cache.put(cacheKey, toStore));

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify(FALLBACK), {
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'FALLBACK', ...corsHeaders },
    });
  }
};
