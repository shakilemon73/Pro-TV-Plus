import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Maximize, RefreshCw, Radio, Server, Activity, ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';
import { Channel } from '../types';
import Hls from 'hls.js';
import { triggerHaptic, HAPTIC_PATTERNS } from '../utils/haptic';

interface VideoPlayerProps {
  channel: Channel | null;
  onRefresh?: () => void;
}

export default function VideoPlayer({ channel, onRefresh }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [quality, setQuality] = useState<'Auto' | '1080p' | '720p' | '480p'>('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [latency, setLatency] = useState(1.15);
  const [bandwidth, setBandwidth] = useState(4.8);
  const [fps, setFps] = useState(60);
  const [bufferState, setBufferState] = useState(0.0);
  const [statusMessage, setStatusMessage] = useState('Buffering...');
  const [streamActive, setStreamActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isStreamHttp = channel?.streamUrl?.startsWith('http://');
  const hasMixedContentRisk = isHttps && isStreamHttp;

  const [useProxy, setUseProxy] = useState(false);

  useEffect(() => {
    setUseProxy(hasMixedContentRisk);
  }, [channel?.id, hasMixedContentRisk]);

  // Hls stream loader effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;

    // Reset previous stream
    setStreamActive(false);
    setIsLoading(true);
    setPlaybackError(null);
    setStatusMessage('Connecting to feed server...');

    // Clean up older Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const playVideo = () => {
      video.play()
        .then(() => {
          setIsPlaying(true);
          setStreamActive(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.warn('Autoplay block detected, trying muted play:', err);
          video.muted = true;
          setIsMuted(true);
          video.play()
            .then(() => {
              setIsPlaying(true);
              setStreamActive(true);
              setIsLoading(false);
            })
            .catch(e => {
              console.error('Muted autoplay also blocked:', e);
              setIsPlaying(false);
              setIsLoading(false);
            });
        });
    };

    const streamSource = useProxy 
      ? `/api/proxy?url=${encodeURIComponent(channel.streamUrl)}`
      : channel.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferSize: 30 * 1000 * 1000, // 30MB
      });
      hlsRef.current = hls;

      hls.loadSource(streamSource);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatusMessage('Manifest decoded! Rendering HLS video buffer...');
        playVideo();
      });

      hls.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
        // Compute approximate buffer state
        if (video.buffered && video.buffered.length > 0) {
          const duration = video.duration || 1;
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          setBufferState(Math.min(100, (bufferedEnd / duration) * 100));
        }
      });

      let networkErrorRetryCount = 0;
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('Hls.js fatal error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (networkErrorRetryCount < 3) {
                networkErrorRetryCount++;
                setStatusMessage(`Network error. Retrying connection (${networkErrorRetryCount}/3)...`);
                hls.startLoad();
              } else if (useProxy) {
                console.warn('Proxy request failed. Bypassing proxy and trying direct connection...');
                setStatusMessage('Proxy failed (possibly blocked port). Trying direct stream...');
                setUseProxy(false);
              } else {
                setPlaybackError('Live stream network error or server connection refused. Make sure you are not behind a firewall or restricted network.');
                setStreamActive(false);
                setIsLoading(false);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setStatusMessage('Media format warning. Retrying track synchronization...');
              hls.recoverMediaError();
              break;
            default:
              if (useProxy) {
                console.warn('Proxy request failed with other error. Bypassing proxy and trying direct connection...');
                setUseProxy(false);
              } else {
                setPlaybackError('Live server connection refused, stream offline, or blocked by browser security (HTTP stream on HTTPS page).');
                setStreamActive(false);
                setIsLoading(false);
              }
              break;
          }
        } else {
          console.warn('Hls.js non-fatal warning:', data.details || data.type);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS fallback (Safari and iOS)
      video.src = streamSource;
      video.addEventListener('loadedmetadata', () => {
        setStatusMessage('Safari HLS stream loaded.');
        playVideo();
      });

      video.addEventListener('error', (e) => {
        console.error('Native video error:', e);
        if (useProxy) {
          console.warn('Native proxy load failed, attempting direct bypass...');
          setUseProxy(false);
        } else {
          setPlaybackError('Stream failed to load in native player.');
          setStreamActive(false);
          setIsLoading(false);
        }
      });
    } else {
      // Default HTML5 video fallback
      video.src = streamSource;
      video.addEventListener('canplay', () => {
        playVideo();
      });
      video.addEventListener('error', () => {
        if (useProxy) {
          console.warn('Fallback proxy load failed, attempting direct bypass...');
          setUseProxy(false);
        } else {
          setPlaybackError('Direct video stream playback not supported in this browser.');
          setStreamActive(false);
          setIsLoading(false);
        }
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel?.streamUrl, channel?.id, useProxy]);

  // Sync play/pause control on state change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Sync mute state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.volume = isMuted ? 0 : 0.85;
  }, [isMuted]);

  // Handle stream telemetry simulation fluctuations
  useEffect(() => {
    if (!isPlaying || !streamActive) return;

    const interval = setInterval(() => {
      setLatency(prev => {
        const delta = (Math.random() - 0.5) * 0.04;
        return Math.max(0.85, Math.min(1.5, Number((prev + delta).toFixed(2))));
      });

      setBandwidth(prev => {
        const delta = (Math.random() - 0.5) * 0.2;
        const target = channel ? parseFloat(channel.bitrate || '4.5') : 4.5;
        return Math.max(target - 0.5, Math.min(target + 0.5, Number((prev + delta).toFixed(1))));
      });

      setFps(() => (Math.random() > 0.98 ? 58 : 60));
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, streamActive, channel]);

  // Background audio visualizer for fallback atmosphere
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;
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
      ctx.fillStyle = 'rgba(10, 10, 12, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Backing Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 35;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Visual equalizer wave overlays for background glow
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(229, 9, 20, 0.1)'; // soft red
      ctx.lineWidth = 4;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.01 + offset) * 40;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += 0.03;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    triggerHaptic(HAPTIC_PATTERNS.softClick);
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    triggerHaptic(HAPTIC_PATTERNS.softClick);
    setIsMuted(!isMuted);
  };

  const handleQualityChange = (q: typeof quality) => {
    triggerHaptic(HAPTIC_PATTERNS.softClick);
    setQuality(q);
    setShowQualityMenu(false);
    
    // Change representation in UI or configure HLS levels
    if (hlsRef.current) {
      const hls = hlsRef.current;
      if (q === 'Auto') {
        hls.currentLevel = -1;
      } else {
        // Try mapping 1080p, 720p, 480p to levels
        const levels = hls.levels;
        const matchedIndex = levels.findIndex(lvl => lvl.height === (q === '1080p' ? 1080 : q === '720p' ? 720 : 480));
        if (matchedIndex !== -1) {
          hls.currentLevel = matchedIndex;
        }
      }
    }
  };

  const executeRefresh = () => {
    triggerHaptic(HAPTIC_PATTERNS.doubleTap);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="relative group/player bg-black rounded-2xl border border-neutral-800/80 overflow-hidden shadow-2xl transition-all duration-300">
      
      {/* Live status overlay banner */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none select-none">
        <div className="bg-primary-red/90 text-[10px] font-bold px-3 py-1 rounded-full text-white flex items-center gap-1.5 shadow-lg tracking-wider font-display">
          <span className="w-1.5 h-1.5 bg-white rounded-full live-dot-pulse"></span>
          LIVE STREAMING
        </div>
        {channel && (
          <div className="glass px-3 py-1 rounded-full text-[10px] text-neutral-300 font-mono tracking-wider">
            {channel.resolution || '1080p HD'}
          </div>
        )}
      </div>

      {/* Latency badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none select-none">
        <div className="glass px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 text-[#00a2fd]">
          <Activity size={12} />
          {latency}s latency
        </div>
      </div>

      {/* Main video presentation viewport */}
      <div className="relative aspect-video w-full flex items-center justify-center bg-[#07070a] overflow-hidden">
        
        {/* Fallback backing canvas visualizer */}
        <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 pointer-events-none z-0" />

        {/* REAL VIDEO ELEMENT */}
        {channel && (
          <video
            ref={videoRef}
            className={`w-full h-full object-contain relative z-10 transition-opacity duration-300 ${
              streamActive && !playbackError ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            playsInline
            autoPlay
            onClick={togglePlay}
          />
        )}

        {/* Unmute overlay prompt */}
        {isMuted && streamActive && !playbackError && (
          <button
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.mediumClick);
              setIsMuted(false);
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-5 py-3 bg-gradient-to-r from-primary-red to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-black tracking-widest font-display rounded-full flex items-center gap-2 shadow-2xl shadow-primary-red/40 cursor-pointer transition-all hover:scale-105 uppercase animate-bounce"
          >
            <VolumeX size={14} className="animate-pulse" />
            Tap to Unmute Sound
          </button>
        )}

        {/* Video stream title overlay card */}
        {streamActive && !playbackError && channel && (
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-5 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none select-none">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold text-primary-red uppercase tracking-widest block mb-1 font-display">
                {channel.category.toUpperCase()} Group
              </span>
              <h3 className="text-lg md:text-xl font-black text-white leading-tight font-display drop-shadow-md">
                {channel.name}
              </h3>
              <p className="text-xs text-neutral-300 mt-1 line-clamp-1 drop-shadow font-sans">
                {channel.nowPlayingDetails || channel.nowPlaying}
              </p>
            </div>
          </div>
        )}

        {/* LOADING & BUFFERING INDICATORS */}
        {isLoading && !playbackError && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-15">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-14 h-14 border-2 border-primary-red/30 border-t-primary-red rounded-full animate-spin"></div>
              <Radio className="absolute text-primary-red animate-pulse" size={18} />
            </div>
            <p className="font-mono text-xs text-primary-red font-bold uppercase tracking-widest animate-pulse">
              {statusMessage}
            </p>
            {channel && (
              <p className="text-neutral-400 text-xs mt-2 font-display">
                Syncing buffer payload for {channel.name}...
              </p>
            )}
          </div>
        )}

        {/* STREAM PLAYBACK PLAY ERROR HANDLER */}
        {playbackError && (
          <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-6 text-center z-15">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-primary-red mb-3">
              <ShieldAlert size={22} />
            </div>
            <h5 className="text-xs font-mono font-bold text-primary-red uppercase tracking-widest mb-1">
              STREAM TIMEOUT OR PLAYBACK REFUSED
            </h5>
            <p className="text-xs text-neutral-400 max-w-sm mb-4 leading-relaxed">
              {playbackError}
              {hasMixedContentRisk && (
                <span className="block mt-2 text-amber-500 font-mono text-[10px] leading-normal bg-amber-500/5 border border-amber-500/10 rounded p-1.5">
                  Your browser blocks unencrypted (http://) streams on secure (https://) pages. Try clicking "Open Direct" or enabling "Insecure content" in site settings.
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={executeRefresh}
                className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={12} /> Retry Buffer
              </button>
              {hasMixedContentRisk && (
                <a 
                  href={channel.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all flex items-center gap-1.5"
                >
                  Open Direct <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* BROADCAST PAUSED OVERLAY */}
        {!isPlaying && streamActive && !playbackError && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-15 transition-all">
            <button 
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-primary-red hover:bg-primary-red/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              <Play size={24} className="ml-0.5 fill-current" />
            </button>
            <p className="text-neutral-400 font-display text-xs mt-3 font-semibold uppercase tracking-widest">
              Broadcast Paused
            </p>
          </div>
        )}

        {/* Scanline overlay atmospheric effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-15 z-20" />
      </div>

      {/* Control dashboard deck panel */}
      <div className="p-4 bg-[#0a0a0d] border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 z-20 relative">
        
        {/* Left Side Controls: Playback, volume & Source badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={togglePlay}
            disabled={!streamActive}
            className={`p-2.5 rounded-lg transition-all ${
              !streamActive 
                ? 'text-neutral-700 cursor-not-allowed' 
                : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            {isPlaying && streamActive ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="w-16 h-1.5 bg-neutral-900 rounded-full overflow-hidden relative cursor-pointer group">
              <div 
                className={`h-full rounded-full transition-all ${isMuted ? 'bg-neutral-700' : 'bg-primary-red'}`}
                style={{ width: isMuted ? '0%' : '80%' }}
              />
            </div>
          </div>

          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-900">
            <Server size={11} className="text-neutral-500" />
            LIVE-IPTV
          </span>
        </div>

        {/* Live Diagnostics counters */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-neutral-400 bg-black px-4 py-2 rounded-lg border border-neutral-900">
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

        {/* Right Side Quality Adaptations, refresh & scale */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {hasMixedContentRisk && (
            <button
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.softClick);
                setUseProxy(!useProxy);
              }}
              className={`px-2.5 py-1.5 text-[10px] font-mono font-bold border rounded-lg flex items-center gap-1.5 transition-all ${
                useProxy 
                  ? 'bg-primary-red/20 border-primary-red/50 text-primary-red hover:bg-primary-red/30'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
              title={useProxy ? 'Proxy enabled. Click to bypass proxy and connect directly.' : 'Direct playback. Click to enable proxy server bypass.'}
            >
              <Server size={12} className={useProxy ? 'animate-pulse' : ''} />
              {useProxy ? 'Proxy On' : 'Direct Play'}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="px-3 py-1.5 text-xs font-mono font-bold border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all bg-neutral-950"
            >
              <Settings size={13} className="animate-spin-slow" />
              {quality}
            </button>

            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-32 bg-[#0c0c0e] border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-30 font-mono">
                {(['Auto', '1080p', '720p', '480p'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQualityChange(q)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all ${
                      quality === q
                        ? 'bg-primary-red text-white font-bold'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={executeRefresh}
            className="p-2.5 rounded-lg text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all border border-neutral-900 bg-neutral-950"
            title="Refresh stream feed"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.requestFullscreen().catch(() => {});
              }
            }}
            className="p-2.5 rounded-lg text-neutral-300 hover:bg-neutral-900 hover:text-white transition-all border border-neutral-900 bg-neutral-950"
            title="Fullscreen presentation"
          >
            <Maximize size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}
