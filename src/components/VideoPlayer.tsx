import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, RefreshCw, Radio, Server, Activity, ShieldAlert } from 'lucide-react';
import { Channel } from '../types';

interface VideoPlayerProps {
  channel: Channel | null;
  onRefresh?: () => void;
}

export default function VideoPlayer({ channel, onRefresh }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState<'Auto' | '1080p' | '720p' | '480p'>('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [latency, setLatency] = useState(1.15);
  const [bandwidth, setBandwidth] = useState(4.8);
  const [fps, setFps] = useState(60);
  const [bufferState, setBufferState] = useState(0.0);
  const [statusMessage, setStatusMessage] = useState('Buffering...');
  const [streamActive, setStreamActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Simulate active stream status change on channel selection
  useEffect(() => {
    if (!channel) return;
    setStreamActive(false);
    setStatusMessage('Establishing peer connection...');
    
    const t1 = setTimeout(() => {
      setStatusMessage('Parsing manifest chunks...');
    }, 600);

    const t2 = setTimeout(() => {
      setStatusMessage('Syncing clock offsets...');
    }, 1200);

    const t3 = setTimeout(() => {
      setStreamActive(true);
      setIsPlaying(true);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [channel]);

  // Simulate streaming telemetry fluctuations
  useEffect(() => {
    if (!isPlaying || !streamActive) return;

    const interval = setInterval(() => {
      // Latency fluctuation: 1.1s - 1.3s
      setLatency(prev => {
        const delta = (Math.random() - 0.5) * 0.05;
        return Math.max(1.05, Math.min(1.4, Number((prev + delta).toFixed(2))));
      });

      // Bandwidth fluctuation
      setBandwidth(prev => {
        const delta = (Math.random() - 0.5) * 0.3;
        const target = channel ? parseFloat(channel.bitrate || '4.5') : 4.5;
        return Math.max(target - 0.8, Math.min(target + 0.8, Number((prev + delta).toFixed(1))));
      });

      // FPS fluctuation
      setFps(() => (Math.random() > 0.95 ? 59 : 60));
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, streamActive, channel]);

  // Animated visualizer for the simulated stream fallback
  useEffect(() => {
    if (!canvasRef.current || !isPlaying || !streamActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 640;
    let height = canvas.height = canvas.parentElement?.clientHeight || 360;

    const resizeHandler = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 640;
      height = canvas.height = canvas.parentElement?.clientHeight || 360;
    };
    window.addEventListener('resize', resizeHandler);

    let offset = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(19, 19, 19, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Grid backing
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw audio oscilloscope bars
      const numBars = 40;
      const barWidth = width / numBars;
      ctx.fillStyle = 'rgba(229, 9, 20, 0.15)';
      
      for (let i = 0; i < numBars; i++) {
        const amplitude = Math.sin(i * 0.15 + offset) * Math.cos(i * 0.05 + offset * 0.5);
        const barHeight = Math.abs(amplitude) * (height * 0.4) + 10;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
      }

      // Main frequency sine wave
      ctx.beginPath();
      ctx.strokeStyle = '#00a2fd'; // Neon Blue
      ctx.lineWidth = 3;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.015 + offset) * Math.cos(x * 0.005 - offset) * 50;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary overlay frequency wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(229, 9, 20, 0.8)'; // Electric Red
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.025 - offset * 1.5) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += 0.04;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, streamActive]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  const handleQualityChange = (q: typeof quality) => {
    setQuality(q);
    setShowQualityMenu(false);
    // Briefly show a re-buffering effect on quality change
    setStreamActive(false);
    setStatusMessage(`Adapting bitrate to ${q}...`);
    setTimeout(() => {
      setStreamActive(true);
    }, 800);
  };

  return (
    <div className="relative group/player bg-black rounded-2xl border border-neutral-800/80 overflow-hidden shadow-2xl transition-all duration-300">
      {/* Top Banner overlay - Live Status Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-primary-red/90 text-[10px] font-bold px-3 py-1 rounded-full text-white flex items-center gap-1.5 shadow-lg tracking-wider font-display">
          <span className="w-1.5 h-1.5 bg-white rounded-full live-dot-pulse"></span>
          LIVE BROADCAST
        </div>
        {channel && (
          <div className="glass px-3 py-1 rounded-full text-[10px] text-neutral-300 font-mono tracking-wider">
            {channel.resolution || '1080p Ultra HD'}
          </div>
        )}
      </div>

      {/* Top Right - Streaming Quality Counter */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="glass px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 text-[#00a2fd]">
          <Activity size={12} />
          {latency}s latency
        </div>
      </div>

      {/* Main Stream Screen Area */}
      <div className="relative aspect-video w-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden select-none">
        
        {/* Real-time Simulated Graphic/Visualizer Backdrop */}
        {streamActive && isPlaying ? (
          <div className="absolute inset-0 w-full h-full">
            {/* Animated Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block absolute inset-0" />

            {/* Simulated Live Broadcast Overlay */}
            {channel && (
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none">
                <div className="max-w-xl">
                  <span className="text-[11px] font-bold text-primary-red uppercase tracking-wider block mb-1 font-display">
                    {channel.category} Category
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight font-display drop-shadow">
                    {channel.name}
                  </h3>
                  <p className="text-sm text-neutral-300 mt-1.5 line-clamp-2 drop-shadow font-sans">
                    {channel.nowPlayingDetails || channel.nowPlaying}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Loading & Buffering States */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial-gradient from-neutral-900 to-black">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-14 h-14 border-2 border-primary-red/30 border-t-primary-red rounded-full animate-spin"></div>
              <Radio className="absolute text-primary-red animate-pulse-fast" size={20} />
            </div>
            <p className="font-mono text-xs text-primary-red font-bold uppercase tracking-widest animate-pulse">
              {statusMessage}
            </p>
            {channel && (
              <p className="text-neutral-400 text-sm mt-2 font-display">
                Loading {channel.name}
              </p>
            )}
          </div>
        )}

        {/* Playback Interruption Overlay if paused */}
        {!isPlaying && streamActive && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-10 transition-all">
            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary-red hover:bg-primary-red/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              <Play size={28} className="ml-1 fill-current" />
            </button>
            <p className="text-neutral-300 font-display text-sm mt-3 font-semibold uppercase tracking-widest">
              Broadcast Paused
            </p>
          </div>
        )}

        {/* Scanline CRT Effect for retro cinema atmosphere */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />
      </div>

      {/* Control Dashboard Panel */}
      <div className="p-4 bg-surface-base border-t border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-4 z-20 relative">
        
        {/* Left Side: Playback & Volume */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={togglePlay}
            disabled={!streamActive}
            className={`p-2.5 rounded-lg transition-all ${
              !streamActive 
                ? 'text-neutral-600 cursor-not-allowed' 
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            {isPlaying && streamActive ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden relative cursor-pointer group">
              <div 
                className={`h-full rounded-full transition-all ${isMuted ? 'bg-neutral-600' : 'bg-primary-red'}`}
                style={{ width: isMuted ? '0%' : '75%' }}
              />
            </div>
          </div>

          <span className="text-xs text-neutral-400 font-mono flex items-center gap-1 bg-neutral-900 px-2.5 py-1 rounded-md">
            <Server size={12} className="text-neutral-500" />
            VOD-FEED
          </span>
        </div>

        {/* Center Side: Active Diagnostic Information */}
        <div className="hidden lg:flex items-center gap-6 text-[11px] font-mono text-neutral-400 bg-[#0d0d0d] px-4 py-2 rounded-lg border border-neutral-800/40">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>Codec: H.264/AAC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>FPS: {fps} fps</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00a2fd]">
            <span>Rate: {bandwidth} Mbps</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary-red">
            <span>Buffer: {bufferState.toFixed(1)}%</span>
          </div>
        </div>

        {/* Right Side: Quality Settings, Refresh & Scale */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Quality Adaptation */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="px-3 py-1.5 text-xs font-mono font-bold border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all bg-neutral-900"
            >
              <Settings size={14} className="animate-spin-slow" />
              Quality: {quality}
            </button>

            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-32 bg-[#131313] border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-30 font-mono">
                {(['Auto', '1080p', '720p', '480p'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQualityChange(q)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all ${
                      quality === q
                        ? 'bg-primary-red text-white font-bold'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="p-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all border border-neutral-800/80 bg-neutral-900"
            title="Refresh stream feed"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.requestFullscreen().catch(() => {});
              } else {
                // Mock full screen toast
                alert("Fullscreen sandbox streaming optimized for mobile and desktop screens!");
              }
            }}
            className="p-2.5 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all border border-neutral-800/80 bg-neutral-900"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
