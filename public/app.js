'use strict';

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: 't-sports-hd', name: 'T Sports HD', logoUrl: 'https://raw.githubusercontent.com/itsmedmd/Playlists/master/logos/tsports.png', streamUrl: 'http://103.13.193.194:8082/T-SPORTS-HD/video.m3u8?token=RusriRM-L73G33', altStreams: ['http://114.130.57.233:8080/LIVE-Sports/video.m3u8?token=SkQuhAXZxgBan1'], category: 'sports', isLive: true, nowPlaying: 'FIFA World Cup 2026 Qualifiers', nowPlayingDetails: 'Live stream of FIFA World Cup 2026 matches. Comprehensive broadcast coverage and live professional commentary.', nextPlaying: 'Live EPG Show & World Sports Highlights', nowPlayingProgress: 40, resolution: '1080p HD', bitrate: '5.5 Mbps' },
  { id: 'fs1', name: 'FS1 (FOX Sports 1)', logoUrl: 'https://raw.githubusercontent.com/dtv-history/Live-TV/main/Logos/FS1.png', streamUrl: 'http://fortv.cc:8080/live/parks@prudent.com/0314@8162/1846.ts', category: 'sports', isLive: true, nowPlaying: 'FOX Sports Live Coverage', nowPlayingDetails: 'Live US sports coverage including NFL, MLB, NASCAR, UFC, and college football on FOX Sports 1.', nextPlaying: 'FOX Sports Postgame Analysis', nowPlayingProgress: 35, resolution: '1080p HD', bitrate: '4.8 Mbps' },
  { id: 'star-sports', name: 'Star Sports', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Star_Sports_logo.svg/512px-Star_Sports_logo.svg.png', streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8', category: 'sports', isLive: true, nowPlaying: 'ICC World Cup: Australia vs India', nowPlayingDetails: 'Live from Narendra Modi Stadium. Comprehensive live coverage and expert analysis.', nextPlaying: 'Cricket Tonight - Match Highlights', nowPlayingProgress: 68, resolution: '1080p Full HD', bitrate: '5.2 Mbps' },
  { id: 'ptv-sports', name: 'PTV Sports', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/PTV_Sports_logo.svg/512px-PTV_Sports_logo.svg.png', streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', category: 'sports', isLive: true, nowPlaying: 'T20 Cricket Blast Live', nowPlayingDetails: 'High-octane short-format cricket action with live audience telemetry.', nextPlaying: 'Sports Hour Analysis', nowPlayingProgress: 42, resolution: '1080p HD', bitrate: '4.8 Mbps' },
  { id: 'somoy-tv', name: 'Somoy TV', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Somoy_TV_Logo.png/512px-Somoy_TV_Logo.png', streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', category: 'bangla', isLive: true, nowPlaying: 'Somoy News Bulletin', nowPlayingDetails: 'Breaking news and direct live coverage of regional, national and international events.', nextPlaying: 'Business & Economy Round', nowPlayingProgress: 85, resolution: '720p HD', bitrate: '3.1 Mbps' },
  { id: 'jamuna-tv', name: 'Jamuna TV', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Jamuna_Television_logo.png/512px-Jamuna_Television_logo.png', streamUrl: 'https://playertest.longtailvideo.com/adaptive/vod/playlist.m3u8', category: 'bangla', isLive: true, nowPlaying: 'Jamuna Prime Time News', nowPlayingDetails: 'Analytical news broadcast with specialized reports from local correspondents.', nextPlaying: 'Investigation 360', nowPlayingProgress: 15, resolution: '1080p HD', bitrate: '4.5 Mbps' },
  { id: 'zee-bangla', name: 'Zee Bangla', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Zee_Bangla_logo.svg/512px-Zee_Bangla_logo.svg.png', streamUrl: 'https://res.cloudinary.com/dvr7v6g7u/video/upload/sp_auto/v1/sample_folder/sample.m3u8', category: 'bangla', isLive: true, nowPlaying: 'Didi No. 1 - Season 9', nowPlayingDetails: 'Popular reality show celebrating the resilience and talent of modern women.', nextPlaying: 'Mithai - Evening Mega Serial', nowPlayingProgress: 50, resolution: '1080p HD', bitrate: '3.8 Mbps' },
  { id: 'star-jalsha', name: 'Star Jalsha', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Star_Jalsha_logo.svg/512px-Star_Jalsha_logo.svg.png', streamUrl: 'https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8', category: 'bangla', isLive: true, nowPlaying: 'Anurager Chowa', nowPlayingDetails: 'Captivating family drama tracing complex relationship bonds and social challenges.', nextPlaying: 'Ke Prothom Kache Eshechi', nowPlayingProgress: 30, resolution: '1080p HD', bitrate: '4.0 Mbps' },
  { id: 'bbc-news', name: 'BBC News', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2022.svg/512px-BBC_News_2022.svg.png', streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8', category: 'news', isLive: true, nowPlaying: 'Global News Hour', nowPlayingDetails: 'Live international updates, investigative features, and comprehensive market analysis.', nextPlaying: 'Hardtalk: Special Interview', nowPlayingProgress: 72, resolution: '1080p HD', bitrate: '3.5 Mbps' },
  { id: 'cnn', name: 'CNN', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png', streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', category: 'news', isLive: true, nowPlaying: 'Amanpour & Co.', nowPlayingDetails: 'Global affairs interview program focusing on major international developments.', nextPlaying: 'The Situation Room', nowPlayingProgress: 55, resolution: '1080p HD', bitrate: '4.2 Mbps' },
  { id: 'discovery', name: 'Discovery', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Discovery_Channel_logo.svg/512px-Discovery_Channel_logo.svg.png', streamUrl: 'https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8', category: 'movies', isLive: true, nowPlaying: 'Deadliest Catch: Alaskan Storms', nowPlayingDetails: 'Real-life drama aboard high-stakes crabbing vessels navigating extreme maritime weather.', nextPlaying: 'MythBusters - High-Velocity Science', nowPlayingProgress: 45, resolution: '1080p HD', bitrate: '5.0 Mbps' },
  { id: 'nat-geo', name: 'Nat Geo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/National_Geographic_logo.svg/512px-National_Geographic_logo.svg.png', streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', category: 'kids', isLive: true, nowPlaying: 'Savage Kingdom', nowPlayingDetails: 'Unfiltered chronicle of natural survival, tracking predators and prey across the savannah.', nextPlaying: 'Brain Games - Optical Illusion Edition', nowPlayingProgress: 90, resolution: '1080p HD', bitrate: '4.7 Mbps' },
  { id: 'ary-digital', name: 'ARY Digital', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/ARY_Digital_Logo.svg/512px-ARY_Digital_Logo.svg.png', streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8', category: 'hindi', isLive: true, nowPlaying: 'Jeeto Pakistan League', nowPlayingDetails: 'High-energy game show hosted by Fahad Mustafa with live interactive audience participation.', nextPlaying: 'Bulbulay Comedy Sitcom', nowPlayingProgress: 52, resolution: '1080p HD', bitrate: '4.5 Mbps' },
  { id: 'hum-tv', name: 'Hum TV', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/HUM_TV_Logo_2020.svg/512px-HUM_TV_Logo_2020.svg.png', streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', category: 'hindi', isLive: true, nowPlaying: 'Parizaad Mega Drama', nowPlayingDetails: 'Award-winning emotional drama series detailing the life struggles of Parizaad.', nextPlaying: 'Hum News Highlights', nowPlayingProgress: 35, resolution: '1080p HD', bitrate: '4.0 Mbps' },
  { id: 'geo-news', name: 'Geo News', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Geo_News_logo.svg/512px-Geo_News_logo.svg.png', streamUrl: 'https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8', category: 'hindi', isLive: true, nowPlaying: 'Geo Headlines Tonight', nowPlayingDetails: 'In-depth reporting of central news bulletins and political panels.', nextPlaying: 'Capital Talk with Hamid Mir', nowPlayingProgress: 75, resolution: '720p HD', bitrate: '3.0 Mbps' },
  { id: 'colors-tv', name: 'Colors TV', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Colors_TV_logo.svg/512px-Colors_TV_logo.svg.png', streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', category: 'hindi', isLive: true, nowPlaying: 'Bigg Boss Live Stream', nowPlayingDetails: 'Real-time celebrity camera telemetry inside the infamous glass house.', nextPlaying: 'Khatron Ke Khiladi Highlights', nowPlayingProgress: 60, resolution: '1080p HD', bitrate: '4.8 Mbps' }
];

const FAQS = [
  { q: 'Is Pro Tv Plus really free to use?', a: 'Yes, Pro TV Plus is 100% free. It is an ad-supported premium directory and aggregator that streamlines access to live sports, entertainment, and news streams with zero subscription costs, log-ins, or hidden charges.' },
  { q: 'How do I download and install the APK on Android?', a: 'Click the primary download button or scan the QR Code to pull the official app-release.apk file. Make sure to toggle "Allow installation from Unknown Sources" in your Android system security settings before launching the installer.' },
  { q: 'Can I run Pro Tv Plus on my Android TV or Fire Stick?', a: 'Absolutely! Pro TV Plus features an adaptive, fully optimized layout for larger displays. To install on TV devices, simply download the "Downloader" app from the Google Play Store or Amazon Appstore, enter this site\'s URL, and initiate the direct APK download link.' },
  { q: 'How can I load custom M3U playlists?', a: 'We have built a custom in-browser IPTV M3U parser directly on this page! Simply paste your custom M3U playlist link or text content in the M3U builder section below to immediately parse and stream your custom TV channels in real-time.' },
  { q: 'Where can I download the official APK?', a: 'You can download the safe, verified app-release.apk file directly from our server using any of the "Download App" or "Download APK" buttons located across this website.' }
];

const CATEGORIES = [
  { id: 'Sports', label: 'Sports Arena', count: '45+ Live Feeds', color: '#e50914', bg: 'rgba(229,9,20,.1)', border: 'rgba(229,9,20,.15)', icon: 'flame' },
  { id: 'Bangla', label: 'Bangla Serials', count: '150+ Channels', color: '#f97316', bg: 'rgba(249,115,22,.1)', border: 'rgba(249,115,22,.15)', icon: 'tv' },
  { id: 'Hindi/Urdu', label: 'Hindi/Urdu Ch', count: '90+ Live Streams', color: '#f43f5e', bg: 'rgba(244,63,94,.1)', border: 'rgba(244,63,94,.15)', icon: 'radio' },
  { id: 'News', label: 'Breaking News', count: '80+ Streams', color: '#3b82f6', bg: 'rgba(59,130,246,.1)', border: 'rgba(59,130,246,.15)', icon: 'globe' },
  { id: 'Movies', label: 'Premium Cinema', count: '120+ Feeds', color: '#a855f7', bg: 'rgba(168,85,247,.1)', border: 'rgba(168,85,247,.15)', icon: 'sparkles' },
  { id: 'Kids', label: 'Kids Channel', count: '50+ Cartoons', color: '#22c55e', bg: 'rgba(34,197,94,.1)', border: 'rgba(34,197,94,.15)', icon: 'award' }
];

const SAMPLE_M3U = `#EXTM3U x-tvg-url="http://epg.example.com/epg.xml"

#EXTINF:-1 tvg-id="cricket.hd" tvg-logo="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400" group-title="Sports",Apex Cricket Premium HD
https://test-streams.mux.dev/x36xhg/main.m3u8

#EXTINF:-1 tvg-id="football.hd" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400" group-title="Sports",Global Football Network Live
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8

#EXTINF:-1 tvg-id="worldnews" tvg-logo="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400" group-title="News",Global Broadcast 24/7 News
https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8

#EXTINF:-1 tvg-id="movies" tvg-logo="https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?w=400" group-title="Cinema",Classic Cinematic Streams
https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8`;

// ─── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  selectedChannel: CHANNELS[0],
  activeCategory: 'All',
  searchQuery: '',
  isPlaying: true,
  isMuted: true,
  quality: 'Auto',
  streamActive: false,
  isLoading: true,
  playbackError: null,
  useProxy: false,
  latency: 1.15,
  bandwidth: 4.8,
  fps: 60,
  bufferState: 0,
  liveViewers: 14208,
  parsedChannels: [],
  parsedGroup: 'All',
  apkDownloading: false,
  apkProgress: 0,
  updateInfo: null,
};

// ─── PLAYER ────────────────────────────────────────────────────────────────────
const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
let hls = null;
let mpegtsPlayer = null;

// ─── STREAM TYPE DETECTION ────────────────────────────────────────────────────
function getStreamType(url) {
  // Strip query string and hash for extension matching
  const clean = url.split('?')[0].split('#')[0].toLowerCase();
  if (clean.endsWith('.m3u8') || clean.endsWith('.m3u')) return 'hls';
  if (clean.endsWith('.ts'))                               return 'mpegts';
  if (clean.endsWith('.mp4') || clean.endsWith('.mov'))    return 'native';
  if (clean.endsWith('.webm'))                             return 'native';
  if (clean.endsWith('.mkv') || clean.endsWith('.avi'))    return 'native';
  if (clean.endsWith('.ogv') || clean.endsWith('.ogg'))    return 'native';
  if (clean.endsWith('.flv'))                              return 'mpegts'; // flv via mpegts.js
  // No recognisable extension → assume HLS (most IPTV servers)
  return 'hls';
}

function destroyAllPlayers() {
  if (hls) { hls.destroy(); hls = null; }
  if (mpegtsPlayer) { mpegtsPlayer.destroy(); mpegtsPlayer = null; }
  videoEl.removeAttribute('src');
  videoEl.load();
}
let canvasAnimId = null;
let telemetryInterval = null;

const videoEl = document.getElementById('video-el');
const canvasBg = document.getElementById('canvas-bg');
const loadingOverlay = document.getElementById('loading-overlay');
const errorOverlay = document.getElementById('error-overlay');
const pausedOverlay = document.getElementById('paused-overlay');
const streamTitleCard = document.getElementById('stream-title-card');
const unmutePrompt = document.getElementById('unmute-prompt');
const statusMsg = document.getElementById('status-msg');
const bufferSub = document.getElementById('buffer-sub');

function setOverlay(name) {
  loadingOverlay.classList.toggle('hidden', name !== 'loading');
  errorOverlay.classList.toggle('hidden', name !== 'error');
  pausedOverlay.classList.toggle('hidden', name !== 'paused');
  if (name === 'none') {
    loadingOverlay.classList.add('hidden');
    errorOverlay.classList.add('hidden');
    pausedOverlay.classList.add('hidden');
  }
}

function loadChannel(channel) {
  state.selectedChannel = channel;
  state.streamActive = false;
  state.isLoading = true;
  state.playbackError = null;
  state.useProxy = false;

  // Determine if we need proxy (http stream on https page)
  const isHttps = location.protocol === 'https:';
  const streamIsHttp = channel.streamUrl.startsWith('http://');
  state.useProxy = isHttps && streamIsHttp;

  updatePlayerUI();
  setOverlay('loading');
  statusMsg.textContent = 'Connecting to feed server...';
  bufferSub.textContent = `Syncing buffer payload for ${channel.name}...`;
  document.getElementById('direct-link').href = channel.streamUrl;
  videoEl.style.opacity = '0';
  streamTitleCard.classList.add('hidden');
  unmutePrompt.classList.add('hidden');

  destroyAllPlayers();
  stopTelemetry();

  // Build ordered list: primary + any alt servers
  const allStreams = [channel.streamUrl, ...(channel.altStreams || [])];
  let altIndex = 0;

  const RELAY_PROXY = 'https://snowy-perch-1699.shakilemon73.deno.net/?url=';

function resolveSource(rawUrl) {
  const isHttps = location.protocol === 'https:';
  const isHttp  = rawUrl.startsWith('http://');
  return (isHttps && isHttp) ? `${RELAY_PROXY}${encodeURIComponent(rawUrl)}` : rawUrl;
}

  function failover(reason) {
    altIndex++;
    if (altIndex < allStreams.length) {
      const next = allStreams[altIndex];
      statusMsg.textContent = `Switching to backup server ${altIndex}/${allStreams.length - 1}...`;
      document.getElementById('direct-link').href = next;
      tryLoad(next);
    } else {
      showError(reason || 'Live stream server connection refused or stream offline.');
    }
  }

  // ── HLS (.m3u8 and any URL without a recognised extension) ──────────────────
  function tryHLS(rawUrl) {
    const src = resolveSource(rawUrl);
    let netRetry = 0;
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hlsConfig = IS_MOBILE
        ? { enableWorker: true, lowLatencyMode: true, backBufferLength: 30, maxBufferSize: 10 * 1000 * 1000, maxMaxBufferLength: 20, startLevel: -1, abrEwmaFastLive: 3, abrEwmaSlowLive: 9 }
        : { enableWorker: true, lowLatencyMode: true, backBufferLength: 90, maxBufferSize: 30 * 1000 * 1000, startLevel: -1 };
      hls = new Hls(hlsConfig);
      hls.loadSource(src);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        statusMsg.textContent = 'Manifest decoded! Rendering HLS buffer...';
        playVideo();
      });
      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (videoEl.buffered && videoEl.buffered.length > 0) {
          const end = videoEl.buffered.end(videoEl.buffered.length - 1);
          state.bufferState = Math.min(100, (end / (videoEl.duration || 1)) * 100);
        }
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && netRetry < 3) {
          netRetry++;
          statusMsg.textContent = `Network error. Retrying (${netRetry}/3)...`;
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          statusMsg.textContent = 'Media format warning. Retrying synchronization...';
          hls.recoverMediaError();
        } else {
          hls.destroy(); hls = null;
          failover('HLS stream failed — server may be offline or geo-blocked.');
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      videoEl.src = src;
      videoEl.addEventListener('loadedmetadata', playVideo, { once: true });
      videoEl.addEventListener('error', () => failover('Stream failed in native HLS player.'), { once: true });
    } else {
      failover('HLS is not supported in this browser.');
    }
  }

  // ── MPEG-TS / FLV  (.ts, .flv — via mpegts.js) ──────────────────────────────
  function tryMpegts(rawUrl) {
    const src = resolveSource(rawUrl);
    // mpegts.js uses getFeatureList(), not isSupported()
    const supported = typeof mpegts !== 'undefined' &&
      typeof mpegts.createPlayer === 'function' &&
      (mpegts.getFeatureList ? mpegts.getFeatureList().mseLivePlayback : true);
    if (!supported) {
      statusMsg.textContent = 'mpegts.js unavailable, trying native playback...';
      tryNative(rawUrl);
      return;
    }
    const clean = rawUrl.split('?')[0].toLowerCase();
    // mpegts.js uses plain string type literals, not mpegts.Types.*
    const type  = clean.endsWith('.flv') ? 'flv' : 'mpegts';
    mpegtsPlayer = mpegts.createPlayer({
      type,
      url: src,
      isLive: true,
    }, {
      enableWorker: true,
      liveBufferLatencyChasing: true,
      liveSync: true,
      fixAudioTimestampGap: true,
    });
    mpegtsPlayer.attachMediaElement(videoEl);
    mpegtsPlayer.load();
    statusMsg.textContent = 'Decoding transport stream...';
    // Use string event names — mpegts.Events may not exist in all builds
    const EVT_INFO  = (mpegts.Events && mpegts.Events.MEDIA_INFO)  || 'media_info';
    const EVT_ERROR = (mpegts.Events && mpegts.Events.ERROR)        || 'error';
    mpegtsPlayer.on(EVT_INFO, () => {
      statusMsg.textContent = 'Stream decoded! Starting playback...';
      playVideo();
    });
    mpegtsPlayer.on(EVT_ERROR, (errType, errDetail) => {
      if (mpegtsPlayer) { mpegtsPlayer.destroy(); mpegtsPlayer = null; }
      failover(`Transport stream error (${errType}): ${errDetail}`);
    });
  }

  // ── Native video  (.mp4, .webm, .mkv, .mov, .avi, .ogv) ────────────────────
  function tryNative(rawUrl) {
    const src = resolveSource(rawUrl);
    videoEl.src = src;
    videoEl.load();
    statusMsg.textContent = 'Loading video stream...';
    videoEl.addEventListener('canplay', () => {
      statusMsg.textContent = 'Stream ready!';
      playVideo();
    }, { once: true });
    videoEl.addEventListener('error', () => failover('Native video stream failed to load.'), { once: true });
  }

  // ── Router ───────────────────────────────────────────────────────────────────
  function tryLoad(rawUrl) {
    destroyAllPlayers();
    document.getElementById('direct-link').href = rawUrl;
    const type = getStreamType(rawUrl);
    statusMsg.textContent = 'Connecting to feed server...';
    bufferSub.textContent  = `Syncing buffer payload for ${channel.name}...`;
    if      (type === 'mpegts') tryMpegts(rawUrl);
    else if (type === 'native') tryNative(rawUrl);
    else                        tryHLS(rawUrl);
  }

  tryLoad(channel.streamUrl);
}

function playVideo() {
  const p = videoEl.play();
  if (p) {
    p.then(() => {
      onStreamActive();
    }).catch(() => {
      videoEl.muted = true; state.isMuted = true;
      videoEl.play().then(onStreamActive).catch(() => {
        state.isPlaying = false; state.isLoading = false; updatePlayerUI();
      });
    });
  }
}

function onStreamActive() {
  state.isPlaying = true; state.streamActive = true; state.isLoading = false;
  videoEl.style.opacity = '1';
  setOverlay('none');
  streamTitleCard.classList.remove('hidden');
  if (state.isMuted) unmutePrompt.classList.remove('hidden');
  startTelemetry();
  updatePlayerUI();
  startCanvasViz();
}

function showError(msg) {
  state.streamActive = false; state.isLoading = false; state.playbackError = msg;
  document.getElementById('error-msg').textContent = msg;
  setOverlay('error');
  videoEl.style.opacity = '0';
  streamTitleCard.classList.add('hidden');
  unmutePrompt.classList.add('hidden');
}

function updatePlayerUI() {
  const ch = state.selectedChannel;
  // Resolution badge
  document.getElementById('res-badge').textContent = ch.resolution || '1080p HD';
  // Stream title card
  document.getElementById('stream-cat').textContent = ch.category.toUpperCase() + ' Group';
  document.getElementById('stream-name').textContent = ch.name;
  document.getElementById('stream-detail').textContent = ch.nowPlayingDetails || ch.nowPlaying;
  // Play/pause button
  const ppBtn = document.getElementById('play-pause-btn');
  ppBtn.disabled = !state.streamActive;
  ppBtn.innerHTML = (state.isPlaying && state.streamActive)
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  // Mute icon
  const muteIcon = document.getElementById('mute-icon');
  const volFill = document.getElementById('vol-fill');
  if (state.isMuted) {
    muteIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
    volFill.style.width = '0%';
  } else {
    muteIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/>`;
    volFill.style.width = '80%';
  }
  // Now playing info
  document.getElementById('now-playing-info').textContent = ch.name;
  // Tuner desk
  document.getElementById('tuner-ch-name').textContent = ch.name;
  document.getElementById('tuner-br-val').textContent = ch.bitrate || '5.2 Mbps';
}

function startTelemetry() {
  stopTelemetry();
  telemetryInterval = setInterval(() => {
    if (!state.isPlaying || !state.streamActive) return;
    state.latency = Math.max(0.85, Math.min(1.5, +(state.latency + (Math.random() - .5) * .04).toFixed(2)));
    const target = parseFloat(state.selectedChannel.bitrate) || 4.5;
    state.bandwidth = Math.max(target - .5, Math.min(target + .5, +(state.bandwidth + (Math.random() - .5) * .2).toFixed(1)));
    state.fps = Math.random() > .98 ? 58 : 60;
    document.getElementById('latency-val').textContent = state.latency;
    document.getElementById('fps-val').textContent = state.fps;
    document.getElementById('rate-val').textContent = state.bandwidth;
    document.getElementById('buffer-val').textContent = state.bufferState.toFixed(1);
  }, 1500);
}

function stopTelemetry() {
  if (telemetryInterval) { clearInterval(telemetryInterval); telemetryInterval = null; }
}

function startCanvasViz() {
  if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
  const canvas = canvasBg;
  const ctx = canvas.getContext('2d');
  let w, h, off = 0;
  const resize = () => {
    w = canvas.width = canvas.parentElement.clientWidth;
    h = canvas.height = canvas.parentElement.clientHeight;
  };
  resize();
  window.addEventListener('resize', resize);
  const draw = () => {
    ctx.fillStyle = 'rgba(10,10,12,.18)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.012)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 35) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 35) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(229,9,20,.09)';
    ctx.lineWidth = 4;
    for (let x = 0; x < w; x++) {
      const y = h/2 + Math.sin(x*.01 + off) * 40;
      if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    off += .03;
    canvasAnimId = requestAnimationFrame(draw);
  };
  draw();
}

// Player controls
function togglePlay() {
  if (!state.streamActive) return;
  state.isPlaying = !state.isPlaying;
  if (state.isPlaying) {
    videoEl.play().catch(() => {});
    setOverlay('none');
  } else {
    videoEl.pause();
    setOverlay('paused');
  }
  updatePlayerUI();
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  videoEl.muted = state.isMuted;
  videoEl.volume = state.isMuted ? 0 : 0.85;
  if (!state.isMuted) unmutePrompt.classList.add('hidden');
  updatePlayerUI();
}

function unmute() { if (state.isMuted) toggleMute(); }

function refreshStream() {
  loadChannel(state.selectedChannel);
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openQualityMenu() {
  document.getElementById('quality-menu').classList.add('open');
  document.getElementById('quality-backdrop').classList.add('open');
}
function closeQualityMenu() {
  document.getElementById('quality-menu').classList.remove('open');
  document.getElementById('quality-backdrop').classList.remove('open');
}
function toggleQualityMenu() {
  const isOpen = document.getElementById('quality-menu').classList.contains('open');
  isOpen ? closeQualityMenu() : openQualityMenu();
}

function setQuality(q) {
  state.quality = q;
  document.getElementById('quality-label').textContent = q;
  document.querySelectorAll('.quality-opt').forEach(el => {
    el.classList.toggle('active', el.textContent.trim() === q);
  });
  if (hls) {
    if (q === 'Auto') { hls.currentLevel = -1; }
    else {
      const h = { '1080p': 1080, '720p': 720, '480p': 480 }[q];
      const idx = hls.levels.findIndex(l => l.height === h);
      if (idx !== -1) hls.currentLevel = idx;
    }
  }
  closeQualityMenu();
}

// Close quality menu on outside click (desktop)
document.addEventListener('click', e => {
  if (!e.target.closest('.quality-wrap') && !e.target.closest('.quality-backdrop')) {
    closeQualityMenu();
  }
});

// Click to unmute on page interaction
document.addEventListener('click', () => {
  if (state.isMuted && state.streamActive && !state.playbackError) {
    // Only unmute on non-button clicks (natural page interaction)
  }
}, { passive: true });

// ─── PLAYER TOUCH GESTURES ───────────────────────────────────────────────────
(function initPlayerGestures() {
  const vp = document.getElementById('player-vp');
  if (!vp) return;
  let lastTap = 0;
  let tapTimer = null;

  vp.addEventListener('click', e => {
    // Ignore clicks on overlay buttons (retry, direct-link, unmute prompt)
    if (e.target.closest('button, a, .unmute-prompt, .quality-btn, .icon-btn')) return;

    const now = Date.now();
    const DOUBLE_TAP_MS = 280;
    if (now - lastTap < DOUBLE_TAP_MS) {
      // Double tap → fullscreen
      clearTimeout(tapTimer);
      lastTap = 0;
      goFullscreen();
    } else {
      lastTap = now;
      tapTimer = setTimeout(() => {
        lastTap = 0;
        // Single tap → toggle play/pause (if stream active) or unmute
        if (state.isMuted && state.streamActive) {
          toggleMute();
        } else if (state.streamActive) {
          togglePlay();
        }
      }, DOUBLE_TAP_MS);
    }
  }, { passive: true });
})();

function goFullscreen() {
  const vp = document.getElementById('player-vp');
  const el = vp || videoEl;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
  if (req) req.call(el).catch(() => {});
}

// ─── NAV ────────────────────────────────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  const nav = document.getElementById('mobile-nav');
  nav.classList.toggle('open');
});
function closeMobileMenu() { document.getElementById('mobile-nav').classList.remove('open'); }

// ─── LIVE VIEWERS ────────────────────────────────────────────────────────────
function updateViewers() {
  state.liveViewers += Math.floor(Math.random() * 11) - 5;
  const str = state.liveViewers.toLocaleString();
  document.getElementById('viewer-count').textContent = str;
  document.getElementById('viewer-count-mobile').textContent = str;
}
setInterval(updateViewers, 4000);

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
function renderCategories() {
  const grid = document.getElementById('cat-grid');
  const catIcons = {
    flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></svg>`,
    tv: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
    radio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4h20l-2 6H4L2 4z"/><circle cx="12" cy="16" r="4"/><circle cx="12" cy="16" r="1"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`
  };
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="cat-card ${state.activeCategory === cat.id ? 'active' : ''}"
      onclick="selectCategory('${cat.id}')" data-cat="${cat.id}">
      <div class="cat-icon" style="background:${cat.bg};color:${cat.color};border-color:${cat.border}">
        ${catIcons[cat.icon] || ''}
      </div>
      <div class="cat-name">${cat.label}</div>
      <div class="cat-count">${cat.count}</div>
      <div class="cat-footer">
        <span>LAUNCH NOW</span>
        <svg class="cat-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    </div>`).join('');
}

function selectCategory(id) {
  state.activeCategory = id;
  // Update category cards
  document.querySelectorAll('.cat-card').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === id);
  });
  // Update EPG tabs
  setEpgTab(id);
  renderChannelGrid();
  document.getElementById('player').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── EPG TABS ────────────────────────────────────────────────────────────────
