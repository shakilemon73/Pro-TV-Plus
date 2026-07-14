// Cloudflare Pages Function — /api/download-apk
// 302-redirects to the Dropbox direct-download link.

const DROPBOX_APK =
  'https://www.dropbox.com/scl/fi/y0rgfej2zu7dxtsp327oz/ProPlusTV.apk?rlkey=j4zb93tz1euyesqep4vxnbric&st=esvwmbwu&dl=1';

export const onRequest = () => {
  return Response.redirect(DROPBOX_APK, 302);
};
