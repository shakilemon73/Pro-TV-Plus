// Cloudflare Pages Function — /api/download-apk
// 302-redirects to the Dropbox direct-download link.

const DROPBOX_APK =
  'https://www.dropbox.com/scl/fi/jqizyd1z758rq4fs5zpxu/protvplus.apk?rlkey=qsu1dt1fxg5vue17mgi4l7d9u&st=j2h9b0qa&dl=1';

export const onRequest = () => {
  return Response.redirect(DROPBOX_APK, 302);
};
