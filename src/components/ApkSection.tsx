import React, { useState } from 'react';
import { Download, Smartphone, Tv, Laptop, ChevronDown, CheckCircle, SmartphoneIcon, ShieldCheck, Heart, AlertCircle, Share2 } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../data';

export default function ApkSection({ onDownloadTrigger }: { onDownloadTrigger?: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStepTab, setActiveStepTab] = useState<'mobile' | 'tv' | 'pc'>('mobile');
  const [copiedLink, setCopiedLink] = useState(false);

  const triggerDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDownloadTrigger) {
      onDownloadTrigger();
      return;
    }
    // We let the native download trigger immediately, but we also run our beautiful progress simulator!
    setDownloading(true);
    setProgress(0);
    
    // Execute real browser download trigger
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
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloading(false), 2000);
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(100, prev + step);
      });
    }, 150);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(APK_DOWNLOAD_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="download-panel" className="bg-transparent">
      
      {/* Background visual element */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-red/5 rounded-full blur-[100px] -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Features and Download Trigger */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-primary-red/10 text-primary-red border border-primary-red/25 px-3 py-1 rounded-full text-xs font-bold font-display uppercase tracking-widest">
              <ShieldCheck size={14} />
              Verified APK Mirror
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight leading-none">
              Pro Tv Plus for Android
            </h2>
            <p className="text-sm text-neutral-400 font-sans max-w-lg leading-relaxed">
              Experience flawless live streaming on your mobile phone, tablet, and Android TV device. Zero ads, zero latency, and pure entertainment.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/40">
              <CheckCircle className="text-primary-red shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-bold text-white">500+ Premium Channels</p>
                <p className="text-[11px] text-neutral-400">Sports, Bangla, News, Kids & Drama</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/40">
              <CheckCircle className="text-[#00a2fd] shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-bold text-white">TV-Friendly UI</p>
                <p className="text-[11px] text-neutral-400">Optimized fully for D-Pad controllers</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/40">
              <CheckCircle className="text-[#00a2fd] shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-bold text-white">Direct M3U Import</p>
                <p className="text-[11px] text-neutral-400">Easily inject custom playlist indexes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/40">
              <CheckCircle className="text-primary-red shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-bold text-white">Ad-Block Core</p>
                <p className="text-[11px] text-neutral-400">Stream with no popups or banner blocks</p>
              </div>
            </div>
          </div>

          {/* Download triggers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
            <a
              href={APK_DOWNLOAD_URL}
              onClick={triggerDownload}
              download="Pro-Tv-Plus-v2.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-primary-red hover:bg-primary-red/90 text-white font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary-red/20 active:scale-95 text-center cursor-pointer"
            >
              <Download size={20} className={downloading ? "animate-bounce" : ""} />
              Direct Download APK
            </a>

            <button
              onClick={copyShareLink}
              className="px-6 py-4 rounded-xl bg-[#131313] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer"
            >
              <Share2 size={16} />
              {copiedLink ? 'Copied URL!' : 'Share Mirror Link'}
            </button>
          </div>

          {/* Download Simulator HUD */}
          {downloading && (
            <div className="bg-[#0d0d0d] p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#00a2fd] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  Piping App-release.apk from Local Server...
                </span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-red to-[#00a2fd] transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-neutral-500 font-mono">
                Saving as app-release.apk (File size: ~18.4 MB)
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-neutral-500 font-sans">
            <AlertCircle size={14} className="text-neutral-600 shrink-0" />
            <span>Works on Android 6.0+, Fire OS, Google TV, and Android TV Emulator</span>
          </div>

        </div>

        {/* Right Side: QR Code scan paired with interactive device helper tab */}
        <div className="lg:col-span-5 flex flex-col items-center bg-[#0d0d0d]/90 p-6 rounded-2xl border border-neutral-800/80">
          
          {/* Vector-constructed elegant QR Code */}
          <div className="bg-white p-4 rounded-xl shadow-lg mb-4 hover:scale-105 transition-transform duration-300 relative group">
            <svg className="w-36 h-36 text-black" viewBox="0 0 100 100" fill="currentColor">
              {/* Outer frame anchors */}
              <rect x="0" y="0" width="30" height="30" />
              <rect x="3" y="3" width="24" height="24" fill="white" />
              <rect x="9" y="9" width="12" height="12" />

              <rect x="70" y="0" width="30" height="30" />
              <rect x="73" y="3" width="24" height="24" fill="white" />
              <rect x="79" y="9" width="12" height="12" />

              <rect x="0" y="70" width="30" height="30" />
              <rect x="3" y="73" width="24" height="24" fill="white" />
              <rect x="9" y="79" width="12" height="12" />

              {/* Simulated QR blocks data layout */}
              <rect x="35" y="5" width="6" height="6" />
              <rect x="45" y="12" width="6" height="12" />
              <rect x="55" y="2" width="10" height="6" />
              <rect x="35" y="22" width="12" height="6" />
              <rect x="50" y="22" width="14" height="6" />

              <rect x="5" y="35" width="12" height="6" />
              <rect x="22" y="35" width="18" height="6" />
              <rect x="45" y="35" width="6" height="18" />
              <rect x="55" y="35" width="12" height="12" />
              <rect x="72" y="35" width="18" height="6" />

              <rect x="10" y="45" width="6" height="12" />
              <rect x="25" y="45" width="12" height="6" />
              <rect x="70" y="45" width="6" height="18" />
              <rect x="82" y="45" width="12" height="6" />

              <rect x="5" y="60" width="18" height="6" />
              <rect x="35" y="60" width="6" height="6" />
              <rect x="45" y="58" width="12" height="12" />
              <rect x="62" y="60" width="18" height="6" />

              <rect x="35" y="75" width="18" height="6" />
              <rect x="58" y="75" width="6" height="12" />
              <rect x="70" y="75" width="12" height="6" />
              <rect x="88" y="75" width="6" height="18" />

              <rect x="35" y="88" width="6" height="6" />
              <rect x="45" y="85" width="18" height="6" />
              <rect x="70" y="88" width="12" height="6" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/80 rounded-xl transition-all p-3 text-center">
              <span className="text-[10px] font-bold text-[#00a2fd] uppercase font-mono">
                Scan on Android Camera to Download instantly
              </span>
            </div>
          </div>

          <p className="text-[10px] text-neutral-500 font-mono tracking-wider text-center mb-6">
            SCAN CODE FOR FAST DEVICE SYNC
          </p>

          {/* Quick installation steps */}
          <div className="w-full space-y-4">
            
            {/* Steps select tab */}
            <div className="flex border-b border-neutral-800/80">
              <button
                onClick={() => setActiveStepTab('mobile')}
                className={`flex-1 pb-2 text-xs font-bold font-display uppercase tracking-wider text-center transition-all ${
                  activeStepTab === 'mobile'
                    ? 'border-b-2 border-primary-red text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Mobile Phone
              </button>
              <button
                onClick={() => setActiveStepTab('tv')}
                className={`flex-1 pb-2 text-xs font-bold font-display uppercase tracking-wider text-center transition-all ${
                  activeStepTab === 'tv'
                    ? 'border-b-2 border-[#00a2fd] text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Smart TV
              </button>
              <button
                onClick={() => setActiveStepTab('pc')}
                className={`flex-1 pb-2 text-xs font-bold font-display uppercase tracking-wider text-center transition-all ${
                  activeStepTab === 'pc'
                    ? 'border-b-2 border-primary-red text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                PC Player
              </button>
            </div>

            {/* Steps text contents */}
            <div className="space-y-3 pt-1 text-xs leading-relaxed">
              {activeStepTab === 'mobile' && (
                <ul className="space-y-2.5 text-neutral-300 list-decimal pl-4">
                  <li>Click the **Direct Download APK** button on your mobile device.</li>
                  <li>Before launching, open Android **Settings &gt; Security**.</li>
                  <li>Enable the **Allow Installation from Unknown Sources** toggle.</li>
                  <li>Open the file download folder and run the **Pro Tv Plus** installer package.</li>
                </ul>
              )}

              {activeStepTab === 'tv' && (
                <ul className="space-y-2.5 text-neutral-300 list-decimal pl-4">
                  <li>Install the official **Downloader** app from your Smart TV Play Store / Amazon Appstore.</li>
                  <li>Open Downloader, enter the following shortcode or URL: <code className="text-[#00a2fd] bg-neutral-900 px-1 py-0.5 rounded font-mono text-[10px]">protvplus.site</code></li>
                  <li>The APK file will instantly fetch from GitHub releases and prepare for TV setup.</li>
                  <li>Click Install and launch with your default TV remote controller.</li>
                </ul>
              )}

              {activeStepTab === 'pc' && (
                <ul className="space-y-2.5 text-neutral-300 list-decimal pl-4">
                  <li>No emulator needed! You can use our **Interactive M3U IPTV Builder** section directly above.</li>
                  <li>Simply load the preloaded channels list or paste custom streaming files.</li>
                  <li>Stream media instantly in native HD with absolute browser sandboxing.</li>
                </ul>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
