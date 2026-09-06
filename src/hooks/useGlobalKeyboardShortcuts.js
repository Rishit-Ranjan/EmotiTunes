import { useEffect } from 'react';
export const TAB_SEQUENCE = ['extraction', 'aer-features', 'mir-playlist'];
export const TAB_LABELS = {
    extraction: 'Face Emotion Module',
    'aer-features': 'Sound & Waves (AER)',
    'mir-playlist': 'Smart Playlist Matcher',
};
export const useGlobalKeyboardShortcuts = ({ activeTab, setActiveTab, isPlaying, onTogglePlayPause, onToggleSidebar, onToggleMute, onOpenShortcutsModal, onCloseModal, onToast, }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // 1. Guard against firing when user is typing in form controls
            const target = e.target;
            if (target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable)) {
                return;
            }
            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            // 2. Tab Navigation: Ctrl+Right / Ctrl+Left
            if (isCtrlOrCmd && (e.key === 'ArrowRight' || e.code === 'ArrowRight')) {
                e.preventDefault();
                const curIdx = TAB_SEQUENCE.indexOf(activeTab);
                const nextIdx = (curIdx + 1) % TAB_SEQUENCE.length;
                const nextTab = TAB_SEQUENCE[nextIdx];
                setActiveTab(nextTab);
                onToast(`Switched to ${TAB_LABELS[nextTab]}`, 'nav');
                return;
            }
            if (isCtrlOrCmd && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft')) {
                e.preventDefault();
                const curIdx = TAB_SEQUENCE.indexOf(activeTab);
                const prevIdx = (curIdx - 1 + TAB_SEQUENCE.length) % TAB_SEQUENCE.length;
                const prevTab = TAB_SEQUENCE[prevIdx];
                setActiveTab(prevTab);
                onToast(`Switched to ${TAB_LABELS[prevTab]}`, 'nav');
                return;
            }
            // 3. Sidebar toggle: Ctrl+B or Cmd+B
            if (isCtrlOrCmd && (e.key === 'b' || e.key === 'B')) {
                e.preventDefault();
                onToggleSidebar();
                onToast('Toggled Sidebar', 'sidebar');
                return;
            }
            // 4. Modifiers-free Single Key Shortcuts
            if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                // Space to Play / Pause
                if (e.code === 'Space') {
                    e.preventDefault();
                    onTogglePlayPause();
                    onToast(isPlaying ? 'Playback Paused' : 'Playback Started', isPlaying ? 'pause' : 'play');
                    return;
                }
                // 'K' or 'k' for Play/Pause alternate
                if (e.key === 'k' || e.key === 'K') {
                    e.preventDefault();
                    onTogglePlayPause();
                    onToast(isPlaying ? 'Playback Paused' : 'Playback Started', isPlaying ? 'pause' : 'play');
                    return;
                }
                // 'M' or 'm' for Mute / Unmute
                if (e.key === 'm' || e.key === 'M') {
                    e.preventDefault();
                    onToggleMute();
                    return;
                }
                // Direct tab jump keys 1, 2, 3
                if (e.key === '1') {
                    e.preventDefault();
                    setActiveTab('extraction');
                    onToast(`Switched to ${TAB_LABELS['extraction']}`, 'nav');
                    return;
                }
                if (e.key === '2') {
                    e.preventDefault();
                    setActiveTab('aer-features');
                    onToast(`Switched to ${TAB_LABELS['aer-features']}`, 'nav');
                    return;
                }
                if (e.key === '3') {
                    e.preventDefault();
                    setActiveTab('mir-playlist');
                    onToast(`Switched to ${TAB_LABELS['mir-playlist']}`, 'nav');
                    return;
                }
                // '?' or '/' for Help
                if (e.key === '?') {
                    e.preventDefault();
                    onOpenShortcutsModal();
                    return;
                }
                // Escape
                if (e.key === 'Escape') {
                    if (onCloseModal)
                        onCloseModal();
                    return;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        activeTab,
        setActiveTab,
        isPlaying,
        onTogglePlayPause,
        onToggleSidebar,
        onToggleMute,
        onOpenShortcutsModal,
        onCloseModal,
        onToast,
    ]);
};
