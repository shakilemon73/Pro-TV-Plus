export interface Channel {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
  category: 'sports' | 'news' | 'bangla' | 'movies' | 'kids';
  isLive: boolean;
  nowPlaying: string;
  nowPlayingDetails?: string;
  nextPlaying?: string;
  nowPlayingProgress?: number; // 0 to 100
  resolution?: string; // e.g. "1080p Ultra HD"
  bitrate?: string; // e.g. "4.5 Mbps"
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface M3uChannel {
  name: string;
  url: string;
  logo?: string;
  category?: string;
}

