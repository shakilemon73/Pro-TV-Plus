let history: any[] = [];

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
      if (!channel || !channel.name || !channel.streamUrl) {
        return new Response(JSON.stringify({ error: 'Invalid channel object structure' }), { status: 400, headers: corsHeaders });
      }

      // Remove duplicate
      history = history.filter((h: any) => h.streamUrl !== channel.streamUrl && h.id !== channel.id);

      const historyItem = {
        ...channel,
        playedAt: new Date().toISOString()
      };
      
      history.unshift(historyItem);

      if (history.length > 25) {
        history = history.slice(0, 25);
      }

      return new Response(JSON.stringify(history), { status: 201, headers: corsHeaders });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: 'Failed to save history', details: error.message }), { status: 500, headers: corsHeaders });
    }
  }

  // GET
  return new Response(JSON.stringify(history), { headers: corsHeaders });
};
