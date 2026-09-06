import React from 'react';
import { Camera, Activity, SlidersHorizontal, Keyboard, } from 'lucide-react';
export const Footer = ({ activeTab, setActiveTab, onOpenShortcuts, }) => {
    return (<footer id="emotitunes-app-footer" className="w-full mt-auto border-t border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md transition-colors duration-200 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Footer Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-400 dark:text-white/40 mr-1 hidden sm:inline">
              Workspace Modules:
            </span>
            <button onClick={() => setActiveTab('extraction')} className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'extraction'
            ? 'text-[#F27D26] font-semibold bg-[#F27D26]/10'
            : 'text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'}`}>
              <Camera className="w-3.5 h-3.5 shrink-0"/>
              <span>Face Emotion Extraction</span>
            </button>

            <button onClick={() => setActiveTab('aer-features')} className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'aer-features'
            ? 'text-[#F27D26] font-semibold bg-[#F27D26]/10'
            : 'text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'}`}>
              <Activity className="w-3.5 h-3.5 shrink-0"/>
              <span>Sound &amp; Waves (AER)</span>
            </button>

            <button onClick={() => setActiveTab('mir-playlist')} className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'mir-playlist'
            ? 'text-[#F27D26] font-semibold bg-[#F27D26]/10'
            : 'text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'}`}>
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0"/>
              <span>Smart Playlist Matcher</span>
            </button>
          </div>

          {/* Sub-strip & shortcuts */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-white/40 font-mono">
            {onOpenShortcuts && (<>
                <button onClick={onOpenShortcuts} className="hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5" title="Keyboard Shortcuts (Press ?)">
                  <Keyboard className="w-3 h-3 text-[#F27D26]"/>
                  <span>Shortcuts</span>
                  <kbd className="px-1 py-0.2 text-[9px] rounded bg-zinc-200/80 dark:bg-white/10 font-mono text-zinc-600 dark:text-white/60">
                    ?
                  </kbd>
                </button>
                <span>•</span>
              </>)}
            <span className="hidden md:inline">EmotiTunes Sound &amp; Smart Music System</span>
          </div>
        </div>
      </div>
    </footer>);
};
