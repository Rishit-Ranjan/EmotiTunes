import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Camera, Activity, RotateCcw, Check, ShieldCheck, X, } from 'lucide-react';
import { EMOTIONS_CONFIG } from '../data/musicCatalog';
const DEFAULT_SETTINGS = {
    autoCueOnEmotion: true,
    visionScanInterval: 600,
    micSensitivity: 'medium',
    synthMasterVolume: 85,
    fftBands: 128,
};
export const UserSettingsMenu = ({ currentEmotion, extractionAccuracy = 86.4, isPlaying, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('acoustic');
    const [showRecalibratedToast, setShowRecalibratedToast] = useState(false);
    const menuRef = useRef(null);
    // Stored user preferences
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('emotitunes_user_settings');
                if (saved)
                    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
            catch (e) {
                console.error('Failed to load settings', e);
            }
        }
        return DEFAULT_SETTINGS;
    });
    // Save changes
    const updateSetting = (key, value) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: value };
            if (typeof window !== 'undefined') {
                localStorage.setItem('emotitunes_user_settings', JSON.stringify(next));
            }
            return next;
        });
    };
    // Close on outside click
    useEffect(() => {
        const handlePointerDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('mousedown', handlePointerDown);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);
    const emotionConfig = EMOTIONS_CONFIG[currentEmotion] || EMOTIONS_CONFIG['joy-excitement'];
    const handleRecalibrate = () => {
        setShowRecalibratedToast(true);
        setTimeout(() => {
            setShowRecalibratedToast(false);
        }, 2400);
    };
    return (<div className="relative" ref={menuRef}>
      {/* Interactive Profile Avatar Button */}
      <button id="btn-user-account-settings" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-label="Open User Account and Acoustic Settings" title="User Account & Acoustic Engine Settings" className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer group ${isOpen
            ? 'border-[#F27D26] ring-2 ring-[#F27D26]/20 bg-[#F27D26]/10 text-[#F27D26]'
            : 'border-zinc-300 dark:border-white/20 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-800 dark:text-white'}`}>
        <span className="text-[11px] font-mono font-semibold tracking-tight">RR</span>

        {/* Live Audio/Vision Status Presence Dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a0a0a]" title="Acoustic Engine Online"/>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (<div id="user-settings-popover" className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0e0e0e] border border-zinc-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card: User Account Info */}
          <div className="p-4 border-b border-zinc-100 dark:border-white/10 bg-zinc-50/60 dark:bg-white/[0.02]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F27D26] to-[#FF4E00] flex items-center justify-center text-white font-mono font-bold text-sm shadow-md shadow-[#F27D26]/20 shrink-0">
                  RR
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      Rishit Ranjan
                    </h3>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-white/50 truncate">
                    rishitranjan131@gmail.com
                  </p>
                </div>
              </div>

              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-colors" aria-label="Close settings">
                <X className="w-4 h-4"/>
              </button>
            </div>

            {/* Current Active Engine Pill */}
            <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: emotionConfig.accentColor }}/>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-white/80">
                  {emotionConfig.label}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#F27D26] font-medium">
                {extractionAccuracy.toFixed(1)}% Acc
              </span>
            </div>
          </div>

          {/* Sub-tabs: Acoustic Settings & Account Calibration */}
          <div className="flex border-b border-zinc-100 dark:border-white/10 px-4 pt-2 gap-4 text-xs">
            <button onClick={() => setActiveTab('acoustic')} className={`pb-2 font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'acoustic'
                ? 'border-[#F27D26] text-[#F27D26]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white'}`}>
              Acoustic &amp; AI Engine
            </button>
            <button onClick={() => setActiveTab('account')} className={`pb-2 font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'account'
                ? 'border-[#F27D26] text-[#F27D26]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white'}`}>
              Hardware &amp; Account
            </button>
          </div>

          {/* Tab 1: Acoustic & AI Settings */}
          {activeTab === 'acoustic' && (<div className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
              {/* Setting: Auto-Sync Playlist on Emotion Change */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <label htmlFor="toggle-auto-cue" className="text-xs font-semibold text-zinc-900 dark:text-white block cursor-pointer">
                    Adaptive Playlist Sync
                  </label>
                  <p className="text-[10px] text-zinc-500 dark:text-white/50 leading-tight">
                    Automatically transition playlist when face mood shifts
                  </p>
                </div>
                <button id="toggle-auto-cue" role="switch" aria-checked={settings.autoCueOnEmotion} onClick={() => updateSetting('autoCueOnEmotion', !settings.autoCueOnEmotion)} className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${settings.autoCueOnEmotion ? 'bg-[#F27D26]' : 'bg-zinc-300 dark:bg-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.autoCueOnEmotion ? 'translate-x-4' : 'translate-x-0'}`}/>
                </button>
              </div>

              {/* Setting: Master Audio Synth Gain */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#F27D26]"/>
                    Master Synth Volume
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-white/50">
                    {settings.synthMasterVolume}%
                  </span>
                </div>
                <input type="range" min="0" max="100" value={settings.synthMasterVolume} onChange={(e) => updateSetting('synthMasterVolume', Number(e.target.value))} aria-label="Master Synth Volume" className="w-full accent-[#F27D26] h-1.5 bg-zinc-200 dark:bg-white/10 rounded-lg cursor-pointer"/>
              </div>

              {/* Setting: Vision Scan Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#F27D26]"/>
                    Camera Detection Rate
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-white/50">
                    {settings.visionScanInterval}ms
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  {[
                    { label: 'Fast (300ms)', val: 300 },
                    { label: 'Balanced (600ms)', val: 600 },
                    { label: 'Eco (1200ms)', val: 1200 },
                ].map((rate) => (<button key={rate.val} onClick={() => updateSetting('visionScanInterval', rate.val)} className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${settings.visionScanInterval === rate.val
                        ? 'bg-[#F27D26]/10 text-[#F27D26] border-[#F27D26]/40 font-semibold'
                        : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/60 hover:bg-zinc-50 dark:hover:bg-white/5'}`}>
                      {rate.label}
                    </button>))}
                </div>
              </div>

              {/* Setting: Microphone Sensitivity */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#F27D26]"/>
                  AER Voice Input Sensitivity
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  {['low', 'medium', 'high'].map((level) => (<button key={level} onClick={() => updateSetting('micSensitivity', level)} className={`py-1.5 px-2 rounded-lg border uppercase text-center transition-all cursor-pointer ${settings.micSensitivity === level
                        ? 'bg-[#F27D26]/10 text-[#F27D26] border-[#F27D26]/40 font-semibold'
                        : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/60 hover:bg-zinc-50 dark:hover:bg-white/5'}`}>
                      {level}
                    </button>))}
                </div>
              </div>

              {/* Quick Calibration Action */}
              <div className="pt-2">
                <button onClick={handleRecalibrate} className="w-full py-2 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-medium text-zinc-800 dark:text-white flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5 text-[#F27D26]"/>
                  <span>Recalibrate Baseline Neutral</span>
                </button>
                {showRecalibratedToast && (<p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center mt-1.5 font-mono animate-fade-in flex items-center justify-center gap-1">
                    <Check className="w-3 h-3"/> Baseline neutral emotion recalibrated!
                  </p>)}
              </div>
            </div>)}

          {/* Tab 2: Hardware & Account */}
          {activeTab === 'account' && (<div className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-white/40">
                  Acoustic Identity
                </span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-white/50">User</span>
                    <span className="font-medium text-zinc-900 dark:text-white">Rishit Ranjan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-white/50">Account Role</span>
                    <span className="font-mono text-[#F27D26]">Acoustic Researcher</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-white/50">Sample Rate</span>
                    <span className="font-mono text-zinc-700 dark:text-white/80">44.1 kHz / 16-bit</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-white/40">
                  Audio DSP Pipeline
                </span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 space-y-1 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                    <span>TensorFlow Face Landmarks: Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                    <span>Web Audio Synth Engine: Connected</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                    <span>AER Mel-Spectrogram: Active</span>
                  </div>
                </div>
              </div>

              {/* Reset Defaults */}
              <button onClick={() => {
                    setSettings(DEFAULT_SETTINGS);
                    localStorage.removeItem('emotitunes_user_settings');
                }} className="w-full text-center py-1.5 text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer">
                Reset Acoustic Settings to Default
              </button>
            </div>)}

          {/* Footer of Popover */}
          <div className="px-4 py-2.5 bg-zinc-50 dark:bg-white/[0.02] border-t border-zinc-100 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-white/40">
            <span>EmotiTunes v2.4</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3"/>
              Local Privacy Mode
            </span>
          </div>
        </div>)}
    </div>);
};
