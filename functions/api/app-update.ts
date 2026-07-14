export const onRequest = async (context: any) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const fallback = {
    versionCode: 100,
    versionName: '1.0.0',
    apkUrl: 'https://www.dropbox.com/scl/fi/jqizyd1z758rq4fs5zpxu/protvplus.apk?rlkey=qsu1dt1fxg5vue17mgi4l7d9u&st=u0te745i&dl=1',
    changelog: '• Performance improvements\n• Stability fixes'
  };

  try {
    const response = await fetch('https://github.com/shakilemon73/my-m3u-playlist/raw/refs/heads/main/app-update.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify(fallback), { headers: corsHeaders });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify(fallback), { headers: corsHeaders });
  }
};
