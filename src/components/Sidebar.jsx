import React from 'react';
import { Camera, Activity, SlidersHorizontal, PanelLeftClose, PanelLeftOpen, Music, Music2, X, Volume2, } from 'lucide-react';
import { EMOTIONS_CONFIG } from '../data/musicCatalog';
const SECTIONS = [
    {
        id: 'extraction',
        name: 'Face Emotion',
        shortName: 'Face',
        subtitle: 'Visual Expression Extraction',
        icon: Camera,
        badge: '80-90% Acc',
        shortcut: '1',
    },
    {
        id: 'aer-features',
        name: 'Sound & Waves',
        shortName: 'Sound',
        subtitle: 'Voice Mood & DSP Waveforms',
        icon: Activity,
        badge: 'DSP Active',
        shortcut: '2',
    },
    {
        id: 'mir-playlist',
        name: 'Smart Playlist',
        shortName: 'Playlist',
        subtitle: 'Adaptive Emotion-Music Match',
        icon: SlidersHorizontal,
        badge: 'Dynamic Flow',
        shortcut: '3',
    },
];
export const Sidebar = ({ activeTab, setActiveTab, isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile, currentEmotion, detectionAccuracy, isPlaying, currentTrack, }) => {
    const emotionConfig = EMOTIONS_CONFIG[currentEmotion] || EMOTIONS_CONFIG['joy-excitement'];
    const handleSelectSection = (tabId) => {
        setActiveTab(tabId);
        if (isMobileOpen) {
            onCloseMobile();
        }
    };
    const renderContent = (isDrawerMobile = false) => {
        const collapsed = isDrawerMobile ? false : isCollapsed;
        return (<div className="flex flex-col h-full w-full select-none bg-white dark:bg-[#0c0c0c] text-zinc-900 dark:text-[#e0e0e0]">
        
        {/* Top Header: Brand Identity & Toggle */}
        <div className="shrink-0 h-16 border-b border-zinc-200 dark:border-white/10 flex items-center px-4 bg-white/50 dark:bg-[#0c0c0c]/50">
          {!collapsed ? (<div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F27D26] to-[#FF4E00] rounded-lg shadow-[0_0_15px_rgba(242,125,38,0.35)] flex items-center justify-center text-white shrink-0">
                  <Music2 className="w-4 h-4"/>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-light tracking-tight text-zinc-900 dark:text-white font-serif-display leading-tight truncate">
                      EmotiTunes
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-[#F27D26] border border-[#F27D26]/30 uppercase shrink-0">
                      DSP
                    </span>
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-400 dark:text-white/40 truncate">
                    Emotion Music Engine
                  </p>
                </div>
              </div>

              {/* Close Button on Mobile / Collapse on Desktop */}
              {isDrawerMobile ? (<button id="btn-close-mobile-drawer" onClick={onCloseMobile} aria-label="Close navigation drawer" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                  <X className="w-5 h-5"/>
                </button>) : (<button id="btn-collapse-sidebar" onClick={onToggleCollapse} aria-label="Collapse sidebar (Ctrl+B)" title="Collapse sidebar (Ctrl+B)" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                  <PanelLeftClose className="w-4 h-4"/>
                </button>)}
            </div>) : (
            /* Collapsed Brand Button */
            <div className="w-full flex items-center justify-center">
              <button id="btn-expand-sidebar-top" onClick={onToggleCollapse} aria-label="Expand sidebar" title="Expand sidebar" className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F27D26] to-[#FF4E00] rounded-lg shadow-[0_0_12px_rgba(242,125,38,0.3)] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Music2 className="w-4 h-4"/>
                </div>
              </button>
            </div>)}
        </div>

        {/* Middle Navigation Section */}
        <div className="flex-1 px-3 py-4 space-y-3 overflow-y-auto min-h-0">
          {!collapsed ? (<div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-400 dark:text-white/40">
                Workspace Sections
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/50">
                3 Modules
              </span>
            </div>) : (<div className="w-full flex justify-center pb-2">
              <span className="w-5 h-0.5 bg-zinc-200 dark:bg-white/10 rounded-full"/>
            </div>)}

          {/* Navigation Action Tabs */}
          <nav className="space-y-1.5">
            {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeTab === section.id;
                const isPlaylist = section.id === 'mir-playlist';
                return (<button key={section.id} id={`sidebar-tab-${section.id}`} onClick={() => handleSelectSection(section.id)} aria-label={section.name} title={collapsed ? `${section.name} • ${section.subtitle}` : undefined} className={`w-full group relative flex items-center rounded-xl transition-all cursor-pointer ${collapsed
                        ? 'justify-center p-3'
                        : 'gap-3 px-3 py-3 text-left'} ${isActive
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-white/5'}`}>
                  {/* Left Accent Bar for Active State */}
                  {isActive && (<span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#F27D26] rounded-r-full"/>)}

                  {/* Section Icon */}
                  <div className={`flex items-center justify-center shrink-0 transition-transform ${isActive
                        ? 'text-[#F27D26] group-hover:scale-110'
                        : 'text-zinc-400 dark:text-white/40 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:scale-110'}`}>
                    <Icon className="w-5 h-5"/>
                  </div>

                  {/* Detailed Labels in Expanded Mode */}
                  {!collapsed && (<div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs uppercase tracking-wider font-semibold truncate block">
                          {section.name}
                        </span>
                        <p className={`text-[10px] truncate leading-tight mt-0.5 ${isActive
                            ? 'text-white/75 dark:text-zinc-700'
                            : 'text-zinc-400 dark:text-white/40'}`}>
                          {section.subtitle}
                        </p>
                      </div>

                      {/* Badge / Live Status & Shortcut Hint */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isPlaylist && isPlaying ? (<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#F27D26] text-black font-semibold animate-pulse">
                            <Volume2 className="w-2.5 h-2.5"/>
                            <span>LIVE</span>
                          </span>) : (<span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${isActive
                                ? 'bg-white/10 text-white border-white/20 dark:bg-black/10 dark:text-black dark:border-black/20'
                                : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-white/50 dark:border-white/10'}`}>
                            {section.badge}
                          </span>)}
                        <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-opacity ${isActive
                            ? 'bg-white/20 text-white border-white/30 dark:bg-black/20 dark:text-black dark:border-black/30'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10'}`} title={`Press ${section.shortcut} to jump to this module`}>
                          {section.shortcut}
                        </kbd>
                      </div>
                    </div>)}

                  {/* Collapsed Active Indicator Dot */}
                  {collapsed && isActive && (<span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-[#F27D26]"/>)}
                </button>);
            })}
          </nav>
        </div>

        {/* Bottom Pinned Footer in Sidebar: Emotion & Player Status */}
        <div className="shrink-0 p-3 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-white/[0.02]">
          {!collapsed ? (<div className="space-y-2.5">
              {/* Current Emotion Card */}
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111] shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] uppercase tracking-[0.18em] font-semibold text-zinc-400 dark:text-white/40">
                    Current Emotion
                  </span>
                  <span className="text-[9px] font-mono text-[#F27D26] font-medium">
                    {detectionAccuracy.toFixed(1)}% Acc
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: emotionConfig.accentColor }}/>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {emotionConfig.label}
                  </span>
                </div>
              </div>

              {/* Mini Player Status Card */}
              {currentTrack && (<div onClick={() => handleSelectSection('mir-playlist')} className="p-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/5 flex items-center justify-between gap-2 cursor-pointer hover:border-[#F27D26]/40 transition-colors" title="Click to jump to Smart Playlist Player">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isPlaying
                        ? 'bg-[#F27D26] text-black'
                        : 'bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-white/60'}`}>
                      <Music className="w-3.5 h-3.5"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-zinc-900 dark:text-white truncate">
                        {currentTrack.title}
                      </p>
                      <p className="text-[9px] text-zinc-400 dark:text-white/40 truncate">
                        {currentTrack.artist}
                      </p>
                    </div>
                  </div>

                  {isPlaying ? (<div className="flex items-end gap-0.5 h-3 shrink-0">
                      <span className="w-0.5 h-2 bg-[#F27D26] animate-pulse"/>
                      <span className="w-0.5 h-3 bg-[#F27D26] animate-pulse delay-75"/>
                      <span className="w-0.5 h-1.5 bg-[#F27D26] animate-pulse delay-150"/>
                    </div>) : (<span className="text-[9px] font-mono text-zinc-400 dark:text-white/30 shrink-0">
                      PAUSED
                    </span>)}
                </div>)}
            </div>) : (
            /* Collapsed Bottom Controls */
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="w-3.5 h-3.5 rounded-full shadow-xs cursor-pointer" style={{ backgroundColor: emotionConfig.accentColor }} title={`Active Emotion: ${emotionConfig.label} (${detectionAccuracy.toFixed(1)}% Acc)`}/>
              {isPlaying && (<span onClick={() => handleSelectSection('mir-playlist')} className="w-2.5 h-2.5 rounded-full bg-[#F27D26] animate-ping cursor-pointer" title="Audio Playing - Click for Playlist"/>)}
              <button id="btn-expand-sidebar-bottom" onClick={onToggleCollapse} aria-label="Expand sidebar" title="Expand sidebar" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <PanelLeftOpen className="w-4 h-4 text-[#F27D26]"/>
              </button>
            </div>)}
        </div>
      </div>);
    };
    return (<>
      {/* Desktop Fixed Full-Height Left Sidebar */}
      <aside id="app-left-sidebar" aria-label="Application Navigation Sidebar" className={`hidden md:flex flex-col shrink-0 h-full border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c0c] transition-all duration-300 ease-in-out z-30 ${isCollapsed ? 'w-20' : 'w-64 lg:w-72'}`}>
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (<div id="mobile-sidebar-backdrop" onClick={onCloseMobile} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300" aria-hidden="true"/>)}

      {/* Mobile Full-Height Sliding Drawer Panel */}
      <aside id="mobile-app-sidebar" aria-label="Mobile Navigation Sidebar" className={`fixed inset-y-0 left-0 h-full w-72 bg-white dark:bg-[#0c0c0c] border-r border-zinc-200 dark:border-white/10 z-50 md:hidden shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {renderContent(true)}
      </aside>
    </>);
};
