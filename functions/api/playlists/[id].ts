export const onRequest = async (context: any) => {
  const { params, request } = context;
  const id = params.id;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Define fallback demo playlist if id matches
  const demoPlaylist = {
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
  };

  if (request.method === 'DELETE') {
    // Return success response, the client will also update its local state/localStorage
    return new Response(JSON.stringify({ success: true, message: 'Playlist deleted successfully' }), { headers: corsHeaders });
  }

  if (id === 'demo-playlist') {
    return new Response(JSON.stringify(demoPlaylist), { headers: corsHeaders });
  }

  // Fallback for custom playlists, if dynamic persistence is not configured,
  // return 404 so the client-side localStorage fallback can supply the playlist!
  return new Response(JSON.stringify({ error: 'Playlist not found in Serverless Cache' }), { status: 404, headers: corsHeaders });
};
