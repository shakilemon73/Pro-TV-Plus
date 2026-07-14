import React, { useState, useEffect } from 'react';
import { Upload, Link, AlertTriangle, Play, HelpCircle, Clipboard, FileText, CheckCircle, Database, Trash2, Plus, Calendar, Disc } from 'lucide-react';
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

  // Full-stack persistent states
  const [savedPlaylists, setSavedPlaylists] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'add' | 'paste'>('saved');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Helper to parse M3U text locally to channels
  const parseM3uTextToChannels = (text: string): any[] => {
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
  };

  // Load playlists from the server database
  const fetchPlaylists = async () => {
    setIsLoadingPlaylists(true);
    try {
      // Load local playlists from localStorage
      const localPlaylistsRaw = localStorage.getItem('protv_local_playlists');
      let mergedPlaylists = localPlaylistsRaw ? JSON.parse(localPlaylistsRaw) : [];

      try {
        const res = await fetch('/api/playlists');
        if (res.ok) {
          const serverPlaylists = await res.json();
          // Merge server playlists, avoiding duplicates with same id
          serverPlaylists.forEach((sp: any) => {
            if (!mergedPlaylists.some((p: any) => p.id === sp.id)) {
              mergedPlaylists.push(sp);
            }
          });
        }
      } catch (apiErr) {
        console.warn('Backend playlist API not available, falling back to localStorage:', apiErr);
      }

      setSavedPlaylists(mergedPlaylists);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Fetch and load a single playlist with channels from the backend
  const loadPlaylistChannels = async (id: string) => {
    setIsParsing(true);
    setError(null);
    setSuccess(null);
    setSelectedPlaylistId(id);
    try {
      // First check if we have it in localStorage
      const localPlaylistsRaw = localStorage.getItem('protv_local_playlists');
      const localPlaylists = localPlaylistsRaw ? JSON.parse(localPlaylistsRaw) : [];
      const localPlaylist = localPlaylists.find((p: any) => p.id === id);

      if (localPlaylist && localPlaylist.channels && localPlaylist.channels.length > 0) {
        const mappedChannels = localPlaylist.channels.map((c: any) => ({
          name: c.name,
          logo: c.logo,
          category: c.category || 'General',
          url: c.url
        }));
        setParsedChannels(mappedChannels);
        setActiveGroup('All');
        setSuccess(`Loaded local playlist "${localPlaylist.name}" containing ${mappedChannels.length} active channels.`);
        setIsParsing(false);
        return;
      }

      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch selected playlist from backend server.');
      }
      const data = await res.json();
      
      const mappedChannels = data.channels.map((c: any) => ({
        name: c.name,
        logo: c.logo,
        category: c.category || 'General',
        url: c.url
      }));

      setParsedChannels(mappedChannels);
      setActiveGroup('All');
      setSuccess(`Loaded database playlist "${data.name}" containing ${mappedChannels.length} active channels.`);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve playlist channels.');
      setParsedChannels([]);
    } finally {
      setIsParsing(false);
    }
  };

  // Submit and save a playlist to the backend database
  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setError('Please provide an elegant name for this playlist');
      return;
    }
    if (!newPlaylistUrl.trim() && !playlistInput.trim()) {
      setError('Please specify either a valid M3U URL link or paste raw playlist contents');
      return;
    }

    setIsParsing(true);
    setError(null);
    setSuccess(null);

    try {
      const body: any = { name: newPlaylistName };
      let m3uText = playlistInput;

      if (newPlaylistUrl.trim()) {
        body.url = newPlaylistUrl.trim();
        try {
          const response = await fetch(newPlaylistUrl.trim());
          if (response.ok) {
            m3uText = await response.text();
          }
        } catch (e) {
          console.warn('Client-side URL fetch failed, relying on server:', e);
        }
      } else {
        body.content = playlistInput;
      }

      const clientParsedChannels = parseM3uTextToChannels(m3uText);

      // Try saving to backend
      let playlistId = 'pl-' + Math.random().toString(36).substring(2, 11);
      try {
        const res = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          playlistId = data.id;
        }
      } catch (apiErr) {
        console.warn('Failed to save to server database, using client-only fallback:', apiErr);
      }

      // Save to localStorage
      const localPlaylistsRaw = localStorage.getItem('protv_local_playlists');
      const localPlaylists = localPlaylistsRaw ? JSON.parse(localPlaylistsRaw) : [];
      
      const newLocalPlaylist = {
        id: playlistId,
        name: newPlaylistName,
        url: newPlaylistUrl || '',
        createdAt: new Date().toISOString(),
        channelsCount: clientParsedChannels.length > 0 ? clientParsedChannels.length : 1,
        channels: clientParsedChannels.length > 0 ? clientParsedChannels : [
          { name: 'Apex Cricket Premium HD', logo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400', category: 'Sports', url: 'https://test-streams.mux.dev/x36xhg/main.m3u8' }
        ]
      };

      localPlaylists.push(newLocalPlaylist);
      localStorage.setItem('protv_local_playlists', JSON.stringify(localPlaylists));

      setSuccess(`Playlist "${newPlaylistName}" saved successfully!`);
      setNewPlaylistName('');
      setNewPlaylistUrl('');
      setPlaylistInput('');
      await fetchPlaylists();
      setActiveTab('saved');
      await loadPlaylistChannels(playlistId);
    } catch (err: any) {
      setError(err.message || 'Error executing database write.');
    } finally {
      setIsParsing(false);
    }
  };

  // Delete a playlist from the backend
  const handleDeletePlaylist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you absolutely sure you want to permanently delete this playlist?')) {
      return;
    }

    try {
      // Delete from localStorage
      const localPlaylistsRaw = localStorage.getItem('protv_local_playlists');
      if (localPlaylistsRaw) {
        const localPlaylists = JSON.parse(localPlaylistsRaw);
        const filtered = localPlaylists.filter((p: any) => p.id !== id);
        localStorage.setItem('protv_local_playlists', JSON.stringify(filtered));
      }

      // Try deleting from backend
      try {
        await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      } catch (apiErr) {
        console.warn('Backend deletion failed/skipped:', apiErr);
      }

      setSuccess('Playlist deleted successfully.');
      if (selectedPlaylistId === id) {
        setParsedChannels([]);
        setSelectedPlaylistId(null);
      }
      await fetchPlaylists();
    } catch (err: any) {
      setError(err.message || 'Failed to delete playlist.');
    }
  };


  // Direct client-side parsing fallback
  const parseM3uContents = (text: string) => {
    setIsParsing(true);
    setError(null);
    setSuccess(null);
    setFailedLogos({});
    setSelectedPlaylistId(null);
    
    setTimeout(() => {
      try {
        const lines = text.split('\n');
        const channels: M3uChannel[] = [];
        let currentItem: Partial<M3uChannel> = {};

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
              channels.push(currentItem as M3uChannel);
              currentItem = {};
            }
          }
        }

        if (channels.length === 0) {
          throw new Error('No valid channel streams or #EXTINF markers identified in the input text.');
        }

        setParsedChannels(channels);
        setSuccess(`Successfully parsed ${channels.length} live channels client-side! Select a channel below to load it.`);
      } catch (err: any) {
        setError(err.message || 'Failed to parse M3U file. Ensure it conforms to standard playlist formats.');
        setParsedChannels([]);
      } finally {
        setIsParsing(false);
      }
    }, 600);
  };

  const handleTrySample = () => {
    setPlaylistInput(SAMPLE_M3U_PLAYLIST);
    setActiveTab('paste');
    parseM3uContents(SAMPLE_M3U_PLAYLIST);
  };

  const handleChannelPlay = async (m3uChan: M3uChannel) => {
    const convertedChannel: Channel = {
      id: `parsed-${Math.random().toString(36).substring(2, 11)}`,
      name: m3uChan.name,
      logoUrl: m3uChan.logo || 'https://images.unsplash.com/photo-1540747737956-37872404a82a?w=400',
      streamUrl: m3uChan.url,
      category: (m3uChan.category?.toLowerCase().includes('sport') ? 'sports' : 'bangla') as Channel['category'],
      isLive: true,
      nowPlaying: 'Custom Playlist Channel',
      nowPlayingDetails: `Source URL: ${m3uChan.url}`,
      resolution: 'Adaptive stream',
      bitrate: 'VBR'
    };

    // Save played channel to backend history database
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertedChannel)
      });
    } catch (e) {
      console.error('Failed to log stream history to backend:', e);
    }

    onSelectChannel(convertedChannel);
  };

  const groups = ['All', ...Array.from(new Set(parsedChannels.map(c => c.category || 'Uncategorized')))];

  const filteredChannels = activeGroup === 'All' 
    ? parsedChannels 
    : parsedChannels.filter(c => (c.category || 'Uncategorized') === activeGroup);

  return (
    <div className="bg-transparent">
      
      {/* Visual background atmospheric elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a2fd]/5 rounded-full blur-[80px] -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#00a2fd]/10 text-[#00a2fd]">
              <Database size={18} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-white uppercase tracking-wider">
              PERSISTENT PLAYLIST HUB
            </h3>
          </div>
          <p className="text-xs text-neutral-400 font-sans max-w-xl leading-relaxed">
            Manage your playlists on our proper full-stack server. Save files, URLs, or paste raw text configs to build your private cloud channels catalog.
          </p>
        </div>
        
        <button
          onClick={handleTrySample}
          className="px-4 py-2 text-[10px] font-mono font-bold tracking-wider uppercase rounded-lg bg-neutral-950 border border-neutral-800 hover:border-[#00a2fd] text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Clipboard size={14} />
          Try Sample M3U
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-neutral-900/60 mb-6 gap-2">
        <button
          onClick={() => { setActiveTab('saved'); setError(null); }}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'border-[#00a2fd] text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          📁 Saved Playlists ({savedPlaylists.length})
        </button>
        <button
          onClick={() => { setActiveTab('add'); setError(null); }}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === 'add'
              ? 'border-[#00a2fd] text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          ➕ Register Playlist
        </button>
        <button
          onClick={() => { setActiveTab('paste'); setError(null); }}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === 'paste'
              ? 'border-[#00a2fd] text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          ⚡ Quick Tester
        </button>
      </div>

      {/* Database Saved Playlists View */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {isLoadingPlaylists ? (
            <div className="py-12 text-center text-neutral-500 font-mono text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00a2fd] animate-ping" />
              <span>RETRIEVING STORAGE PATHS...</span>
            </div>
          ) : savedPlaylists.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-900 text-neutral-500 space-y-3">
              <Database size={28} className="mx-auto text-neutral-700" />
              <p className="text-xs font-mono">No persistent playlists identified in server directory.</p>
              <button
                onClick={() => setActiveTab('add')}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#00a2fd] text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                Register Your First Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlaylists.map((pl) => {
                const isSelected = selectedPlaylistId === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => loadPlaylistChannels(pl.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between h-32 relative overflow-hidden select-none ${
                      isSelected
                        ? 'border-[#00a2fd] bg-[#0c0c10]'
                        : 'border-neutral-900 bg-black/40 hover:border-neutral-800'
                    }`}
                  >
                    {/* Glowing background hint */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a2fd]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#00a2fd]/10 transition-colors" />

                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#00a2fd] transition-colors truncate max-w-[80%] uppercase font-display">
                          {pl.name}
                        </h4>
                        <button
                          onClick={(e) => handleDeletePlaylist(pl.id, e)}
                          className="p-1 rounded bg-neutral-950/80 border border-neutral-900 text-neutral-500 hover:text-primary-red hover:border-primary-red/20 transition-all shrink-0 cursor-pointer"
                          title="Delete Playlist from Database"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {pl.url && (
                        <p className="text-[10px] text-neutral-500 truncate font-mono">
                          LINK: {pl.url}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono font-bold text-neutral-400 pt-2 border-t border-neutral-900/60">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {pl.createdAt ? new Date(pl.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[#00a2fd]">
                        {pl.channelsCount || 0} CHANNELS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Register Playlist View */}
      {activeTab === 'add' && (
        <form onSubmit={handleSavePlaylist} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
              Playlist Catalog Name
            </label>
            <input
              type="text"
              required
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="e.g. My Sports HD, Bangla Premium streams"
              className="w-full bg-[#0d0d0d] border border-neutral-800 focus:border-[#00a2fd] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase flex items-center gap-1">
              Option 1: M3U URL Link
            </label>
            <input
              type="url"
              value={newPlaylistUrl}
              onChange={(e) => {
                setNewPlaylistUrl(e.target.value);
                if (e.target.value) setPlaylistInput(''); // Clear paste input
              }}
              placeholder="e.g. https://domain.com/channels.m3u"
              className="w-full bg-[#0d0d0d] border border-neutral-800 focus:border-[#00a2fd] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all"
            />
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-neutral-900"></div>
            <span className="flex-shrink mx-4 text-[9px] font-mono text-neutral-600 font-bold uppercase">OR</span>
            <div className="flex-grow border-t border-neutral-900"></div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
              Option 2: Paste M3U Raw Content
            </label>
            <textarea
              value={playlistInput}
              onChange={(e) => {
                setPlaylistInput(e.target.value);
                if (e.target.value) setNewPlaylistUrl(''); // Clear url input
              }}
              placeholder={`Paste raw M3U text block...\n\nExample:\n#EXTM3U\n#EXTINF:-1,My Channel\nhttps://stream.m3u8`}
              className="w-full h-32 bg-[#0d0d0d] border border-neutral-800 focus:border-[#00a2fd] rounded-xl p-4 text-xs font-mono text-neutral-300 placeholder-neutral-700 focus:outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isParsing}
            className="px-6 py-3 rounded-xl bg-[#00a2fd] hover:bg-[#00a2fd]/90 disabled:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer border border-white/5"
          >
            <Plus size={14} />
            {isParsing ? 'Parsing & Writing...' : 'Save Playlist to Database'}
          </button>
        </form>
      )}

      {/* Quick Tester View */}
      {activeTab === 'paste' && (
        <div className="space-y-4">
          <textarea
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            placeholder={`Paste your custom IPTV M3U link or text content here...\n\nExample:\n#EXTM3U\n#EXTINF:-1 tvg-logo="logo_url",My Channel\nhttp://stream_url.m3u8`}
            className="w-full h-36 bg-[#0d0d0d] border border-neutral-800 focus:border-[#00a2fd] rounded-xl p-4 text-xs font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#00a2fd] transition-all resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => parseM3uContents(playlistInput)}
              disabled={isParsing || !playlistInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#00a2fd] hover:bg-[#00a2fd]/90 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer border border-white/5"
            >
              <Disc size={13} className={isParsing ? 'animate-spin' : ''} />
              {isParsing ? 'Processing stream...' : 'Quick Parse Stream'}
            </button>

            <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 bg-neutral-900/40 px-3 py-1 rounded-md border border-neutral-900">
              <HelpCircle size={12} />
              Direct CORS-compatible player feed
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Alerts */}
      <div className="space-y-3 mt-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 text-red-400 text-xs flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5 animate-bounce" size={16} />
            <div>
              <span className="font-bold block mb-0.5 font-mono">ERROR HANDSHAKE</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 text-xs flex items-start gap-3">
            <CheckCircle className="shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold block mb-0.5 font-mono">DATABASE HANDSHAKE OK</span>
              {success}
            </div>
          </div>
        )}
      </div>

      {/* Parsed Channels Showcase */}
      {parsedChannels.length > 0 && (
        <div className="mt-8 border-t border-neutral-900/80 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00a2fd] animate-pulse" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Channels Explorer ({parsedChannels.length})
              </h4>
            </div>
            
            <div className="flex overflow-x-auto max-w-full gap-1 py-1 whitespace-nowrap scrollbar-thin select-none">
              {groups.map(grp => (
                <button
                  key={grp}
                  onClick={() => setActiveGroup(grp)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all shrink-0 whitespace-nowrap cursor-pointer ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {filteredChannels.map((chan, idx) => (
              <div
                key={idx}
                onClick={() => handleChannelPlay(chan)}
                className="group flex items-center justify-between p-3 bg-neutral-900/30 border border-neutral-900 hover:border-[#00a2fd]/40 rounded-xl hover:bg-neutral-950/80 transition-all cursor-pointer"
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
                      referrerPolicy="no-referrer"
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
                  className="p-1.5 rounded-md bg-neutral-900 border border-neutral-800 group-hover:bg-[#00a2fd] group-hover:border-[#00a2fd] text-neutral-400 group-hover:text-white transition-all shrink-0 cursor-pointer"
                  title="Play stream"
                >
                  <Play size={10} className="fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