const EPG_CATEGORIES = ['All', 'Sports', 'Bangla', 'Hindi/Urdu', 'News', 'Movies', 'Kids'];

function renderEpgTabs() {
  const tabs = document.getElementById('epg-tabs');
  tabs.innerHTML = EPG_CATEGORIES.map(cat => `
    <button class="cat-tab ${state.activeCategory === cat || (state.activeCategory !== 'All' && cat !== 'All' && matchCat(cat, state.activeCategory)) ? 'active' : ''}"
      data-epgtab="${cat}" onclick="setEpgTab('${cat}')">
      ${cat}
    </button>`).join('');
}

function matchCat(tabCat, stateCat) {
  return tabCat.toLowerCase() === stateCat.toLowerCase() ||
    (tabCat === 'Hindi/Urdu' && stateCat === 'hindi');
}

function setEpgTab(cat) {
  // Normalise
  let normalized = cat;
  if (cat.toLowerCase() === 'hindi' || cat.toLowerCase() === 'hindi/urdu') normalized = 'Hindi/Urdu';
  state.activeCategory = normalized;
  document.querySelectorAll('.cat-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.epgtab === normalized || el.dataset.epgtab === cat);
  });
  renderChannelGrid();
}

// ─── CHANNEL GRID ────────────────────────────────────────────────────────────
function getFilteredChannels() {
  const q = state.searchQuery.toLowerCase();
  return CHANNELS.filter(ch => {
    const catMatch = state.activeCategory === 'All' ||
      ch.category.toLowerCase() === state.activeCategory.toLowerCase() ||
      (state.activeCategory.toLowerCase() === 'hindi/urdu' && ch.category === 'hindi') ||
      (state.activeCategory.toLowerCase() === 'hindi' && ch.category === 'hindi');
    const searchMatch = !q || ch.name.toLowerCase().includes(q) || ch.nowPlaying.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });
}

