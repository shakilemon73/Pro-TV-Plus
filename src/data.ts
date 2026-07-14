import { Channel, FaqItem } from './types';

export const POPULAR_CHANNELS: Channel[] = [
  {
    id: 't-sports-hd',
    name: 'T Sports HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/T_Sports_Official_Logo.png/512px-T_Sports_Official_Logo.png',
    streamUrl: 'http://114.130.57.233:8080/LIVE-Sports/video.m3u8?token=SkQuhAXZxgBan1',
    category: 'sports',
    isLive: true,
    nowPlaying: 'FIFA World Cup 2026 Qualifiers',
    nowPlayingDetails: 'Live stream of FIFA World Cup 2026 matches. Comprehensive broadcast coverage and live professional commentary.',
    nextPlaying: 'Live EPG Show & World Sports Highlights',
    nowPlayingProgress: 40,
    resolution: '1080p HD',
    bitrate: '5.5 Mbps'
  },
  {
    id: 'star-sports',
    name: 'Star Sports',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Star_Sports_logo.svg/512px-Star_Sports_logo.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    category: 'sports',
    isLive: true,
    nowPlaying: 'ICC World Cup: Australia vs India',
    nowPlayingDetails: 'Live from Narendra Modi Stadium. Comprehensive live coverage and expert analysis.',
    nextPlaying: 'Cricket Tonight - Match Highlights',
    nowPlayingProgress: 68,
    resolution: '1080p Full HD',
    bitrate: '5.2 Mbps'
  },
  {
    id: 'ptv-sports',
    name: 'PTV Sports',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/PTV_Sports_logo.svg/512px-PTV_Sports_logo.svg.png',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'sports',
    isLive: true,
    nowPlaying: 'T20 Cricket Blast Live',
    nowPlayingDetails: 'High-octane short-format cricket action with live audience telemetry.',
    nextPlaying: 'Sports Hour Analysis',
    nowPlayingProgress: 42,
    resolution: '1080p HD',
    bitrate: '4.8 Mbps'
  },
  {
    id: 'somoy-tv',
    name: 'Somoy TV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Somoy_TV_Logo.png/512px-Somoy_TV_Logo.png',
    streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    category: 'bangla',
    isLive: true,
    nowPlaying: 'Somoy News Bulletin',
    nowPlayingDetails: 'Breaking news and direct live coverage of regional, national and international events.',
    nextPlaying: 'Business & Economy Round',
    nowPlayingProgress: 85,
    resolution: '720p HD',
    bitrate: '3.1 Mbps'
  },
  {
    id: 'jamuna-tv',
    name: 'Jamuna TV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Jamuna_Television_logo.png/512px-Jamuna_Television_logo.png',
    streamUrl: 'https://playertest.longtailvideo.com/adaptive/vod/playlist.m3u8',
    category: 'bangla',
    isLive: true,
    nowPlaying: 'Jamuna Prime Time News',
    nowPlayingDetails: 'Analytical news broadcast with specialized reports from local correspondents.',
    nextPlaying: 'Investigation 360',
    nowPlayingProgress: 15,
    resolution: '1080p HD',
    bitrate: '4.5 Mbps'
  },
  {
    id: 'zee-bangla',
    name: 'Zee Bangla',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Zee_Bangla_logo.svg/512px-Zee_Bangla_logo.svg.png',
    streamUrl: 'https://res.cloudinary.com/dvr7v6g7u/video/upload/sp_auto/v1/sample_folder/sample.m3u8',
    category: 'bangla',
    isLive: true,
    nowPlaying: 'Didi No. 1 - Season 9',
    nowPlayingDetails: 'Popular reality show celebrating the resilience and talent of modern women.',
    nextPlaying: 'Mithai - Evening Mega Serial',
    nowPlayingProgress: 50,
    resolution: '1080p HD',
    bitrate: '3.8 Mbps'
  },
  {
    id: 'star-jalsha',
    name: 'Star Jalsha',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Star_Jalsha_logo.svg/512px-Star_Jalsha_logo.svg.png',
    streamUrl: 'https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8',
    category: 'bangla',
    isLive: true,
    nowPlaying: 'Anurager Chowa',
    nowPlayingDetails: 'Captivating family drama tracing complex relationship bonds and social challenges.',
    nextPlaying: 'Ke Prothom Kache Eshechi',
    nowPlayingProgress: 30,
    resolution: '1080p HD',
    bitrate: '4.0 Mbps'
  },
  {
    id: 'bbc-news',
    name: 'BBC News',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2022.svg/512px-BBC_News_2022.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    category: 'news',
    isLive: true,
    nowPlaying: 'Global News Hour',
    nowPlayingDetails: 'Live international updates, investigative features, and comprehensive market analysis.',
    nextPlaying: 'Hardtalk: Special Interview',
    nowPlayingProgress: 72,
    resolution: '1080p HD',
    bitrate: '3.5 Mbps'
  },
  {
    id: 'cnn',
    name: 'CNN',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'news',
    isLive: true,
    nowPlaying: 'Amanpour & Co.',
    nowPlayingDetails: 'Global affairs interview program focusing on major international developments.',
    nextPlaying: 'The Situation Room',
    nowPlayingProgress: 55,
    resolution: '1080p HD',
    bitrate: '4.2 Mbps'
  },
  {
    id: 'discovery',
    name: 'Discovery',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Discovery_Channel_logo.svg/512px-Discovery_Channel_logo.svg.png',
    streamUrl: 'https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8',
    category: 'movies',
    isLive: true,
    nowPlaying: 'Deadliest Catch: Alaskan Storms',
    nowPlayingDetails: 'Real-life drama aboard high-stakes crabbing vessels navigating extreme maritime weather.',
    nextPlaying: 'MythBusters - High-Velocity Science',
    nowPlayingProgress: 45,
    resolution: '1080p HD',
    bitrate: '5.0 Mbps'
  },
  {
    id: 'nat-geo',
    name: 'Nat Geo',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/National_Geographic_logo.svg/512px-National_Geographic_logo.svg.png',
    streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    category: 'kids',
    isLive: true,
    nowPlaying: 'Savage Kingdom',
    nowPlayingDetails: 'Unfiltered chronicle of natural survival, tracking predators and prey across the savannah.',
    nextPlaying: 'Brain Games - Optical Illusion Edition',
    nowPlayingProgress: 90,
    resolution: '1080p HD',
    bitrate: '4.7 Mbps'
  },
  {
    id: 'ary-digital',
    name: 'ARY Digital',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/ARY_Digital_Logo.svg/512px-ARY_Digital_Logo.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhg/main.m3u8',
    category: 'Hindi/Urdu',
    isLive: true,
    nowPlaying: 'Jeeto Pakistan League',
    nowPlayingDetails: 'High-energy game show hosted by Fahad Mustafa with live interactive audience participation.',
    nextPlaying: 'Bulbulay Comedy Sitcom',
    nowPlayingProgress: 52,
    resolution: '1080p HD',
    bitrate: '4.5 Mbps'
  },
  {
    id: 'hum-tv',
    name: 'Hum TV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/HUM_TV_Logo_2020.svg/512px-HUM_TV_Logo_2020.svg.png',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'Hindi/Urdu',
    isLive: true,
    nowPlaying: 'Parizaad Mega Drama',
    nowPlayingDetails: 'Award-winning emotional drama series detailing the life struggles of Parizaad.',
    nextPlaying: 'Hum News Highlights',
    nowPlayingProgress: 35,
    resolution: '1080p HD',
    bitrate: '4.0 Mbps'
  },
  {
    id: 'geo-news',
    name: 'Geo News',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Geo_News_logo.svg/512px-Geo_News_logo.svg.png',
    streamUrl: 'https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8',
    category: 'Hindi/Urdu',
    isLive: true,
    nowPlaying: 'Geo Headlines Tonight',
    nowPlayingDetails: 'In-depth reporting of central news bulletins and political panels.',
    nextPlaying: 'Capital Talk with Hamid Mir',
    nowPlayingProgress: 75,
    resolution: '720p HD',
    bitrate: '3.0 Mbps'
  },
  {
    id: 'colors-tv',
    name: 'Colors TV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Colors_TV_logo.svg/512px-Colors_TV_logo.svg.png',
    streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    category: 'Hindi/Urdu',
    isLive: true,
    nowPlaying: 'Bigg Boss Live Stream',
    nowPlayingDetails: 'Real-time celebrity camera telemetry inside the infamous glass house.',
    nextPlaying: 'Khatron Ke Khiladi Highlights',
    nowPlayingProgress: 60,
    resolution: '1080p HD',
    bitrate: '4.8 Mbps'
  }
];

