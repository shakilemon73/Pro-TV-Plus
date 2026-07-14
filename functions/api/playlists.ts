// In-memory playlists cache for the current worker instance
let playlists = [
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
];

function parseM3uData(text: string): any[] {
  const lines = text.split('\n');
  const channels: any[] = [];
  let currentItem: any = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      const commaIndex = line.lastIndexOf(',');
      const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unnamed Channel';

      const logoMatch = line.match(/tvg-logo="([^"]+)"/) || line.match(/logo="([^"]+)"/);
      const logo = logoMatch ? logoMatch[1] : undefined;

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

  // Handle POST - Save a new playlist
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { name, url, content } = body;
      if (!name) {
        return new Response(JSON.stringify({ error: 'Playlist name is required' }), { status: 400, headers: corsHeaders });
      }

      let m3uText = '';
      if (url) {
        const response = await fetch(url);
        if (!response.ok) {
          return new Response(JSON.stringify({ error: `Failed to fetch M3U from URL: ${response.statusText}` }), { status: 400, headers: corsHeaders });
        }
        m3uText = await response.text();
      } else if (content) {
        m3uText = content;
      } else {
        return new Response(JSON.stringify({ error: 'Either playlist M3U URL or raw text content is required' }), { status: 400, headers: corsHeaders });
      }

      const parsedChannels = parseM3uData(m3uText);
      if (parsedChannels.length === 0) {
        return new Response(JSON.stringify({ error: 'No valid streaming channels found in the provided M3U' }), { status: 400, headers: corsHeaders });
      }

      const newPlaylist = {
        id: 'pl-' + Math.random().toString(36).substring(2, 11),
        name: name,
        url: url || '',
        createdAt: new Date().toISOString(),
        channelsCount: parsedChannels.length,
        channels: parsedChannels
      };

      playlists.push(newPlaylist);

      return new Response(JSON.stringify({
        id: newPlaylist.id,
        name: newPlaylist.name,
        channelsCount: newPlaylist.channelsCount,
        createdAt: newPlaylist.createdAt
      }), { status: 201, headers: corsHeaders });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: 'Failed to save playlist', details: error.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Handle GET - Fetch all playlists (summary only)
  const summary = playlists.map((p: any) => ({
    id: p.id,
    name: p.name,
    url: p.url,
    createdAt: p.createdAt,
    channelsCount: p.channelsCount || (p.channels ? p.channels.length : 0)
  }));

  return new Response(JSON.stringify(summary), { headers: corsHeaders });
};
