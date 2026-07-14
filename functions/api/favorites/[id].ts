export const onRequest = async (context: any) => {
  const { params, request } = context;
  const id = params.id;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Since workers are stateless, the frontend is our ultimate sync driver.
  // We return a success status, and the frontend also synchronizes in local storage.
  return new Response(JSON.stringify({ success: true, id }), { headers: corsHeaders });
};
