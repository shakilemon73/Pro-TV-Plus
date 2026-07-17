// Cloudflare Pages Function — /api/download-apk
// 302-redirects to the Dropbox direct-download link.

const DROPBOX_APK =
  'https://www.dropbox.com/scl/fi/lcjf06lcq03dlbvnrl4jl/Pro-TV-Plus.apk?rlkey=6nip42uztf7k9r119hbho4opr&st=1ml1uoyu&dl=0';

export const onRequest = () => {
  return Response.redirect(DROPBOX_APK, 302);
};
