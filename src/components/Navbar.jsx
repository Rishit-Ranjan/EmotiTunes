import React from 'react';
import { Music2, Sun, Moon, PanelLeftOpen, ChevronRight, Camera, Activity, SlidersHorizontal, Keyboard } from 'lucide-react';
import { EMOTIONS_CONFIG } from '../data/musicCatalog';
import { useTheme } from '../context/ThemeContext';
import { UserSettingsMenu } from './UserSettingsMenu';
const SECTION_LABELS = {
    extraction: { name: 'Face Emotion Extraction', icon: Camera },
    'aer-features': { name: 'Sound & Waves Analysis', icon: Activity },
    'mir-playlist': { name: 'Smart Playlist Player', icon: SlidersHorizontal },
};
export const Navbar = ({ activeTab = 'extraction', onToggleSidebar, isSidebarCollapsed, onOpenMobileSidebar, currentEmotion, onSelectEmotion, isPlaying, extractionAccuracy = 86.4, onOpenShortcuts, }) => {
    const { theme, toggleTheme } = useTheme();
    const emotionConfig = EMOTIONS_CONFIG[currentEmotion] || EMOTIONS_CONFIG['joy-excitement'];
    const currentSection = SECTION_LABELS[activeTab];
    const CurrentIcon = currentSection.icon;
    return (<header id="emotitunes-header" className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Mobile Drawer Trigger & Desktop Sidebar Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Open Button */}
            <button id="btn-mobile-sidebar-toggle" onClick={onOpenMobileSidebar} aria-label="Open Navigation Sidebar" title="Open navigation menu" className="flex md:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
              <PanelLeftOpen className="w-5 h-5 text-[#F27D26]"/>
            </button>

            {/* Desktop Sidebar Toggle Button */}

            {/* Mobile Brand Title */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 bg-gradient-to-br from-[#F27D26] to-[#FF4E00] rounded-full flex items-center justify-center text-white shrink-0">
                <Music2 className="w-3.5 h-3.5"/>
              </div>
              <span className="text-lg font-light tracking-tighter text-zinc-900 dark:text-white font-serif-display">
                EmotiTunes
              </span>
            </div>

            {/* Desktop Active Section Breadcrumb */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-white/40 font-medium">
                Workspace
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-white/20"/>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                <CurrentIcon className="w-3.5 h-3.5 text-[#F27D26]"/>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
                  {currentSection.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Active Mood Pill, Dropdown, Theme Toggle & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle Button */}
            <button id="btn-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-white/80 transition-all cursor-pointer">
              {theme === 'dark' ? (<>
                  <Sun className="w-3.5 h-3.5 text-[#F27D26]"/>
                  <span className="text-[11px] font-medium font-mono hidden sm:inline">Light</span>
                </>) : (<>
                  <Moon className="w-3.5 h-3.5 text-zinc-700"/>
                  <span className="text-[11px] font-medium font-mono hidden sm:inline">Dark</span>
                </>)}
            </button>

            {/* Quick Emotion Selector Dropdown */}
            <div className="relative group">
              <button id="current-mood-indicator" className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 transition-all text-xs cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: emotionConfig.accentColor, color: emotionConfig.accentColor }}/>
                <span className="font-medium text-zinc-900 dark:text-white/90 text-[11px] uppercase tracking-wider">
                  {emotionConfig.label}
                </span>
                <span className="hidden sm:inline-block text-[10px] text-[#F27D26] font-mono bg-[#F27D26]/10 px-1.5 py-0.5 rounded border border-[#F27D26]/20">
                  {extractionAccuracy.toFixed(1)}% Acc
                </span>
              </button>

              {/* Dropdown to instantly switch between all 7 target emotions */}
              <div className="absolute right-0 mt-2 w-60 p-2 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 dark:text-white/40 border-b border-zinc-100 dark:border-white/10 mb-1">
                  7 Emotion Modules
                </div>
                {Object.keys(EMOTIONS_CONFIG).map((emoKey) => {
            const cfg = EMOTIONS_CONFIG[emoKey];
            const isCur = currentEmotion === emoKey;
            return (<button key={emoKey} onClick={() => onSelectEmotion(emoKey)} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${isCur
                    ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-medium border border-zinc-200 dark:border-white/10'
                    : 'text-zinc-600 dark:text-white/70 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.accentColor }}/>
                        <span>{cfg.label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-white/40 font-mono">{cfg.tempoRange}</span>
                    </button>);
        })}
              </div>
            </div>

            {/* Keyboard Shortcuts Trigger Button */}
            {onOpenShortcuts && (<button id="btn-keyboard-shortcuts" onClick={onOpenShortcuts} title="Keyboard Shortcuts (Press ?)" aria-label="Keyboard Shortcuts" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white text-xs transition-all cursor-pointer">
                <Keyboard className="w-3.5 h-3.5 text-[#F27D26]"/>
                <span className="text-[11px] font-medium hidden md:inline">Shortcuts</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-200/80 dark:bg-white/10 text-zinc-600 dark:text-white/60 font-semibold">
                  ?
                </kbd>
              </button>)}

            {/* User Account & Acoustic Settings Menu */}
            <UserSettingsMenu currentEmotion={currentEmotion} extractionAccuracy={extractionAccuracy} isPlaying={isPlaying} onSelectEmotion={onSelectEmotion}/>
          </div>
        </div>
      </div>
    </header>);
};
