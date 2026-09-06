import React, { useEffect } from 'react';
import { Keyboard, X, } from 'lucide-react';
const SHORTCUTS = [
    {
        keys: ['Space'],
        description: 'Toggle Play / Pause synthesizer playback',
        category: 'Playback',
    },
    {
        keys: ['K'],
        description: 'Alternate Play / Pause toggle',
        category: 'Playback',
    },
    {
        keys: ['M'],
        description: 'Mute / Unmute audio synthesizer',
        category: 'Playback',
    },
    {
        keys: ['Ctrl', '→'],
        description: 'Switch to next workspace tab',
        category: 'Navigation',
    },
    {
        keys: ['Ctrl', '←'],
        description: 'Switch to previous workspace tab',
        category: 'Navigation',
    },
    {
        keys: ['1'],
        description: 'Jump to Face Emotion Module',
        category: 'Navigation',
    },
    {
        keys: ['2'],
        description: 'Jump to Sound & Waves (AER) Module',
        category: 'Navigation',
    },
    {
        keys: ['3'],
        description: 'Jump to Smart Playlist Module',
        category: 'Navigation',
    },
    {
        keys: ['Ctrl', 'B'],
        description: 'Toggle sidebar collapse / expand',
        category: 'System',
    },
    {
        keys: ['?'],
        description: 'Open this keyboard shortcuts cheat sheet',
        category: 'System',
    },
    {
        keys: ['Esc'],
        description: 'Close modals, dropdowns, and drawers',
        category: 'System',
    },
];
export const KeyboardShortcutsModal = ({ isOpen, onClose, }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const categories = [
        'Playback',
        'Navigation',
        'System',
    ];
    return (<div id="keyboard-shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="shortcuts-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={(e) => {
            if (e.target === e.currentTarget)
                onClose();
        }}>
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-white/10 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F27D26]/10 text-[#F27D26] flex items-center justify-center border border-[#F27D26]/20">
              <Keyboard className="w-4 h-4"/>
            </div>
            <div>
              <h2 id="shortcuts-dialog-title" className="text-base font-semibold text-zinc-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-zinc-500 dark:text-white/50">
                Navigate EmotiTunes faster with global hotkeys
              </p>
            </div>
          </div>

          <button onClick={onClose} aria-label="Close shortcuts dialog" className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Shortcuts List by Category */}
        <div className="p-5 space-y-6 max-h-[65vh] overflow-y-auto">
          {categories.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat);
            return (<div key={cat} className="space-y-2.5">
                <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-zinc-400 dark:text-white/40">
                  {cat} Shortcuts
                </h3>
                <div className="divide-y divide-zinc-100 dark:divide-white/5 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/40 dark:bg-white/[0.01] overflow-hidden">
                  {items.map((item, idx) => (<div key={idx} className="px-3.5 py-2.5 flex items-center justify-between gap-4 text-xs hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-colors">
                      <span className="text-zinc-700 dark:text-white/80 font-normal">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.keys.map((k, ki) => (<React.Fragment key={ki}>
                            {ki > 0 && (<span className="text-[10px] text-zinc-400 dark:text-white/30 font-mono">
                                +
                              </span>)}
                            <kbd className="inline-flex items-center justify-center min-w-[24px] px-2 py-1 text-[11px] font-mono font-semibold rounded-md border border-zinc-300 dark:border-white/20 bg-white dark:bg-[#1a1a1a] text-zinc-800 dark:text-zinc-200 shadow-xs">
                              {k}
                            </kbd>
                          </React.Fragment>))}
                      </div>
                    </div>))}
                </div>
              </div>);
        })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-zinc-50 dark:bg-white/[0.02] border-t border-zinc-100 dark:border-white/10 flex items-center justify-between text-xs text-zinc-500 dark:text-white/40">
          <span className="text-[11px]">
            Shortcuts are disabled when typing into search or text inputs.
          </span>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-medium text-xs transition-colors cursor-pointer">
            Got it
          </button>
        </div>
      </div>
    </div>);
};
