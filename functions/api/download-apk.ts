export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url') || 'https://www.dropbox.com/scl/fi/jqizyd1z758rq4fs5zpxu/protvplus.apk?rlkey=qsu1dt1fxg5vue17mgi4l7d9u&st=u0te745i&dl=1';

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      // Graceful fallback redirect if remote fetch fails
      return Response.redirect(targetUrl, 302);
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.android.package-archive');
    headers.set('Content-Disposition', 'attachment; filename="app-release.apk"');
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(response.body, {
      status: response.status,
      headers: headers
    });
  } catch (error) {
    // Graceful fallback redirect on any connection/fetch error
    return Response.redirect(targetUrl, 302);
  }
};
