import React from 'react';
import { Play, Pause, Compass, Sidebar, Volume2, VolumeX, Keyboard } from 'lucide-react';
export const ShortcutHUDToast = ({ toast }) => {
    if (!toast.visible)
        return null;
    const renderIcon = () => {
        switch (toast.type) {
            case 'play':
                return <Play className="w-4 h-4 text-emerald-500 fill-emerald-500"/>;
            case 'pause':
                return <Pause className="w-4 h-4 text-amber-500 fill-amber-500"/>;
            case 'nav':
                return <Compass className="w-4 h-4 text-[#F27D26]"/>;
            case 'sidebar':
                return <Sidebar className="w-4 h-4 text-indigo-400"/>;
            case 'mute':
                return <VolumeX className="w-4 h-4 text-rose-500"/>;
            case 'help':
                return <Keyboard className="w-4 h-4 text-[#F27D26]"/>;
            default:
                return <Volume2 className="w-4 h-4 text-[#F27D26]"/>;
        }
    };
    return (<div role="status" aria-live="polite" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900/90 dark:bg-black/90 text-white backdrop-blur-md border border-zinc-700/60 dark:border-white/20 shadow-2xl">
        <div className="shrink-0">{renderIcon()}</div>
        <span className="text-xs font-medium tracking-wide font-sans">{toast.message}</span>
      </div>
    </div>);
};
