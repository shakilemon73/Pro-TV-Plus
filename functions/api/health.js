// Cloudflare Pages Function — /api/health

export const onRequest = () => {
  return new Response(JSON.stringify({ status: 'ok', runtime: 'cloudflare-pages' }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
