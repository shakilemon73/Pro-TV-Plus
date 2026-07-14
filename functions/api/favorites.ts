let favorites: any[] = [];

export const onRequest = async (context: any) => {
  const request = context.request;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === 'POST') {
    try {
      const channel = await request.json();
      if (!channel || !channel.id || !channel.name || !channel.streamUrl) {
        return new Response(JSON.stringify({ error: 'Invalid channel object structure' }), { status: 400, headers: corsHeaders });
      }

      const exists = favorites.some((f: any) => f.id === channel.id || f.streamUrl === channel.streamUrl);
      if (!exists) {
        favorites.push(channel);
      }
      return new Response(JSON.stringify(favorites), { status: 201, headers: corsHeaders });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: 'Failed to save favorite', details: error.message }), { status: 500, headers: corsHeaders });
    }
  }

  // GET
  return new Response(JSON.stringify(favorites), { headers: corsHeaders });
};