export const FAQS: FaqItem[] = [
  {
    question: "Is Pro Tv Plus really free to use?",
    answer: "Yes, Pro Tv Plus is 100% free. It is an ad-supported premium directory and aggregator that streamlines access to live sports, entertainment, and news streams with zero subscription costs, log-ins, or hidden charges."
  },
  {
    question: "How do I download and install the APK on Android?",
    answer: "You can click the primary download button or scan the QR Code on this site to instantly pull the official app-release.apk file. Make sure to toggle 'Allow installation from Unknown Sources' in your Android system security settings before launching the installer."
  },
  {
    question: "Can I run Pro Tv Plus on my Android TV or Fire Stick?",
    answer: "Absolutely! Pro Tv Plus features an adaptive, fully optimized layout for larger displays. To install on TV devices, simply download the 'Downloader' app from the Google Play Store or Amazon Appstore, enter this site's URL, and initiate the direct APK download link."
  },
  {
    question: "How can I load custom M3U playlists?",
    answer: "We have built a custom in-browser IPTV M3U parser directly on this page! Simply paste your custom M3U playlist link or text content in the M3U builder section below to immediately parse and stream your custom TV channels in real-time."
  },
  {
    question: "Where can I download the official APK?",
    answer: "You can download the safe, verified app-release.apk file directly from our server using any of the 'Download App' or 'Download APK' buttons located across this website."
  }
];

export const APK_DOWNLOAD_URL = "https://www.dropbox.com/scl/fi/jqizyd1z758rq4fs5zpxu/protvplus.apk?rlkey=qsu1dt1fxg5vue17mgi4l7d9u&st=u0te745i&dl=1";

// Cloudflare Pages guidelines
export const CLOUDFLARE_DEVICES_GUIDE = `
# Deploy to Cloudflare Pages in 1 Click

Pro Tv Plus is fully optimized as a modern static SPA ready for deployment on **Cloudflare Pages**.

### ⚡ Configuration Checklist
1. **Framework Preset:** Vite
2. **Build Command:** \`npm run build\`
3. **Build Output Directory:** \`dist\`
4. **Environment Variables (Optional):** None required for static distribution.

### 📦 Quick Setup Instructions
- Connect your GitHub Repository to the Cloudflare Pages dashboard.
- Set the build settings exactly as listed above.
- Click **Deploy** and Cloudflare will distribute the app across 300+ global data centers with near-zero latency, delivering lightning-fast speeds to your end-users.
`;
