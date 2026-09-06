import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Headphones, Radio, Settings, Check, ChevronDown, } from 'lucide-react';
export const MUSIC_SERVICES = [
    {
        id: 'youtube-music',
        name: 'YouTube Music',
        shortName: 'YT Music',
        tagline: 'Stream on YouTube Music web',
        badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-500',
        badgeText: 'YT Music',
        getUrl: (track) => `https://music.youtube.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    },
    {
        id: 'spotify',
        name: 'Spotify',
        shortName: 'Spotify',
        tagline: 'Listen on Spotify Web Player',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500',
        badgeText: 'Spotify',
        getUrl: (track) => `https://open.spotify.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    },
    {
        id: 'apple-music',
        name: 'Apple Music',
        shortName: 'Apple Music',
        tagline: 'Listen on Apple Music Web',
        badgeBg: 'bg-pink-500/15 border-pink-500/30 text-pink-500',
        badgeText: 'Apple',
        getUrl: (track) => `https://music.apple.com/us/search?term=${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    },
    {
        id: 'youtube',
        name: 'YouTube',
        shortName: 'YouTube',
        tagline: 'Search official audio & video',
        badgeBg: 'bg-red-500/15 border-red-500/30 text-red-500',
        badgeText: 'YouTube',
        getUrl: (track) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${track.artist} official audio`)}`,
    },
    {
        id: 'soundcloud',
        name: 'SoundCloud',
        shortName: 'SoundCloud',
        tagline: 'Stream community & electronic mixes',
        badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-500',
        badgeText: 'SoundCloud',
        getUrl: (track) => `https://soundcloud.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    },
    {
        id: 'amazon-music',
        name: 'Amazon Music',
        shortName: 'Amazon',
        tagline: 'Listen on Amazon Music Web',
        badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-500',
        badgeText: 'Amazon',
        getUrl: (track) => `https://music.amazon.com/search/${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    },
    {
        id: 'tidal',
        name: 'Tidal',
        shortName: 'Tidal',
        tagline: 'Hi-Fi streaming on Tidal web',
        badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-500',
        badgeText: 'Tidal',
        getUrl: (track) => `https://listen.tidal.com/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`,
    },
    {
        id: 'custom',
        name: 'Custom Web Music App',
        shortName: 'Custom App',
        tagline: 'Your custom web music URL template',
        badgeBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-500',
        badgeText: 'Custom',
        getUrl: (track, customUrlTemplate) => {
            const query = encodeURIComponent(`${track.title} ${track.artist}`);
            const title = encodeURIComponent(track.title);
            const artist = encodeURIComponent(track.artist);
            const template = customUrlTemplate && customUrlTemplate.trim().length > 0
                ? customUrlTemplate.trim()
                : 'https://bandcamp.com/search?q={query}';
            return template
                .replace('{query}', query)
                .replace('{title}', title)
                .replace('{artist}', artist);
        },
    },
];
const PREF_STORAGE_KEY = 'emotitunes_preferred_music_service';
const CUSTOM_URL_STORAGE_KEY = 'emotitunes_custom_music_app_url';
export const getStoredPreferredService = () => {
    if (typeof window === 'undefined')
        return 'youtube-music';
    const val = localStorage.getItem(PREF_STORAGE_KEY);
    if (val && MUSIC_SERVICES.some((s) => s.id === val))
        return val;
    return 'youtube-music';
};
export const getStoredCustomUrl = () => {
    if (typeof window === 'undefined')
        return 'https://bandcamp.com/search?q={query}';
    return (localStorage.getItem(CUSTOM_URL_STORAGE_KEY) ||
        'https://bandcamp.com/search?q={query}');
};
export const ExternalMusicLauncher = ({ track, variant = 'compact', }) => {
    const [preferredId, setPreferredId] = useState(getStoredPreferredService);
    const [customUrl, setCustomUrl] = useState(getStoredCustomUrl);
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomConfig, setShowCustomConfig] = useState(false);
    const [customInput, setCustomInput] = useState(customUrl);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowCustomConfig(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSelectService = (id) => {
        setPreferredId(id);
        if (typeof window !== 'undefined') {
            localStorage.setItem(PREF_STORAGE_KEY, id);
        }
    };
    const handleSaveCustomUrl = (e) => {
        e.preventDefault();
        const clean = customInput.trim() || 'https://bandcamp.com/search?q={query}';
        setCustomUrl(clean);
        if (typeof window !== 'undefined') {
            localStorage.setItem(CUSTOM_URL_STORAGE_KEY, clean);
        }
        setPreferredId('custom');
        localStorage.setItem(PREF_STORAGE_KEY, 'custom');
        setShowCustomConfig(false);
    };
    const activeService = MUSIC_SERVICES.find((s) => s.id === preferredId) || MUSIC_SERVICES[0];
    const activeUrl = activeService.getUrl(track, customUrl);
    // 1. Compact Variant (For Track Rows in the list)
    if (variant === 'compact') {
        return (<div className="relative shrink-0 flex items-center gap-1" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
        {/* Direct Link to preferred service */}
        <a href={activeUrl} target="_blank" rel="noopener noreferrer" title={`Open "${track.title}" in ${activeService.name}`} aria-label={`Open "${track.title}" in ${activeService.name}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#F27D26]/50 hover:bg-[#F27D26]/10 text-zinc-600 dark:text-white/60 hover:text-[#F27D26] text-[11px] font-medium transition-all shadow-2xs group">
          <Headphones className="w-3 h-3 text-[#F27D26]"/>
          <span className="hidden sm:inline">{activeService.shortName}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100"/>
        </a>

        {/* Dropdown toggle for switching service */}
        <button onClick={() => setIsOpen(!isOpen)} title="Choose streaming music app" aria-label="Choose streaming music app" className="p-1 rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
          <ChevronDown className="w-3 h-3"/>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (<div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-white/5 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 dark:text-white/40">
                Open in Web Music App
              </span>
              <span className="text-[9px] text-[#F27D26] font-medium">External</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {MUSIC_SERVICES.map((s) => {
                    const url = s.getUrl(track, customUrl);
                    const isPref = preferredId === s.id;
                    return (<div key={s.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 group text-xs">
                    <a href={url} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex-1 min-w-0 flex items-center gap-2 text-zinc-700 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono shrink-0 ${s.badgeBg}`}>
                        {s.badgeText}
                      </span>
                      <span className="truncate">{s.name}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-auto text-zinc-400 opacity-0 group-hover:opacity-100 shrink-0"/>
                    </a>

                    <button onClick={() => handleSelectService(s.id)} title={isPref ? 'Default service' : 'Set as default'} className={`p-1 rounded shrink-0 transition-colors cursor-pointer ${isPref
                            ? 'text-[#F27D26]'
                            : 'text-zinc-300 dark:text-white/20 hover:text-zinc-600 dark:hover:text-white/60'}`}>
                      <Check className={`w-3 h-3 ${isPref ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`}/>
                    </button>
                  </div>);
                })}
            </div>

            {/* Custom App URL link */}
            <div className="mt-1 pt-1.5 border-t border-zinc-100 dark:border-white/5">
              <button onClick={() => setShowCustomConfig(!showCustomConfig)} className="w-full flex items-center justify-between px-2 py-1 text-[11px] text-zinc-500 dark:text-white/50 hover:text-zinc-800 dark:hover:text-white rounded hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Settings className="w-3 h-3 text-[#F27D26]"/>
                  Configure Custom Music URL
                </span>
                <span className="text-[10px] font-mono">{showCustomConfig ? 'Close' : 'Edit'}</span>
              </button>

              {showCustomConfig && (<form onSubmit={handleSaveCustomUrl} className="p-2 space-y-1.5 mt-1 bg-zinc-50 dark:bg-white/[0.02] rounded-lg border border-zinc-200/60 dark:border-white/5">
                  <label className="text-[10px] text-zinc-500 dark:text-white/40 block">
                    URL Template ({'{query}'}, {'{title}'}, {'{artist}'}):
                  </label>
                  <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="https://bandcamp.com/search?q={query}" className="w-full px-2 py-1 text-[10px] font-mono rounded bg-white dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#F27D26]"/>
                  <button type="submit" className="w-full py-1 rounded bg-[#F27D26] hover:bg-[#FF4E00] text-black font-semibold text-[10px] transition-colors cursor-pointer">
                    Save &amp; Use Custom App
                  </button>
                </form>)}
            </div>
          </div>)}
      </div>);
    }
    // 2. Full Variant (For Active Song Artwork & Details Card)
    if (variant === 'full') {
        return (<div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/70 dark:bg-white/[0.02] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#F27D26]"/>
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40">
              Listen on Web Music Services
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
            Open in New Tab
          </span>
        </div>

        {/* Quick Access Badges for YouTube Music, Spotify, Apple, YouTube */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MUSIC_SERVICES.slice(0, 4).map((s) => {
                const url = s.getUrl(track, customUrl);
                const isPref = preferredId === s.id;
                return (<a key={s.id} href={url} target="_blank" rel="noopener noreferrer" title={`Open "${track.title}" in ${s.name}`} className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all group ${isPref
                        ? 'border-[#F27D26]/50 bg-white dark:bg-white/10 shadow-xs'
                        : 'border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10'}`}>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-white group-hover:text-[#F27D26] transition-colors">
                    {s.shortName}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover:text-[#F27D26]"/>
                </div>
                <span className="text-[9px] text-zinc-400 dark:text-white/40 truncate mt-0.5">
                  Launch track
                </span>
              </a>);
            })}
        </div>

        {/* Secondary Services Dropdown & Custom URL Selector */}
        <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-white/60">
            <span>More Services:</span>
            <div className="flex items-center gap-1">
              {MUSIC_SERVICES.slice(4, 7).map((s) => (<a key={s.id} href={s.getUrl(track, customUrl)} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded-md text-[11px] font-medium border border-zinc-200 dark:border-white/10 hover:border-[#F27D26]/40 hover:text-[#F27D26] bg-white dark:bg-white/5 text-zinc-700 dark:text-white/70 transition-colors">
                  {s.shortName}
                </a>))}
            </div>
          </div>

          <button onClick={() => setShowCustomConfig(!showCustomConfig)} className="text-[11px] text-[#F27D26] hover:underline flex items-center gap-1 font-medium cursor-pointer">
            <Settings className="w-3 h-3"/>
            Custom Web App
          </button>
        </div>

        {showCustomConfig && (<form onSubmit={handleSaveCustomUrl} className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-800 dark:text-white">
                Configure Custom Music App URL
              </span>
              <a href={MUSIC_SERVICES.find((s) => s.id === 'custom')?.getUrl(track, customInput)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#F27D26] hover:underline flex items-center gap-1">
                Test URL <ExternalLink className="w-2.5 h-2.5"/>
              </a>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-white/40">
              Provide any web music app search or direct URL. Available tags: <code className="font-mono bg-zinc-200 dark:bg-white/10 px-1 py-0.5 rounded">{'{query}'}</code>, <code className="font-mono bg-zinc-200 dark:bg-white/10 px-1 py-0.5 rounded">{'{title}'}</code>, <code className="font-mono bg-zinc-200 dark:bg-white/10 px-1 py-0.5 rounded">{'{artist}'}</code>
            </p>
            <div className="flex gap-2">
              <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="https://bandcamp.com/search?q={query}" className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#F27D26]"/>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#F27D26] hover:bg-[#FF4E00] text-black font-semibold text-xs transition-colors cursor-pointer shrink-0">
                Save App
              </button>
            </div>
          </form>)}
      </div>);
    }
    // 3. Dock Variant (For Bottom Transport Bar)
    return (<div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        <a href={activeUrl} target="_blank" rel="noopener noreferrer" title={`Open in ${activeService.name}`} aria-label={`Open current track in ${activeService.name}`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-white/5 hover:border-[#F27D26]/60 hover:bg-[#F27D26]/10 text-zinc-700 dark:text-white/80 hover:text-[#F27D26] text-xs font-medium transition-all cursor-pointer shadow-2xs group">
          <Headphones className="w-3.5 h-3.5 text-[#F27D26]"/>
          <span className="hidden xl:inline">Stream in {activeService.shortName}</span>
          <span className="xl:hidden">{activeService.shortName}</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100"/>
        </a>

        <button onClick={() => setIsOpen(!isOpen)} title="Change preferred music app" aria-label="Change preferred music app" className="p-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
          <ChevronDown className="w-3 h-3"/>
        </button>
      </div>

      {isOpen && (<div className="absolute right-0 bottom-full mb-2 w-64 rounded-2xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-white/5 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 dark:text-white/40">
              Select Music App
            </span>
            <span className="text-[10px] text-[#F27D26] font-mono">External Web</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {MUSIC_SERVICES.map((s) => {
                const url = s.getUrl(track, customUrl);
                const isPref = preferredId === s.id;
                return (<div key={s.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 group text-xs">
                  <button onClick={() => { handleSelectService(s.id); setIsOpen(false); }} title={`Select ${s.name}`} className="flex-1 min-w-0 flex items-center gap-2 text-left text-zinc-700 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono shrink-0 ${s.badgeBg}`}>
                      {s.badgeText}
                    </span>
                    <span className="truncate">{s.name}</span>
                    <Check className={`w-2.5 h-2.5 ml-auto shrink-0 ${isPref ? 'text-[#F27D26] opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100'}`}/>
                  </button>

                  <button onClick={() => handleSelectService(s.id)} title={isPref ? 'Default app' : 'Set as default'} className={`p-1 rounded shrink-0 transition-colors cursor-pointer ${isPref
                        ? 'text-[#F27D26]'
                        : 'text-zinc-300 dark:text-white/20 hover:text-zinc-600 dark:hover:text-white/60'}`}>
                    <Check className={`w-3 h-3 ${isPref ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`}/>
                  </button>
                </div>);
            })}
          </div>

          <div className="mt-1 pt-1.5 border-t border-zinc-100 dark:border-white/5">
            <button onClick={() => setShowCustomConfig(!showCustomConfig)} className="w-full flex items-center justify-between px-2 py-1 text-[11px] text-zinc-500 dark:text-white/50 hover:text-zinc-800 dark:hover:text-white rounded hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <Settings className="w-3 h-3 text-[#F27D26]"/>
                Configure Custom App
              </span>
              <span className="text-[10px] font-mono">{showCustomConfig ? 'Close' : 'Edit'}</span>
            </button>

            {showCustomConfig && (<form onSubmit={handleSaveCustomUrl} className="p-2 space-y-1.5 mt-1 bg-zinc-50 dark:bg-white/[0.02] rounded-lg border border-zinc-200/60 dark:border-white/5">
                <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="https://bandcamp.com/search?q={query}" className="w-full px-2 py-1 text-[10px] font-mono rounded bg-white dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#F27D26]"/>
                <button type="submit" className="w-full py-1 rounded bg-[#F27D26] hover:bg-[#FF4E00] text-black font-semibold text-[10px] transition-colors cursor-pointer">
                  Save Custom App
                </button>
              </form>)}
          </div>
        </div>)}
    </div>);
};