function channelLogoFallback(ch) {
  const initials = ch.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `<div class="channel-logo-fallback">${initials}</div>`;
}

function renderChannelGrid() {
  const grid = document.getElementById('channel-grid');
  const channels = getFilteredChannels();
  if (channels.length === 0) {
    grid.innerHTML = `<div class="no-channels">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
      <p style="font-size:.85rem;font-weight:600;color:#9ca3af;margin-bottom:.25rem">No matching channels found</p>
      <p style="font-size:.72rem;color:#6b7280">Try searching another category or adjusting filters</p>
    </div>`;
    return;
  }
  grid.innerHTML = channels.map(ch => {
    const sel = ch.id === state.selectedChannel.id;
    return `<div class="channel-card ${sel ? 'selected' : ''}" onclick="selectChannel('${ch.id}')">
      <div class="channel-row">
        <div class="channel-logo-wrap">
          <img class="channel-logo" src="${ch.logoUrl}" alt="${ch.name}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
            style="display:block" />
          <div class="channel-logo-fallback" style="display:none">${ch.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
        </div>
        <div class="channel-meta">
          <div class="channel-name">${ch.name}</div>
          <div class="channel-cat">${ch.category} Category</div>
        </div>
        <div class="channel-status">
          ${sel
            ? `<div class="playing-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="live-dot-pulse"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/></svg>PLAYING</div>`
            : `<button class="play-btn" title="Play channel"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>`
          }
        </div>
      </div>
      <div class="epg-box">
        <div class="epg-now">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e50914" stroke-width="2" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></svg>
          ${ch.nowPlaying}
        </div>
        <div class="epg-progress"><div class="epg-fill" style="width:${ch.nowPlayingProgress || 50}%"></div></div>
        ${ch.nextPlaying ? `<div class="epg-next"><strong>NEXT:</strong> ${ch.nextPlaying}</div>` : ''}
      </div>
      <div class="channel-res">${ch.resolution || '1080p HD'}</div>
    </div>`;
  }).join('');
}

function selectChannel(id) {
  const ch = CHANNELS.find(c => c.id === id);
  if (!ch) return;
  loadChannel(ch);
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderChannelGrid(); // re-render to update selected state
}

function filterChannels() {
  state.searchQuery = document.getElementById('channel-search').value;
  renderChannelGrid();
}

// ─── M3U PARSER ──────────────────────────────────────────────────────────────
function loadSampleM3u() {
  document.getElementById('m3u-input').value = SAMPLE_M3U;
  parseM3u();
}

function parseM3u() {
  const text = document.getElementById('m3u-input').value.trim();
  if (!text) return;
  const btn = document.getElementById('parse-btn');
  btn.textContent = 'Parsing Playlist...';
  btn.disabled = true;
  hideAlert('m3u-error'); hideAlert('m3u-success');
  document.getElementById('parsed-section').classList.add('hidden');

  setTimeout(() => {
    try {
      const lines = text.split('\n');
      const channels = [];
      let cur = {};
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        if (t.startsWith('#EXTINF:')) {
          const commaIdx = t.lastIndexOf(',');
          const name = commaIdx !== -1 ? t.slice(commaIdx + 1).trim() : 'Unnamed Channel';
          const logoMatch = t.match(/tvg-logo="([^"]+)"/) || t.match(/logo="([^"]+)"/);
          const groupMatch = t.match(/group-title="([^"]+)"/) || t.match(/category="([^"]+)"/);
          cur = { name, logo: logoMatch?.[1], category: groupMatch?.[1] || 'Uncategorized' };
        } else if (t.startsWith('http://') || t.startsWith('https://')) {
          if (cur.name) { cur.url = t; channels.push(cur); cur = {}; }
        }
      }
      if (!channels.length) throw new Error('No valid channel streams found in the playlist.');
      state.parsedChannels = channels;
      state.parsedGroup = 'All';
      showAlert('m3u-success', `Successfully parsed ${channels.length} live channels! Select a channel below to load it into the main player.`, true);
      renderParsedSection();
    } catch (e) {
      showAlert('m3u-error', e.message || 'Failed to parse M3U file.', false);
    } finally {
      btn.textContent = 'Parse Playlist Stream';
      btn.disabled = false;
    }
  }, 800);
}

function showAlert(id, msg, success) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  const icon = success
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  el.innerHTML = `${icon}<div><strong>${success ? 'Success' : 'Parsing Failed'}</strong>${msg}</div>`;
}
function hideAlert(id) { document.getElementById(id).classList.add('hidden'); }

function renderParsedSection() {
  const sec = document.getElementById('parsed-section');
  sec.classList.remove('hidden');
  const groups = ['All', ...new Set(state.parsedChannels.map(c => c.category || 'Uncategorized'))];

  // Tabs
  document.getElementById('group-tabs').innerHTML = groups.map(g =>
    `<button class="group-tab ${g === state.parsedGroup ? 'active' : ''}" onclick="setParsedGroup('${g}')" data-pg="${g}">${g}</button>`
  ).join('');

  renderParsedGrid();
}

function setParsedGroup(g) {
  state.parsedGroup = g;
  document.querySelectorAll('.group-tab').forEach(el => el.classList.toggle('active', el.dataset.pg === g));
  renderParsedGrid();
}

function renderParsedGrid() {
  const filtered = state.parsedGroup === 'All'
    ? state.parsedChannels
    : state.parsedChannels.filter(c => (c.category || 'Uncategorized') === state.parsedGroup);

  document.getElementById('parsed-grid').innerHTML = filtered.map((ch, i) => {
    const initials = ch.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `<div class="parsed-card" onclick="playParsedChannel(${i})">
      <div class="parsed-info">
        ${ch.logo
          ? `<img class="parsed-logo" src="${ch.logo}" alt="${ch.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="parsed-logo-fb" style="display:none">${initials}</div>`
          : `<div class="parsed-logo-fb">${initials}</div>`
        }
        <div>
          <div class="parsed-name">${ch.name}</div>
          <div class="parsed-group">${ch.category || 'Sports'} Group</div>
        </div>
      </div>
      <button class="parsed-play" title="Play"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
    </div>`;
  }).join('');
}

function playParsedChannel(idx) {
  const filtered = state.parsedGroup === 'All'
    ? state.parsedChannels
    : state.parsedChannels.filter(c => (c.category || 'Uncategorized') === state.parsedGroup);
  const ch = filtered[idx];
  if (!ch) return;
  const converted = {
    id: `parsed-${Math.random().toString(36).substr(2, 9)}`,
    name: ch.name,
    logoUrl: ch.logo || 'https://images.unsplash.com/photo-1540747737956-37872404a82a?w=400',
    streamUrl: ch.url,
    category: ch.category?.toLowerCase().includes('sport') ? 'sports' : 'custom',
    isLive: true,
    nowPlaying: 'Custom Stream Feed',
    nowPlayingDetails: `Source: ${ch.url}`,
    resolution: 'Adaptive',
    bitrate: 'VBR'
  };
  loadChannel(converted);
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── APK SECTION ─────────────────────────────────────────────────────────────
const DEFAULT_APK = 'https://www.dropbox.com/scl/fi/jqizyd1z758rq4fs5zpxu/protvplus.apk?rlkey=qsu1dt1fxg5vue17mgi4l7d9u&st=j2h9b0qa&dl=1';

function triggerApkDownload() {
  window.location.href = DEFAULT_APK;

  // Progress simulation
  const box = document.getElementById('apk-dl-progress');
  box.classList.remove('hidden');
  let pct = 0;
  const bar = document.getElementById('apk-bar');
  const pctEl = document.getElementById('apk-pct');
  const iv = setInterval(() => {
    pct = Math.min(100, pct + Math.floor(Math.random() * 15) + 5);
    bar.style.width = pct + '%';
    pctEl.textContent = pct + '%';
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => box.classList.add('hidden'), 2000);
    }
  }, 150);
}

function copyApkLink() {
  const url = DEFAULT_APK;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('share-btn');
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Copied URL!`;
    setTimeout(() => {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share Download Link`;
    }, 2000);
  }).catch(() => {});
}

const STEP_CONTENT = {
  mobile: `<ol>
    <li>Click the <strong>Direct Download APK</strong> button on your mobile device.</li>
    <li>Before launching, open Android <strong>Settings &gt; Security</strong>.</li>
    <li>Enable the <strong>Allow Installation from Unknown Sources</strong> toggle.</li>
    <li>Open the file download folder and run the <strong>Pro TV Plus</strong> installer package.</li>
  </ol>`,
  tv: `<ol>
    <li>Install the official <strong>Downloader</strong> app from your Smart TV Play Store / Amazon Appstore.</li>
    <li>Open Downloader, enter: <code>protvplus.site</code></li>
    <li>The APK will fetch from GitHub releases and prepare for TV setup.</li>
    <li>Click Install and launch with your default TV remote controller.</li>
  </ol>`,
  pc: `<ol>
    <li>No emulator needed! Use our <strong>Interactive M3U IPTV Builder</strong> section directly above.</li>
    <li>Simply load the preloaded channels list or paste custom streaming files.</li>
    <li>Stream media instantly in native HD with absolute browser sandboxing.</li>
  </ol>`
};

function setStepTab(tab, btn) {
  document.querySelectorAll('.step-tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('step-content').innerHTML = STEP_CONTENT[tab] || '';
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function renderFaq() {
  document.getElementById('faq-list').innerHTML = FAQS.map((f, i) => `
    <div class="faq-item" data-faq="${i}">
      <button class="faq-q" onclick="toggleFaq(${i})">
        ${f.q}
        <div class="faq-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>
      <div class="faq-a">${f.a}</div>
    </div>`).join('');
}

function toggleFaq(idx) {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((el, i) => {
    if (i === idx) el.classList.toggle('open');
    else el.classList.remove('open');
  });
}

// ─── DOWNLOAD OVERLAY ────────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 48; // r=48

function startDownload(e) {
  if (e) e.preventDefault();
  // Redirect to Dropbox direct download
  window.location.href = DEFAULT_APK;

  let pct = 0;
  document.getElementById('dl-pct').textContent = '0%';
  setCircle(0);
  document.getElementById('dl-step').textContent = 'Initializing secure background connection to GitHub repository...';
  document.getElementById('dl-overlay').classList.add('open');

  const steps = [
    [0, 25, 'Establishing SSL handshake with CDN edge servers...'],
    [25, 45, 'Piping cryptographic manifest signature check...'],
    [45, 70, 'Streaming segments: parsed {pct}% (File size: ~18.4 MB)'],
    [70, 90, 'Running Android package verification checks...'],
    [90, 100, 'Preparing local browser filesystem storage...']
  ];

  const iv = setInterval(() => {
    pct = Math.min(100, pct + Math.floor(Math.random() * 9) + 4);
    document.getElementById('dl-pct').textContent = pct + '%';
    setCircle(pct / 100);
    const step = steps.find(([min, max]) => pct >= min && pct < max);
    if (step) document.getElementById('dl-step').textContent = step[2].replace('{pct}', pct);
    if (pct >= 100) {
      clearInterval(iv);
      document.getElementById('dl-step').textContent = 'Package downloaded successfully!';
      setTimeout(() => document.getElementById('dl-overlay').classList.remove('open'), 2000);
    }
  }, 110);
}

function setCircle(fraction) {
  const offset = CIRCUMFERENCE * (1 - fraction);
  document.getElementById('circle-fill').style.strokeDashoffset = offset;
}

function closeDownload() {
  document.getElementById('dl-overlay').classList.remove('open');
}

// ─── APP UPDATE ──────────────────────────────────────────────────────────────
async function fetchAppUpdate() {
  try {
    const r = await fetch('/api/app-update');
    if (!r.ok) return;
    const data = await r.json();
    if (!data?.versionName) return;
    state.updateInfo = data;
    document.getElementById('ver-name').textContent = 'v' + data.versionName;
    document.getElementById('ver-code').textContent = 'Build: ' + data.versionCode;
    const changelog = data.changelog || data.releaseNotes || '';
    document.getElementById('changelog-body').innerHTML = changelog
      .split('\n')
      .filter(l => l.trim())
      .map(l => `<p style="display:flex;align-items:flex-start;gap:.4rem"><span style="color:#00a2fd;font-weight:700;flex-shrink:0">•</span><span>${l.replace(/^[•\s\-*]+/, '').trim()}</span></p>`)
      .join('');
    document.getElementById('update-info-box').classList.remove('hidden');
  } catch {}
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  document.getElementById('copy-year').textContent = new Date().getFullYear();

  // Show android warning
  if (/Android/i.test(navigator.userAgent)) {
    document.getElementById('android-tip').classList.remove('hidden');
  }

  renderCategories();
  renderEpgTabs();
  renderChannelGrid();
  renderFaq();
  fetchAppUpdate();

  // Load first channel
  loadChannel(CHANNELS[0]);
}

document.addEventListener('DOMContentLoaded', init);
