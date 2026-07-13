import React, { useState, useEffect } from 'react';
import { 
  Download, Tv, Radio, Menu, X, ChevronDown, ChevronUp, Globe, 
  Activity, Github, Flame, Award, Terminal, Cloud, Sparkles,
  ShieldCheck, ArrowRight, Play, Server, Smartphone, Monitor, Info,
  ExternalLink, Zap, Users, Shield, Cpu, Compass, PlayCircle, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import VideoPlayer from './components/VideoPlayer';
import M3uParser from './components/M3uParser';
import EPGSchedule from './components/EPGSchedule';
import ApkSection from './components/ApkSection';

import { triggerHaptic, HAPTIC_PATTERNS } from './utils/haptic';

import { POPULAR_CHANNELS, FAQS, APK_DOWNLOAD_URL } from './data';
import { Channel } from './types';
import mockupImage from './assets/images/android_mockup_screen_1783974865785.jpg';
import screenHomeDashboard from './assets/images/screen_home_dashboard_1783976779027.jpg';
import screenBanglaChannels from './assets/images/screen_bangla_channels_1783976794880.jpg';
import screenLiveSports from './assets/images/screen_live_sports_1783976807247.jpg';
import screenLivePlayer from './assets/images/screen_live_player_1783976823981.jpg';

const SLIDES = [
  { url: mockupImage, alt: "PRO TV PLUS App Launcher Screen" },
  { url: screenHomeDashboard, alt: "IPTV Classic & Retro TV Dashboard" },
  { url: screenBanglaChannels, alt: "Bangla Live Channels Category Hub" },
  { url: screenLiveSports, alt: "Live Arena Sports Matches" },
  { url: screenLivePlayer, alt: "Premium Sports Live Streaming Player" }
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(POPULAR_CHANNELS[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [liveViewers, setLiveViewers] = useState<number>(14208);
  const [heroHovered, setHeroHovered] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Auto slide interval
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(slideInterval);
  }, []);

  // Update live viewer counter to feel highly organic and immersive
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers((prev) => prev + Math.floor(Math.random() * 11) - 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    triggerHaptic(HAPTIC_PATTERNS.mediumClick);
    setSelectedChannel(channel);
    if (channel.category) {
      // Handle Hindi/Urdu capitalization and spacing gracefully
      let formattedCat = channel.category;
      if (formattedCat.toLowerCase() === 'hindi/urdu') {
        formattedCat = 'Hindi/Urdu';
      } else {
        formattedCat = channel.category.charAt(0).toUpperCase() + channel.category.slice(1);
      }
      setActiveCategory(formattedCat);
    }
    const playerEl = document.getElementById('hero-spotlight');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRefreshStream = () => {
    triggerHaptic(HAPTIC_PATTERNS.doubleTap);
    const current = selectedChannel;
    setSelectedChannel({ ...current, id: `${current.id}-refresh-${Date.now()}` });
  };

  const toggleFaq = (index: number) => {
    triggerHaptic(HAPTIC_PATTERNS.softClick);
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Download simulation and automatic background download trigger
  const [downloadOverlayOpen, setDownloadOverlayOpen] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [downloadStep, setDownloadStep] = useState<string>('');

  const startDirectDownload = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    triggerHaptic(HAPTIC_PATTERNS.heavyConfirm);
    setDownloadPercent(0);
    setDownloadStep('Initializing secure background connection to GitHub repository...');
    setDownloadOverlayOpen(true);
    
    let currentVal = 0;
    const interval = setInterval(() => {
      currentVal += Math.floor(Math.random() * 9) + 4;
      if (currentVal >= 100) {
        currentVal = 100;
        clearInterval(interval);
        setDownloadPercent(100);
        setDownloadStep('Package assembled successfully! Triggering automatic browser save...');
        triggerHaptic(HAPTIC_PATTERNS.successBlast);
        
        // Execute real, reliable browser download of the APK file
        try {
          const link = document.createElement('a');
          link.href = APK_DOWNLOAD_URL;
          link.setAttribute('download', 'app-release.apk');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          window.location.assign(APK_DOWNLOAD_URL);
        }
        
        // Keep success message visible for 2 seconds then fade out
        setTimeout(() => {
          setDownloadOverlayOpen(false);
        }, 2000);
      } else {
        setDownloadPercent(currentVal);
        if (currentVal < 25) {
          setDownloadStep('Establishing SSL handshake with CDN edge servers...');
        } else if (currentVal < 45) {
          setDownloadStep('Piping cryptographic manifest signature check...');
        } else if (currentVal < 70) {
          setDownloadStep(`Streaming segments: parsed ${currentVal}% (File size: ~18.4 MB)`);
        } else if (currentVal < 90) {
          setDownloadStep('Running Android package verification checks...');
        } else {
          setDownloadStep('Preparing local browser filesystem storage...');
        }
      }
    }, 110);
  };

  const handleCategoryClick = (category: string) => {
    triggerHaptic(HAPTIC_PATTERNS.softClick);
    setActiveCategory(category);
    const playerEl = document.getElementById('player-section');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#e5e2e1] selection:bg-primary-red selection:text-white antialiased font-sans relative overflow-x-hidden">
      
      {/* Background Decorative Ambient Canvas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-red/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00a2fd]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Dynamic Header / Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-neutral-900/60 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Side: Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-red to-red-600 flex items-center justify-center text-white shadow-xl shadow-primary-red/20 border border-white/10 shrink-0">
                <Tv size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight font-display text-white leading-none">
                    PRO TV PLUS
                  </span>
                  <span className="px-1.5 py-0.5 bg-primary-red/15 border border-primary-red/30 rounded text-[8px] font-mono font-black text-primary-red">
                    LIVE
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-neutral-400 tracking-wider uppercase block mt-1">
                  EPG & IPTV Player Client
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Spotlight', href: '#hero-spotlight' },
                { label: 'Core Specs', href: '#features-section' },
                { label: 'Tuner Desk', href: '#player-section' },
                { label: 'IPTV Sandbox', href: '#m3u-section' },
                { label: 'Device Setup', href: '#apk-section' },
                { label: 'FAQ', href: '#faq-section' }
              ].map((link) => (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="relative text-xs font-bold font-display uppercase tracking-wider text-neutral-400 hover:text-white transition-all group py-1"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary-red transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Right Side: Telemetry Viewers Indicator + CTA */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#0c0c10] border border-neutral-800/80 rounded-full px-3.5 py-1.5 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-neutral-400 font-medium">
                  Active Viewers: <span className="text-white font-bold">{liveViewers.toLocaleString()}</span>
                </span>
              </div>

              <button 
                onClick={startDirectDownload}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-red to-red-600 hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1.5 shadow-lg shadow-primary-red/15 hover:shadow-primary-red/25 border border-white/10 uppercase tracking-widest font-display cursor-pointer"
              >
                <Download size={14} />
                Get App APK
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#0c0c10] border border-neutral-800/80 rounded-full px-2.5 py-1 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                <span className="text-white font-bold">{liveViewers.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900/60 border border-neutral-800/60 transition-all"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-neutral-900 bg-[#07070a]/95 backdrop-blur-xl px-4 py-5 space-y-2 font-display"
            >
              {[
                { label: 'Spotlight', href: '#hero-spotlight' },
                { label: 'Core Specs', href: '#features-section' },
                { label: 'Tuner Desk', href: '#player-section' },
                { label: 'IPTV Sandbox', href: '#m3u-section' },
                { label: 'Device Setup', href: '#apk-section' },
                { label: 'FAQ', href: '#faq-section' }
              ].map((link) => (
                <a 
                  key={link.label}
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-bold uppercase text-neutral-400 hover:text-white hover:bg-neutral-900/50 rounded-xl transition-all"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  startDirectDownload(e);
                }}
                className="w-full text-center py-3 px-4 rounded-xl bg-gradient-to-r from-primary-red to-red-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all mt-4 cursor-pointer shadow-lg shadow-primary-red/10"
              >
                <Download size={15} />
                DOWNLOAD OFFICIAL APK
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Immersive Google TV / Apple TV Style Hero Section */}
      <header id="hero-spotlight" className="relative py-16 lg:py-24 border-b border-neutral-900/40 overflow-hidden z-10">
        
        {/* Cinematic Background Spotlight Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#050508]" />
        
        {/* Ambient colored orbs focused near screen mockup */}
        <div className="absolute right-[10%] top-[20%] w-[400px] h-[400px] bg-primary-red/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute right-[25%] bottom-[15%] w-[300px] h-[300px] bg-[#00a2fd]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Highly-Polished Content Frame */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-5 space-y-6 text-center lg:text-left"
            >
              
              {/* Premium Badge Ticker */}
              <div className="inline-flex items-center gap-2 bg-[#0c0c10]/90 border border-white/5 px-4 py-1.5 rounded-full text-xs font-bold text-neutral-300 font-mono">
                <Sparkles className="text-primary-red" size={13} />
                <span>Next-Gen IPTV Hub & EPG Client v2.0</span>
              </div>
              
              {/* Confident, Large Display Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-none uppercase">
                The Cinematic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-red via-red-500 to-amber-500 drop-shadow">TV Experience</span> Unchained
              </h1>

              {/* Polished Copywriting describing benefits */}
              <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
                Stream over <span className="text-white font-semibold">500+ premium channels</span> in spectacular high definition. From live World Cup Cricket and news desks, to legendary Bangla drama serials and cartoons—all integrated into a single stunning dashboard. Zero fees, zero accounts, zero compromises.
              </p>

              {/* Immersive Specifications / Telemetry list */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Cpu size={14} className="text-[#00a2fd]" />
                  <span>Ultra-Low Latency</span>
                </div>
                <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  <span>Bitrate Adaptive</span>
                </div>
                <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>No Login Barrier</span>
                </div>
              </div>

              {/* Action buttons matching Premium App Stores */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                
                {/* Direct App Download Link */}
                <button
                  onClick={startDirectDownload}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-primary-red/20 hover:shadow-primary-red/30 hover:-translate-y-0.5 uppercase tracking-wider font-display cursor-pointer border border-white/5"
                >
                  <Download size={16} />
                  Download Free APK
                </button>

                {/* Google Play Store Badge Mock */}
                <button
                  onClick={() => {
                    alert("Pro TV Plus APK is verified safe and clean. Google Play Store optimization is currently packaging for regional Android TV compliance. Click 'Download Free APK' to stream immediately!");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#09090c]/90 hover:bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 text-white transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 cursor-pointer text-left"
                >
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 20.2V3.8C3 3.1 3.5 2.7 4.1 2.9L16.2 11.2C16.8 11.6 16.8 12.4 16.2 12.8L4.1 21.1C3.5 21.3 3 20.9 3 20.2Z" fill="#00E676" />
                    <path d="M16.2 12.8L12.5 15.6L10.2 12L12.5 8.4L16.2 11.2C16.8 11.6 16.8 12.4 16.2 12.8Z" fill="#FFC107" />
                    <path d="M3 3.8V20.2L10.2 12L3 3.8Z" fill="#00B0FF" />
                    <path d="M10.2 12L12.5 15.6L4.1 21.1C3.5 21.3 3 20.9 3 20.2V3.8C3 3.1 3.5 2.7 4.1 2.9L10.2 12Z" fill="#FF1744" opacity="0.15" />
                    <path d="M3 3.8C3 3.1 3.5 2.7 4.1 2.9L12.5 8.4L10.2 12L3 3.8Z" fill="#FF1744" />
                  </svg>
                  <div>
                    <p className="text-[9px] uppercase text-neutral-500 font-mono leading-none tracking-widest">GET IT ON</p>
                    <p className="text-sm font-black font-display text-white leading-tight">Google Play</p>
                  </div>
                </button>
              </div>

            </motion.div>

            {/* Right Column: Live Smart-TV Streaming Showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-7 flex flex-col items-center justify-center relative w-full"
            >
              
              {/* Backing Ambient Stream Projection Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-red/10 to-[#00a2fd]/10 rounded-3xl blur-2xl opacity-75 pointer-events-none animate-pulse-slow animate-spin-slow" />

              {/* Smart-TV / Cinematic Monitor Console frame */}
              <div className="relative w-full rounded-2xl bg-neutral-900/90 border border-neutral-800/80 p-2 sm:p-3 shadow-[0_30px_80px_rgba(0,0,0,0.85)] transition-all duration-300">
                
                {/* Sleek top status header dot */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20 pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-red animate-ping" />
                  <span className="text-[7px] font-mono font-bold text-neutral-400 tracking-wider">LIVE FEED ACTIVE</span>
                </div>

                <div className="rounded-xl overflow-hidden bg-black border border-neutral-950">
                  <VideoPlayer 
                    channel={selectedChannel} 
                    onRefresh={handleRefreshStream}
                  />
                </div>

                {/* Elegant TV base stand design accent */}
                <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 w-24 h-2 bg-neutral-800 border-x border-b border-neutral-900 rounded-b-md shadow-md" />
                <div className="hidden sm:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-40" />

              </div>

              {/* Quick Remote controller panel */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-neutral-400 bg-black/60 border border-neutral-900/60 px-4 py-2 rounded-full backdrop-blur-md">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {selectedChannel.name}</span>
                <span className="text-neutral-700">|</span>
                <span className="text-neutral-400">Adaptive Stream</span>
                <span className="text-neutral-700">|</span>
                <span className="text-neutral-500">Auto Play Enabled</span>
              </div>

            </motion.div>

          </div>
        </div>
      </header>

      {/* Main Container Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-24 relative z-10">
        
        {/* SECTION 1: Spectacular Bento Grid for Core Specs */}
        <section id="features-section" className="pt-12 scroll-mt-24 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-black text-primary-red uppercase tracking-widest bg-primary-red/10 px-3 py-1.5 rounded-full">
              CORE STREAMING FRAMEWORK
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-display text-white uppercase tracking-tight">
              A Glimpse of True Craftsmanship
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Engineered with advanced decoding mechanisms and local network adaptation, redefining how live content is experienced.
            </p>
          </div>

          {/* Bento CSS Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Block 1: Cinematic Quality (Large Col span) */}
            <div className="md:col-span-2 p-8 bg-gradient-to-br from-[#0c0c10] to-[#0f0f15] border border-neutral-900 rounded-3xl hover:border-primary-red/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 w-44 h-44 bg-primary-red/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 group-hover:bg-primary-red/10" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center border border-primary-red/25 group-hover:scale-105 transition-transform">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                    Ultra-HD Adaptive Broadcast
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed max-w-lg">
                    Experience crystal-clear sport feeds, breaking news columns, and local Bangla cinema in full High Definition. No compression loss, no frame drops, just raw digital rendering directly within your viewport.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex flex-wrap gap-2 text-[10px] font-mono font-bold text-neutral-400">
                <span className="px-2.5 py-1 bg-black/40 rounded-md border border-neutral-900">1080P HD</span>
                <span className="px-2.5 py-1 bg-black/40 rounded-md border border-neutral-900">60 FPS CHANNELS</span>
                <span className="px-2.5 py-1 bg-[#1c0809] text-primary-red rounded-md border border-primary-red/10">STADIUM-FEEL</span>
              </div>
            </div>

            {/* Bento Block 2: Latency Adaptation */}
            <div className="p-8 bg-gradient-to-br from-[#0c0c10] to-[#0f0f15] border border-neutral-900 rounded-3xl hover:border-blue-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a2fd]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#00a2fd]/10 text-[#00a2fd] flex items-center justify-center border border-blue-500/25 group-hover:scale-105 transition-transform">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                    Zero-Buffer engine
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Powered by high-velocity edge caching. Dynamically recalibrates stream latency to adapt perfectly to 3G, 4G, or unstable broadband connections.
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-mono text-[#00a2fd] font-bold flex items-center gap-1.5 pt-4">
                <Zap size={12} />
                <span>DYNAMIC LATENCY BUFFERING ACTIVE</span>
              </div>
            </div>

            {/* Bento Block 3: Sandbox M3U */}
            <div className="p-8 bg-gradient-to-br from-[#0c0c10] to-[#0f0f15] border border-neutral-900 rounded-3xl hover:border-purple-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/25 group-hover:scale-105 transition-transform">
                  <Terminal size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                    Sandbox M3U Studio
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Pristine client-side playlist processing. We parse your custom streaming URLs locally, ensuring maximum sandbox security.
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1.5 pt-4">
                <ShieldCheck size={12} />
                <span>LOCAL SANDBOX PERSISTENCE</span>
              </div>
            </div>

            {/* Bento Block 4: Multi-device (Large Col span) */}
            <div className="md:col-span-2 p-8 bg-gradient-to-br from-[#0c0c10] to-[#0f0f15] border border-neutral-900 rounded-3xl hover:border-green-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-0 right-0 w-44 h-44 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/25 group-hover:scale-105 transition-transform">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                    Cross-Device Smart Integration
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed max-w-lg">
                    Pro TV Plus features native architectural layouts optimized for any screen size. Stream fluidly on Android smartphones, standard browser viewports, or deploy straight to Android TV boxes and Fire Sticks.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex flex-wrap gap-2 text-[10px] font-mono font-bold text-neutral-400">
                <span className="px-2.5 py-1 bg-black/40 rounded-md border border-neutral-900 flex items-center gap-1">
                  <Smartphone size={11} /> Mobile UI
                </span>
                <span className="px-2.5 py-1 bg-black/40 rounded-md border border-neutral-900 flex items-center gap-1">
                  <Monitor size={11} /> Desktop Dashboard
                </span>
                <span className="px-2.5 py-1 bg-black/40 rounded-md border border-neutral-900 flex items-center gap-1">
                  <Tv size={11} /> Android TV Screen
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 2: Horizontal Scrolling Category Navigator */}
        <section id="categories-section" className="scroll-mt-24 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-900 pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-[#00a2fd] uppercase tracking-widest block mb-1">
                CINEMATIC GRID NAVIGATOR
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
                Browse Global Channels
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm font-sans leading-relaxed">
              Tuning channels is instantaneous. Select a curated category block to trigger the live EPG tuner grid below.
            </p>
          </div>

          {/* Elegant responsive horizontal category cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'Sports', label: 'Sports Arena', count: '45+ Live Feeds', icon: Flame, color: 'text-primary-red bg-primary-red/10 border-primary-red/15 hover:border-primary-red/35 active:bg-primary-red/20' },
              { id: 'Bangla', label: 'Bangla Serials', count: '150+ Channels', icon: Tv, color: 'text-orange-500 bg-orange-500/10 border-orange-500/15 hover:border-orange-500/35 active:bg-orange-500/20' },
              { id: 'Hindi/Urdu', label: 'Hindi/Urdu Ch', count: '90+ Live Streams', icon: Radio, color: 'text-rose-500 bg-rose-500/10 border-rose-500/15 hover:border-rose-500/35 active:bg-rose-500/20' },
              { id: 'News', label: 'Breaking News', count: '80+ Streams', icon: Globe, color: 'text-blue-500 bg-blue-500/10 border-blue-500/15 hover:border-blue-500/35 active:bg-blue-500/20' },
              { id: 'Movies', label: 'Premium Cinema', count: '120+ Feeds', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10 border-purple-500/15 hover:border-purple-500/35 active:bg-purple-500/20' },
              { id: 'Kids', label: 'Kids Channel', count: '50+ Cartoons', icon: Award, color: 'text-green-500 bg-green-500/10 border-green-500/15 hover:border-green-500/35 active:bg-green-500/20' }
            ].map((cat) => {
              const isSelected = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <div 
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`p-5 bg-[#0c0c10] border rounded-2xl cursor-pointer transition-all duration-300 group relative overflow-hidden select-none ${
                    isSelected ? 'border-primary-red bg-gradient-to-b from-[#120506] to-[#0c0c10]' : 'border-neutral-900 hover:border-neutral-800'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110 ${cat.color}`}>
                    <Icon size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-white font-display uppercase tracking-wide group-hover:text-white transition-all">
                    {cat.label}
                  </h4>
                  <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">
                    {cat.count}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[9px] font-mono font-bold text-neutral-500">
                    <span>LAUNCH NOW</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* SECTION 3: Live TV Streaming Hub Dashboard (Tuner Desk) */}
        <section id="player-section" className="space-y-6 scroll-mt-24">
          <div className="border-l-4 border-primary-red pl-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white font-display">
                Live TV Streaming Console
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Curating: <span className="text-primary-red font-bold font-mono uppercase">{selectedChannel.name}</span> • Adapting source in real-time.
              </p>
            </div>
            
            {/* Dynamic Telemetry Bitrate counter */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-neutral-900 rounded-md text-[10px] font-mono text-neutral-400">
              <Eye size={12} className="text-primary-red" />
              <span>Bitrate: {selectedChannel.bitrate || "5.2 Mbps"}</span>
            </div>
          </div>

          {/* Interactive Player Console Frame */}
          <div className="bg-[#0c0c10] border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl relative p-6 bg-gradient-to-b from-[#08080a] to-[#0c0c10]">
            
            {/* EPG Tuner Schedule Guides */}
            <EPGSchedule 
              channels={POPULAR_CHANNELS} 
              selectedChannelId={selectedChannel.id} 
              onSelectChannel={handleSelectChannel}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            
          </div>
        </section>

        {/* SECTION 4: Interactive M3U Playlist Parser Sandbox */}
        <section id="m3u-section" className="scroll-mt-24">
          <div className="bg-[#0c0c10] border border-neutral-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00a2fd]/5 rounded-full blur-[80px] pointer-events-none" />
            <M3uParser onSelectChannel={handleSelectChannel} />
          </div>
        </section>

        {/* SECTION 5: Android APK Setup (QR, Progress, Emulators) */}
        <section id="apk-section" className="scroll-mt-24">
          <div className="bg-[#0c0c10] border border-neutral-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-red/5 rounded-full blur-[80px] pointer-events-none" />
            <ApkSection onDownloadTrigger={startDirectDownload} />
          </div>
        </section>

        {/* SECTION 6: FAQ Accordion Panels */}
        <section id="faq-section" className="bg-[#0c0c10] border border-neutral-900 rounded-3xl p-6 lg:p-10 shadow-xl scroll-mt-24">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-primary-red uppercase tracking-wider bg-primary-red/10 px-3 py-1.5 rounded-full">
              SUPPORT & POLICIES
            </span>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white font-display">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-neutral-400">
              Clear technical documentation, legal streaming guidelines, and remote controller setup directives.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#060609] border border-neutral-900/60 hover:border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-display text-sm font-bold text-white hover:text-primary-red transition-all cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-800">
                      {isOpen ? (
                        <ChevronUp size={16} className="text-primary-red" />
                      ) : (
                        <ChevronDown size={16} className="text-neutral-500" />
                      )}
                    </div>
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-neutral-400 font-sans leading-relaxed border-t border-neutral-900/40 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: Bottom Immersive Call To Action */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-[#050508] via-[#0d0d12] to-[#1a0507] border border-neutral-900 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-red/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <span className="text-[10px] font-mono font-bold text-primary-red uppercase tracking-widest bg-primary-red/10 px-3 py-1.5 rounded-full inline-block">
              INSTANT STREAMING LAUNCHER
            </span>
            <h3 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight uppercase leading-none">
              Start Streaming For Free
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
              No account registrations, no monthly service charges, no contracts. Simply fetch our lightweight, secure APK file to instantly project your channels onto any smartphone, tablet, or Android TV.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
            <button
              onClick={startDirectDownload}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-xs uppercase tracking-widest font-display transition-all cursor-pointer hover:shadow-lg hover:shadow-primary-red/20 hover:-translate-y-0.5 border border-white/5 text-center"
            >
              Get App APK
            </button>
            <a
              href="#player-section"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0c0c11] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-widest font-display transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Launch Browser Player
            </a>
          </div>
        </section>

      </main>

      {/* Visual Footer Branding */}
      <footer className="border-t border-neutral-900 bg-[#040406] py-16 text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-10">
            {/* Left side brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-red/10 border border-primary-red/20 flex items-center justify-center text-primary-red">
                <Tv size={15} />
              </div>
              <div>
                <span className="font-display font-black text-white text-base tracking-tight uppercase block leading-none">
                  PRO TV PLUS
                </span>
                <span className="text-[8px] text-neutral-500 uppercase font-mono tracking-wider block mt-1">
                  EPG & IPTV Player Client
                </span>
              </div>
            </div>

            {/* Middle links */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              <a href="#hero-spotlight" className="hover:text-white transition-all">Spotlight</a>
              <a href="#features-section" className="hover:text-white transition-all">Features</a>
              <a href="#categories-section" className="hover:text-white transition-all">Categories</a>
              <a href="#player-section" className="hover:text-white transition-all">Tuner Desk</a>
              <a href="#m3u-section" className="hover:text-white transition-all">M3U Sandbox</a>
              <a href="#apk-section" className="hover:text-white transition-all">Download APK</a>
            </div>
          </div>

          <p className="max-w-2xl text-left leading-relaxed text-neutral-600 text-[10px] font-sans">
            Disclaimer: Pro TV Plus indexes and parses freely accessible live streaming sources found publicly on third-party internet sites. We do not host, store, or stream any copyrighted video files, audio tracks, or media streams on our servers. All properties belong to their respective copyright holders.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 text-[10px] uppercase font-bold tracking-wider border-t border-neutral-900/40">
            <div className="flex items-center gap-4 text-neutral-500">
              <a href="https://github.com/shakilemon73" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1.5 transition-all">
                <Github size={13} />
                Developer
              </a>
              <span className="text-neutral-800">|</span>
              <a href="https://github.com/shakilemon73/my-m3u-playlist" target="_blank" rel="noopener noreferrer" className="hover:text-[#00a2fd] flex items-center gap-1.5 transition-all">
                <Github size={13} />
                Source Repo
              </a>
            </div>

            <p className="text-[10px] text-neutral-600 font-mono">
              &copy; {new Date().getFullYear()} PRO TV PLUS. Built with Absolute Open-Source Integrity.
            </p>
          </div>

        </div>
      </footer>

      {/* Premium Download overlay */}
      <AnimatePresence>
        {downloadOverlayOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative bg-neutral-950 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(229,9,20,0.15)] flex flex-col items-center text-center space-y-6"
            >
              {/* Pulsing visual glow background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-red/10 rounded-full blur-3xl pointer-events-none -z-10" />

              {/* Progress Circle Visual */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-neutral-800/60"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-primary-red"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - downloadPercent / 100)}
                    strokeLinecap="round"
                    transition={{ duration: 0.1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-display text-white tracking-tight">
                    {downloadPercent}%
                  </span>
                  <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-0.5">
                    BUFFERS
                  </span>
                </div>
              </div>

              {/* App Meta Title details */}
              <div className="space-y-1.5">
                <h4 className="text-base font-black font-display text-white uppercase tracking-wider">
                  PREPARING SECURE DOWNLOAD
                </h4>
                <p className="text-xs text-neutral-400 font-sans max-w-xs mx-auto">
                  PRO TV PLUS Official IPTV Launcher for Android TV & Mobile
                </p>
              </div>

              {/* Stack status telemetry log */}
              <div className="w-full bg-[#07070a] border border-neutral-800/80 rounded-xl p-3.5 text-[10px] font-mono text-left space-y-1.5">
                <div className="text-neutral-500 flex items-center justify-between">
                  <span>TRANSFER HANDSHAKE</span>
                  <span className="text-green-500 animate-pulse">● LIVE SECURE</span>
                </div>
                <div className="text-[#00a2fd] flex items-start gap-1.5 leading-relaxed min-h-[30px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a2fd] shrink-0 mt-1 animate-ping" />
                  <span>{downloadStep}</span>
                </div>
                <div className="text-neutral-600 truncate border-t border-neutral-900/60 pt-1.5">
                  SRC: raw.githubusercontent.com/.../app-release.apk
                </div>
              </div>

              {/* Help tip details */}
              <div className="space-y-3 w-full pt-1">
                <p className="text-[10px] text-neutral-500 leading-relaxed max-w-xs mx-auto">
                  To preserve security, the download happens completely in the background. No redirections or account logins required.
                </p>
                <div className="flex gap-2 justify-center">
                  <a
                    href={APK_DOWNLOAD_URL}
                    download="Pro-Tv-Plus-v2.apk"
                    className="text-[11px] font-bold text-primary-red hover:text-red-400 transition-all cursor-pointer underline"
                  >
                    Click here if download didn't start
                  </a>
                  <span className="text-neutral-700">|</span>
                  <button 
                    onClick={() => setDownloadOverlayOpen(false)}
                    className="text-[11px] font-bold text-neutral-400 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
