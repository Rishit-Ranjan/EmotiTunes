import React, { useState, useRef, useCallback } from 'react';
import { Activity, Radio } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { EmotionExtractionModule } from './components/EmotionExtractionModule';
import { AudioFeatureExtractionModule } from './components/AudioFeatureExtractionModule';
import { MIRPlaylistPlayer } from './components/MIRPlaylistPlayer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ShortcutHUDToast } from './components/ShortcutHUDToast';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { audioEngine } from './services/audioEngine';
import { TRACK_CATALOG } from './data/musicCatalog';
export default function App() {
    const [activeTab, setActiveTab] = useState('extraction');
    const [currentEmotion, setCurrentEmotion] = useState('joy-excitement');
    const [lastExtractionResult, setLastExtractionResult] = useState(null);
    const [lastAERResult, setLastAERResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(TRACK_CATALOG[0]);
    const [detectionAccuracy, setDetectionAccuracy] = useState(86.4);
    const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    // HUD Toast state for instant keyboard shortcut feedback
    const [toast, setToast] = useState({
        message: '',
        type: 'nav',
        visible: false,
    });
    const toastTimeoutRef = useRef(null);
    const triggerToast = useCallback((message, type = 'nav') => {
        if (toastTimeoutRef.current) {
            window.clearTimeout(toastTimeoutRef.current);
        }
        setToast({ message, type, visible: true });
        toastTimeoutRef.current = window.setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 1500);
    }, []);
    // Play/Pause synthesizer playback
    const handleTogglePlayPause = useCallback(() => {
        if (isPlaying) {
            audioEngine.pausePlayback();
            setIsPlaying(false);
        }
        else {
            const trackToPlay = currentTrack || TRACK_CATALOG[0];
            if (!currentTrack) {
                setCurrentTrack(trackToPlay);
            }
            audioEngine.playTrack(trackToPlay);
            setIsPlaying(true);
        }
    }, [isPlaying, currentTrack]);
    // Mute / Unmute audio synth
    const handleToggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const next = !prev;
            if (next) {
                audioEngine.setVolume(0);
                triggerToast('Audio Synth Muted', 'mute');
            }
            else {
                audioEngine.setVolume(0.75);
                triggerToast('Audio Synth Unmuted', 'play');
            }
            return next;
        });
    }, [triggerToast]);
    // Left Sidebar state (with persistence)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('emotitunes_sidebar_collapsed');
            return saved === 'true';
        }
        return false;
    });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => {
        setIsSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('emotitunes_sidebar_collapsed', String(next));
            }
            return next;
        });
    }, []);
    // Wire up global keyboard shortcuts (Space, Ctrl+Left/Right, 1/2/3, Ctrl+B, M, K, ?, Esc)
    useGlobalKeyboardShortcuts({
        activeTab,
        setActiveTab,
        isPlaying,
        onTogglePlayPause: handleTogglePlayPause,
        onToggleSidebar: handleToggleSidebar,
        onToggleMute: handleToggleMute,
        onOpenShortcutsModal: () => setIsShortcutsModalOpen(true),
        onCloseModal: () => setIsShortcutsModalOpen(false),
        onToast: triggerToast,
    });
    // When face/camera emotion is detected (Pillar 3)
    const handleEmotionDetected = (emotion, accuracy, result) => {
        setCurrentEmotion(emotion);
        setDetectionAccuracy(accuracy);
        if (result) {
            setLastExtractionResult(result);
        }
    };
    // When sound/voice wave analysis is triggered (Pillar 2)
    const handleAERDetected = (emotion, aerResult) => {
        setCurrentEmotion(emotion);
        setLastAERResult(aerResult);
        setDetectionAccuracy(aerResult.accuracy);
    };
    const handleSelectEmotion = (emotion) => {
        setCurrentEmotion(emotion);
    };
    return (<div className="h-screen w-full bg-[#f8f9fa] dark:bg-[#050505] text-zinc-900 dark:text-[#e0e0e0] flex font-sans selection:bg-[#F27D26] selection:text-black relative overflow-hidden transition-colors duration-200">
      {/* Ambient background glow from design */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#F27D26]/10 dark:from-[#F27D26]/10 to-transparent blur-3xl pointer-events-none z-0"/>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-t from-[#FF4E00]/5 dark:from-[#FF4E00]/5 to-transparent blur-3xl pointer-events-none z-0"/>

      {/* Permanently Full-Height Left Sidebar (Spans top-0 to bottom-0, 100% of viewport) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} isMobileOpen={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)} currentEmotion={currentEmotion} detectionAccuracy={detectionAccuracy} isPlaying={isPlaying} currentTrack={currentTrack}/>

      {/* Main Workspace Column (Fixed Header + Scrollable Content Body with Footer) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        {/* Top Header */}
        <Navbar activeTab={activeTab} onToggleSidebar={handleToggleSidebar} isSidebarCollapsed={isSidebarCollapsed} onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} currentEmotion={currentEmotion} onSelectEmotion={handleSelectEmotion} isPlaying={isPlaying} extractionAccuracy={detectionAccuracy} onOpenShortcuts={() => setIsShortcutsModalOpen(true)}/>

        {/* Scrollable Main Body */}
        <div id="main-content-scroll-area" className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
            {/* System Architecture & Overview Banner */}
            <div id="system-overview-banner" className="mb-6 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 p-4 sm:p-5 shadow-xs transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-[#F27D26] border border-[#F27D26]/20 font-semibold">
                    Acoustic DSP System
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-white/70 leading-relaxed max-w-2xl font-normal">
                  Real-time facial expression tracking, voice acoustic emotion recognition (AER), and intelligent music information retrieval (MIR).
                </p>
              </div>

              {/* Live System Status Badges */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                  Vision: 80–90% Acc
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 shadow-2xs">
                  <Activity className="w-3.5 h-3.5"/>
                  DSP Synth: 44.1kHz
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-2xs">
                  <Radio className="w-3.5 h-3.5"/>
                  MIR 6-Mood Matrix
                </span>
              </div>
            </div>

            {activeTab === 'extraction' && (<EmotionExtractionModule onEmotionDetected={handleEmotionDetected} currentEmotion={currentEmotion} lastResult={lastExtractionResult}/>)}

            {activeTab === 'aer-features' && (<AudioFeatureExtractionModule onAERDetected={handleAERDetected} currentEmotion={currentEmotion} onNavigateToMIR={() => setActiveTab('mir-playlist')}/>)}

            {activeTab === 'mir-playlist' && (<MIRPlaylistPlayer currentEmotion={currentEmotion} onSelectEmotion={handleSelectEmotion} isPlaying={isPlaying} setIsPlaying={setIsPlaying} currentTrack={currentTrack} setCurrentTrack={setCurrentTrack} detectionAccuracy={detectionAccuracy}/>)}
          </main>

          {/* Redesigned Premium Footer */}
          <Footer activeTab={activeTab} setActiveTab={setActiveTab} currentEmotion={currentEmotion} detectionAccuracy={detectionAccuracy} isPlaying={isPlaying} currentTrack={currentTrack} onOpenShortcuts={() => setIsShortcutsModalOpen(true)}/>
        </div>
      </div>

      {/* Global Shortcut HUD Toast */}
      <ShortcutHUDToast toast={toast}/>

      {/* Keyboard Shortcuts Help Dialog Modal */}
      <KeyboardShortcutsModal isOpen={isShortcutsModalOpen} onClose={() => setIsShortcutsModalOpen(false)}/>
    </div>);
}
