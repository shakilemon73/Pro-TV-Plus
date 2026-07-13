import React, { useState } from 'react';
import { Upload, Link, AlertTriangle, Play, HelpCircle, Clipboard, FileText, CheckCircle } from 'lucide-react';
import { M3uChannel, Channel } from '../types';

interface M3uParserProps {
  onSelectChannel: (channel: Channel) => void;
}

const SAMPLE_M3U_PLAYLIST = `#EXTM3U x-tvg-url="http://epg.example.com/epg.xml"

#EXTINF:-1 tvg-id="cricket.hd" tvg-logo="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400" group-title="Sports",Apex Cricket Premium HD
https://test-streams.mux.dev/x36xhg/main.m3u8

#EXTINF:-1 tvg-id="football.hd" tvg-logo="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400" group-title="Sports",Global Football Network Live
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8

#EXTINF:-1 tvg-id="worldnews" tvg-logo="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400" group-title="News",Global Broadcast 24/7 News
https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8

#EXTINF:-1 tvg-id="movies" tvg-logo="https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?w=400" group-title="Cinema",Classic Cinematic Streams
https://playertest.longtailvideo.com/adaptive/art-of-motion/manifest.m3u8`;

export default function M3uParser({ onSelectChannel }: M3uParserProps) {
  const [playlistInput, setPlaylistInput] = useState('');
  const [parsedChannels, setParsedChannels] = useState<M3uChannel[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('All');
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  // Parses M3U contents line-by-line using regular expressions
  const parseM3uContents = (text: string) => {
    setIsParsing(true);
    setError(null);
    setSuccess(null);
    setFailedLogos({});
    
    setTimeout(() => {
      try {
        const lines = text.split('\n');
        const channels: M3uChannel[] = [];
        let currentItem: Partial<M3uChannel> = {};

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.startsWith('#EXTINF:')) {
            // Extract channel name (everything after the last comma)
            const commaIndex = line.lastIndexOf(',');
            const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unnamed Channel';

            // Extract logo URL
            const logoMatch = line.match(/tvg-logo="([^"]+)"/) || line.match(/logo="([^"]+)"/);
            const logo = logoMatch ? logoMatch[1] : undefined;

            // Extract category group
            const groupMatch = line.match(/group-title="([^"]+)"/) || line.match(/category="([^"]+)"/);
            const category = groupMatch ? groupMatch[1] : 'Uncategorized';

            currentItem = { name, logo, category };
          } else if (line.startsWith('http://') || line.startsWith('https://')) {
            if (currentItem.name) {
              currentItem.url = line;
              channels.push(currentItem as M3uChannel);
              currentItem = {};
            }
          }
        }

        if (channels.length === 0) {
          throw new Error('No valid channel streams or #EXTINF markers identified in the input text.');
        }

        setParsedChannels(channels);
        setSuccess(`Successfully parsed ${channels.length} live channels! Select a channel below to load it into the main web player.`);
      } catch (err: any) {
        setError(err.message || 'Failed to parse M3U file. Ensure it conforms to standard playlist formats.');
        setParsedChannels([]);
      } finally {
        setIsParsing(false);
      }
    }, 800);
  };

  const handleTrySample = () => {
    setPlaylistInput(SAMPLE_M3U_PLAYLIST);
    parseM3uContents(SAMPLE_M3U_PLAYLIST);
  };

  const handleChannelPlay = (m3uChan: M3uChannel) => {
    // Convert M3uChannel to Channel type
    const convertedChannel: Channel = {
      id: `parsed-${Math.random().toString(36).substr(2, 9)}`,
      name: m3uChan.name,
      logoUrl: m3uChan.logo || 'https://images.unsplash.com/photo-1540747737956-37872404a82a?w=400',
      streamUrl: m3uChan.url,
      category: (m3uChan.category?.toLowerCase().includes('sport') ? 'sports' : 'bangla') as Channel['category'],
      isLive: true,
      nowPlaying: 'Custom Stream Feed',
      nowPlayingDetails: `Source URL: ${m3uChan.url}`,
      resolution: 'Adaptive stream',
      bitrate: 'VBR'
    };
    onSelectChannel(convertedChannel);
  };

  // Get unique category groups for filtering
  const groups = ['All', ...Array.from(new Set(parsedChannels.map(c => c.category || 'Uncategorized')))];

  const filteredChannels = activeGroup === 'All' 
    ? parsedChannels 
    : parsedChannels.filter(c => (c.category || 'Uncategorized') === activeGroup);

  return (
    <div className="bg-transparent">
      
      {/* Visual background atmospheric elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-blue/5 rounded-full blur-[80px] -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded-lg bg-[#00a2fd]/10 text-[#00a2fd]">
              <Upload size={18} />
            </div>
            <h3 className="text-xl font-bold font-display text-white">Custom M3U IPTV Playlist Builder</h3>
          </div>
          <p className="text-sm text-neutral-400 font-sans max-w-xl">
            Import M3U links or copy-paste playlist text to test custom channel streams on Pro Tv Plus.
          </p>
        </div>
        
        <button
          onClick={handleTrySample}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#00a2fd] text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Clipboard size={14} />
          Load Demo M3U
        </button>
      </div>

      {/* Input Text Box */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            placeholder={`Paste your custom IPTV M3U link or text content here...\n\nExample:\n#EXTM3U\n#EXTINF:-1 tvg-logo="logo_url",My Channel\nhttp://stream_url.m3u8`}
            className="w-full h-44 bg-[#0d0d0d] border border-neutral-800 focus:border-[#00a2fd] rounded-xl p-4 text-xs font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#00a2fd] transition-all resize-none"
          />
        </div>

        {/* Action Button, status alerts */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => parseM3uContents(playlistInput)}
            disabled={isParsing || !playlistInput.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#00a2fd] hover:bg-[#00a2fd]/90 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            {isParsing ? 'Parsing Playlist...' : 'Parse Playlist Stream'}
          </button>

          <span className="text-xs text-neutral-500 font-sans flex items-center gap-1 bg-neutral-900/40 px-3 py-1 rounded-md">
            <HelpCircle size={13} />
            CORS compatible streams will render instantly
          </span>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 text-red-400 text-xs flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold block mb-0.5">Parsing Failed</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 text-xs flex items-start gap-3">
            <CheckCircle className="shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold block mb-0.5">Success</span>
              {success}
            </div>
          </div>
        )}

        {/* Parsed Channels Showcase */}
        {parsedChannels.length > 0 && (
          <div className="mt-8 border-t border-neutral-800/80 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Parsed Channels
              </h4>
              <div className="flex flex-wrap gap-1">
                {groups.map(grp => (
                  <button
                    key={grp}
                    onClick={() => setActiveGroup(grp)}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${
                      activeGroup === grp
                        ? 'bg-[#00a2fd] text-white'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid display of parsed channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredChannels.map((chan, idx) => (
                <div
                  key={idx}
                  onClick={() => handleChannelPlay(chan)}
                  className="group flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800/80 hover:border-[#00a2fd] rounded-xl hover:bg-[#131313] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {failedLogos[idx] || !chan.logo ? (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#121212] to-[#1a1a1a] flex flex-col items-center justify-center text-[9px] font-black text-primary-red border border-neutral-800 shrink-0 shadow-inner group-hover:scale-105 transition-all duration-300 select-none">
                        <span>
                          {chan.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={chan.logo}
                        alt={chan.name}
                        className="w-10 h-10 rounded-lg object-contain p-1 bg-neutral-950 border border-neutral-800 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300"
                        onError={() => {
                          setFailedLogos((prev) => ({ ...prev, [idx]: true }));
                        }}
                      />
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-neutral-200 group-hover:text-[#00a2fd] transition-all truncate">
                        {chan.name}
                      </p>
                      <p className="text-[9px] font-mono text-neutral-500 truncate mt-0.5">
                        {chan.category || 'Sports'} Group
                      </p>
                    </div>
                  </div>

                  <button
                    className="p-1.5 rounded-md bg-neutral-800 group-hover:bg-[#00a2fd] text-neutral-400 group-hover:text-white transition-all shrink-0"
                    title="Play stream"
                  >
                    <Play size={12} className="fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
