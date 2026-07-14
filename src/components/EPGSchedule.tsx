import React, { useState, useEffect } from 'react';
import { Search, Radio, Play, Flame, Tv, RefreshCw, Heart, Clock } from 'lucide-react';
import { Channel } from '../types';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/haptic';

interface EPGScheduleProps {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channel: Channel) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function EPGSchedule({ 
  channels, 
  selectedChannelId, 
  onSelectChannel,
  activeCategory: controlledCategory,
  onCategoryChange
}: EPGScheduleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localCategory, setLocalCategory] = useState<string>('All');
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  // Favorites & Recents database state
  const [favorites, setFavorites] = useState<Channel[]>([]);
  const [history, setHistory] = useState<Channel[]>([]);

  const activeCategory = controlledCategory !== undefined ? controlledCategory : localCategory;
  const setActiveCategory = (cat: string) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      setLocalCategory(cat);
    }
  };

  const categories = ['All', '❤️ Favorites', '🕒 Recents', 'Sports', 'Bangla', 'Hindi/Urdu', 'News', 'Movies', 'Kids'];

  // Fetch Favorites and Recents on mount & active stream update
  const fetchFavoritesAndHistory = async () => {
    try {
      const favRes = await fetch('/api/favorites');
      if (favRes.ok) {
        const favData = await favRes.json();
        setFavorites(favData);
      }
      const histRes = await fetch('/api/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }
    } catch (e) {
      console.error('Error synchronizing favorites or history from server:', e);
    }
  };

  useEffect(() => {
    fetchFavoritesAndHistory();
  }, [selectedChannelId]);

  // Toggle favorite channel status on backend database
  const toggleFavorite = async (chan: Channel, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(HAPTIC_PATTERNS.softClick);
    const isFav = favorites.some(f => f.id === chan.id || f.streamUrl === chan.streamUrl);
    
    try {
      if (isFav) {
        const idToRemove = favorites.find(f => f.id === chan.id || f.streamUrl === chan.streamUrl)?.id || chan.id;
        const res = await fetch(`/api/favorites/${encodeURIComponent(idToRemove)}`, { method: 'DELETE' });
        if (res.ok) {
          const updated = await res.json();
          setFavorites(updated);
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chan)
        });
        if (res.ok) {
          const updated = await res.json();
          setFavorites(updated);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite on server:', err);
    }
  };

  // Determine display channels based on category selection
  let displayChannels = channels;
  if (activeCategory === '❤️ Favorites') {
    displayChannels = favorites;
  } else if (activeCategory === '🕒 Recents') {
    displayChannels = history;
  }

  const filteredChannels = displayChannels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (channel.nowPlaying && channel.nowPlaying.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesCategory = false;
    if (activeCategory === 'All' || activeCategory === '❤️ Favorites' || activeCategory === '🕒 Recents') {
      matchesCategory = true;
    } else {
      matchesCategory = channel.category.toLowerCase() === activeCategory.toLowerCase();
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-transparent">
      
      {/* Category Tabs & Live Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto max-w-full gap-1 bg-[#09090c] p-1 rounded-xl border border-neutral-800/60 self-stretch lg:self-start whitespace-nowrap scrollbar-thin select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.softClick);
                setActiveCategory(cat);
              }}
              className={`px-3.5 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all tracking-wider shrink-0 whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary-red to-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-3 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels, live shows..."
            className="w-full bg-[#050508] border border-neutral-800/80 focus:border-primary-red rounded-xl py-2.5 pl-10 pr-4 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none transition-all focus:ring-1 focus:ring-primary-red/50"
          />
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
        {filteredChannels.length > 0 ? (
          filteredChannels.map((chan) => {
            const isSelected = chan.id === selectedChannelId;
            return (
              <div
                key={chan.id}
                onClick={() => onSelectChannel(chan)}
                className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#121217] border-primary-red/70 shadow-lg shadow-primary-red/5'
                    : 'bg-[#08080c]/60 border-neutral-900/80 hover:border-neutral-800 hover:bg-[#0c0c11]'
                }`}
              >
                {/* Channel Meta Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {failedLogos[chan.id] ? (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#121212] to-[#1a1a1a] flex flex-col items-center justify-center text-[10px] font-black text-primary-red border border-neutral-800 shrink-0 shadow-inner group-hover:scale-105 transition-all duration-300 select-none">
                        <Tv size={14} className="mb-0.5 text-neutral-500" />
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
                        src={chan.logoUrl}
                        alt={chan.name}
                        className="w-12 h-12 rounded-xl object-contain p-1.5 bg-black border border-neutral-800 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300"
                        onError={() => {
                          setFailedLogos((prev) => ({ ...prev, [chan.id]: true }));
                        }}
                      />
                    )}
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-white group-hover:text-primary-red transition-all truncate font-display">
                        {chan.name}
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mt-0.5">
                        {chan.category} Category
                      </span>
                    </div>
                  </div>

                  {/* Active Play icon or live pulse + Heart favorite button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => toggleFavorite(chan, e)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        favorites.some(f => f.id === chan.id || f.streamUrl === chan.streamUrl)
                          ? 'bg-primary-red/15 border-primary-red/30 text-primary-red'
                          : 'bg-[#111115] border-neutral-850 text-neutral-500 hover:text-neutral-300'
                      }`}
                      title={favorites.some(f => f.id === chan.id || f.streamUrl === chan.streamUrl) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Heart size={11} className={favorites.some(f => f.id === chan.id || f.streamUrl === chan.streamUrl) ? "fill-current" : ""} />
                    </button>

                    {isSelected ? (
                      <div className="flex items-center gap-1.5 bg-primary-red/10 text-primary-red px-2.5 py-1.5 rounded-lg text-[9px] font-bold font-mono">
                        <Radio size={12} className="live-dot-pulse text-primary-red" />
                        PLAYING
                      </div>
                    ) : (
                      <button className="p-1.5 rounded-lg bg-[#111115] hover:bg-primary-red/20 text-neutral-400 group-hover:text-white transition-all border border-neutral-800/50 cursor-pointer">
                        <Play size={11} className="fill-current text-neutral-400 group-hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* EPG / Current Playing details */}
                <div className="bg-[#050508]/60 p-3 rounded-lg border border-neutral-900 text-xs mt-1.5">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium truncate">
                    <Flame size={12} className="text-primary-red shrink-0" />
                    <span className="truncate text-neutral-200">{chan.nowPlaying}</span>
                  </div>

                  {/* Timeline Progress Bar */}
                  <div className="w-full h-1 bg-neutral-900 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-red to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${chan.nowPlayingProgress || 50}%` }}
                    />
                  </div>

                  {/* Up Next details */}
                  {chan.nextPlaying && (
                    <p className="text-[10px] text-neutral-500 truncate mt-2 font-mono">
                      <span className="text-neutral-600 font-bold uppercase">NEXT:</span> {chan.nextPlaying}
                    </p>
                  )}
                </div>

                {/* Resolution Badge overlay */}
                <div className="absolute bottom-2 right-4 text-[9px] text-neutral-600 font-mono">
                  {chan.resolution || '1080p HD'}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-neutral-500 bg-[#08080b]/50 rounded-xl border border-neutral-900">
            <Tv size={28} className="mx-auto text-neutral-700 mb-2" />
            <p className="text-sm font-semibold text-neutral-400">No matching channels found</p>
            <p className="text-xs text-neutral-600 mt-1">Try searching another category or adjust filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
