import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Sliders, Music, Disc, ListMusic } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { EMOTIONS_CONFIG, TRACK_CATALOG } from '../data/musicCatalog';
import { ExternalMusicLauncher } from './ExternalMusicLauncher';
export const MIRPlaylistPlayer = ({ currentEmotion, onSelectEmotion, isPlaying, setIsPlaying, currentTrack, setCurrentTrack, detectionAccuracy = 86.4, }) => {
    const [playlist, setPlaylist] = useState([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(180);
    const [volume, setVolume] = useState(0.75);
    const [isMuted, setIsMuted] = useState(false);
    const [showEQ, setShowEQ] = useState(false);
    const [eqLow, setEqLow] = useState(0);
    const [eqMid, setEqMid] = useState(0);
    const [eqHigh, setEqHigh] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [mirFilter, setMirFilter] = useState('all');
    // Load / Update playlist whenever currentEmotion changes (MIR Automation)
    useEffect(() => {
        // MIR retrieval: filter tracks matching target emotion, sorted by MIR Match Score
        let matchingTracks = TRACK_CATALOG.filter((t) => t.emotion === currentEmotion);
        if (matchingTracks.length === 0) {
            matchingTracks = TRACK_CATALOG.slice(0, 3);
        }
        matchingTracks.sort((a, b) => b.mirMatchScore - a.mirMatchScore);
        setPlaylist(matchingTracks);
        // If current track is not in current playlist or null, set to first track
        if (!currentTrack || currentTrack.emotion !== currentEmotion) {
            setCurrentTrack(matchingTracks[0]);
        }
    }, [currentEmotion]);
    // Connect AudioEngine Callbacks
    useEffect(() => {
        audioEngine.setCallbacks((time, dur) => {
            setCurrentTime(time);
            setDuration(dur);
        }, () => {
            // Track ended
            handleNextTrack();
        });
    }, [playlist, currentTrack, isLooping, isShuffling]);
    const handlePlayPause = () => {
        if (!currentTrack) {
            if (playlist.length > 0) {
                handlePlayTrack(playlist[0]);
            }
            return;
        }
        if (isPlaying) {
            audioEngine.pausePlayback();
            setIsPlaying(false);
        }
        else {
            audioEngine.resumePlayback();
            setIsPlaying(true);
        }
    };
    const handlePlayTrack = (track) => {
        setCurrentTrack(track);
        audioEngine.playTrack(track);
        setIsPlaying(true);
    };
    const handleNextTrack = () => {
        if (playlist.length === 0)
            return;
        if (isLooping && currentTrack) {
            handlePlayTrack(currentTrack);
            return;
        }
        const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
        let nextIndex;
        if (isShuffling) {
            nextIndex = Math.floor(Math.random() * playlist.length);
        }
        else {
            nextIndex = (currentIndex + 1) % playlist.length;
        }
        handlePlayTrack(playlist[nextIndex]);
    };
    const handlePrevTrack = () => {
        if (playlist.length === 0)
            return;
        const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        handlePlayTrack(playlist[prevIndex]);
    };
    const handleSeek = (e) => {
        const val = Number(e.target.value);
        setCurrentTime(val);
        audioEngine.seek(val);
    };
    const handleVolumeChange = (e) => {
        const val = Number(e.target.value);
        setVolume(val);
        if (isMuted)
            setIsMuted(false);
        audioEngine.setVolume(val);
    };
    const toggleMute = () => {
        if (isMuted) {
            setIsMuted(false);
            audioEngine.setVolume(volume);
        }
        else {
            setIsMuted(true);
            audioEngine.setVolume(0);
        }
    };
    const updateEQ = (low, mid, high) => {
        setEqLow(low);
        setEqMid(mid);
        setEqHigh(high);
        audioEngine.setEQ(low, mid, high);
    };
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    // Filter playlist based on user sub-criterion
    const filteredPlaylist = playlist.filter((track) => {
        if (mirFilter === 'high-energy')
            return track.energy > 0.7;
        if (mirFilter === 'acoustic')
            return track.acousticness > 0.5;
        if (mirFilter === 'top-match')
            return track.mirMatchScore > 92;
        return true;
    });
    const emotionConfig = EMOTIONS_CONFIG[currentEmotion] || EMOTIONS_CONFIG['joy-excitement'];
    return (<div id="mir-playlist-player" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-xs dark:shadow-none transition-colors duration-200">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-[#F27D26]/10 to-transparent pointer-events-none blur-2xl"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 dark:text-white/40">
                Pillar 3 • Smart Mood-Music Matching
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/50 bg-zinc-100 dark:bg-white/5">
                Cosine Similarity: Active
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-zinc-900 dark:text-white tracking-tight font-serif-display mb-2">
              Dynamic Flow for {emotionConfig.label}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-white/40 max-w-2xl">
              Curated by smart mood matching for your {emotionConfig.label} state, pairing live sound analysis with {detectionAccuracy.toFixed(1)}% facial classification accuracy.
            </p>
          </div>

          {/* MIR Filters */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 p-1.5 rounded-full border border-zinc-200 dark:border-white/10 self-start md:self-auto">
            <button onClick={() => setMirFilter('all')} className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer ${mirFilter === 'all'
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
            : 'text-zinc-600 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white'}`}>
              All Matches
            </button>
            <button onClick={() => setMirFilter('top-match')} className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer ${mirFilter === 'top-match'
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
            : 'text-zinc-600 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white'}`}>
              &gt;92% Score
            </button>
            <button onClick={() => setMirFilter('high-energy')} className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer ${mirFilter === 'high-energy'
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
            : 'text-zinc-600 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white'}`}>
              High Energy
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Track List + Active Song Artwork & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Playlist Tracks (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <ListMusic className="w-4 h-4 text-[#F27D26]"/>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40 font-medium">
                Retrieved Tracks ({filteredPlaylist.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-white/40 uppercase tracking-widest">
              Target: {emotionConfig.tempoRange}
            </span>
          </div>

          <div className="space-y-3">
            {filteredPlaylist.map((track, idx) => {
            const isSelected = currentTrack?.id === track.id;
            const formattedIdx = (idx + 1).toString().padStart(2, '0');
            return (<div key={track.id} onClick={() => handlePlayTrack(track)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${isSelected
                    ? 'bg-orange-50/80 dark:bg-white/10 border-[#F27D26]/60 shadow-[0_0_20px_rgba(242,125,38,0.15)] ring-1 ring-[#F27D26]/40'
                    : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-100/80 dark:hover:bg-white/[0.08] hover:border-zinc-300 dark:hover:border-white/20'}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-mono text-sm transition-all ${isSelected && isPlaying
                    ? 'bg-[#F27D26] text-black font-bold shadow-md shadow-[#F27D26]/30'
                    : 'bg-zinc-200 text-zinc-700 dark:bg-[#1a1a1a] dark:text-white/40 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:bg-zinc-300 dark:group-hover:bg-[#222]'}`}>
                      {isSelected && isPlaying ? (<Pause className="w-4 h-4"/>) : (<span>{formattedIdx}</span>)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {track.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/50 bg-zinc-100 dark:bg-white/5">
                          {track.key}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-white/40 truncate mt-0.5">
                        {track.artist} <span className="text-zinc-300 dark:text-white/20">•</span> <span className="text-zinc-600 dark:text-white/50 italic">{track.genre}</span>
                      </p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] border border-[#F27D26]/40 text-[#F27D26] px-2 py-0.5 rounded-full">
                          {emotionConfig.label}
                        </span>
                        <span className="text-[10px] border border-zinc-200 dark:border-white/20 text-zinc-600 dark:text-white/50 px-2 py-0.5 rounded-full font-mono">
                          {track.bpm} BPM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: External music launcher & Smart Match score */}
                  <div className="flex items-center gap-3 shrink-0">
                    <ExternalMusicLauncher track={track} variant="compact"/>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-medium text-zinc-900 dark:text-white">
                        {track.mirMatchScore}%
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-white/40 uppercase tracking-widest block">Smart Match</span>
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </div>

        {/* Right: Active Song Details & MIR Feature Vector (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xs dark:shadow-none transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40 font-medium">
                Active Sound Generation Profile
              </span>
              <span className="text-[10px] font-mono text-[#F27D26] bg-[#F27D26]/10 border border-[#F27D26]/30 px-2.5 py-0.5 rounded-full">
                Synthesizer Live
              </span>
            </div>

            {currentTrack ? (<div className="space-y-5">
                {/* Generative Visual Art Card */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-200/60 to-zinc-100 dark:from-[#141414] dark:via-[#0c0c0c] dark:to-[#181818] border border-zinc-200 dark:border-white/10 flex items-center justify-center p-6 text-center shadow-inner">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"/>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(242,125,38,0.35)] text-white ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ backgroundColor: emotionConfig.accentColor }}>
                      <Disc className="w-8 h-8"/>
                    </div>
                    <h4 className="text-xl font-light text-zinc-900 dark:text-white font-serif-display">{currentTrack.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-white/50 mt-0.5 italic">{currentTrack.artist}</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-700 dark:text-white/60 font-mono">
                      <span>{currentTrack.genre}</span>
                      <span>•</span>
                      <span>{currentTrack.key}</span>
                    </div>
                  </div>
                </div>

                {/* MIR Acoustic Dimension Gauges */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-600 dark:text-white/60">
                      <span>Valence (Positivity)</span>
                      <span className="font-mono text-zinc-900 dark:text-white/90">{Math.round(currentTrack.valence * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F27D26] transition-all duration-300" style={{ width: `${currentTrack.valence * 100}%` }}/>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-600 dark:text-white/60">
                      <span>Energy (Dynamics)</span>
                      <span className="font-mono text-zinc-900 dark:text-white/90">{Math.round(currentTrack.energy * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF4E00] transition-all duration-300" style={{ width: `${currentTrack.energy * 100}%` }}/>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-600 dark:text-white/60">
                      <span>Danceability</span>
                      <span className="font-mono text-zinc-900 dark:text-white/90">{Math.round(currentTrack.danceability * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 dark:bg-white transition-all duration-300" style={{ width: `${currentTrack.danceability * 100}%` }}/>
                    </div>
                  </div>
                </div>

                {/* External Streaming Launcher (YouTube Music, Spotify, Apple, etc.) */}
                <ExternalMusicLauncher track={currentTrack} variant="full"/>
              </div>) : (<div className="text-center py-12 text-zinc-400 dark:text-white/40 text-xs">
                Select a track to inspect acoustic descriptors.
              </div>)}
          </div>

          {/* Equalizer Quick Toggle */}
          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-white/10">
            <button onClick={() => setShowEQ(!showEQ)} className="flex items-center justify-between w-full text-xs font-medium text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#F27D26]"/>
                <span className="uppercase text-[10px] tracking-[0.15em]">3-Band Hardware Filter Equalizer</span>
              </div>
              <span className="text-[10px] font-mono">{showEQ ? 'HIDE' : 'CONFIG'}</span>
            </button>

            {showEQ && (<div className="grid grid-cols-3 gap-3 mt-3 p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10">
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-500 dark:text-white/40 mb-1 font-mono">
                    <span>LOW</span>
                    <span>{eqLow}dB</span>
                  </div>
                  <input type="range" min="-12" max="12" value={eqLow} onChange={(e) => updateEQ(Number(e.target.value), eqMid, eqHigh)} className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded accent-[#F27D26] cursor-pointer"/>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-500 dark:text-white/40 mb-1 font-mono">
                    <span>MID</span>
                    <span>{eqMid}dB</span>
                  </div>
                  <input type="range" min="-12" max="12" value={eqMid} onChange={(e) => updateEQ(eqLow, Number(e.target.value), eqHigh)} className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded accent-[#F27D26] cursor-pointer"/>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-500 dark:text-white/40 mb-1 font-mono">
                    <span>HIGH</span>
                    <span>{eqHigh}dB</span>
                  </div>
                  <input type="range" min="-12" max="12" value={eqHigh} onChange={(e) => updateEQ(eqLow, eqMid, Number(e.target.value))} className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded accent-[#F27D26] cursor-pointer"/>
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* Transport Player Bar (Bottom Dock matching Design HTML) */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-lg dark:shadow-2xl transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Current track info & quick streaming launcher */}
          <div className="flex items-center justify-between gap-3 w-full md:w-1/3 min-w-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-[#1a1a1a] rounded-xl border border-zinc-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs" style={{ color: emotionConfig.accentColor }}>
                <Music className="w-5 h-5"/>
              </div>
              <div className="min-w-0">
                <h5 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                  {currentTrack ? currentTrack.title : 'EmotiTunes Engine Ready'}
                </h5>
                <p className="text-[11px] text-zinc-500 dark:text-white/40 italic truncate">
                  {currentTrack ? `${currentTrack.artist} • ${currentTrack.genre}` : 'Select track to play'}
                </p>
              </div>
            </div>

            {currentTrack && (<div className="shrink-0 hidden sm:block">
                <ExternalMusicLauncher track={currentTrack} variant="dock"/>
              </div>)}
          </div>

          {/* Transport Controls & Scrub Bar (Center) */}
          <div className="flex flex-col items-center gap-3 w-full md:w-1/3">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsShuffling(!isShuffling)} className={`transition-colors cursor-pointer ${isShuffling ? 'text-[#F27D26]' : 'text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white'}`} title="Shuffle">
                <Shuffle className="w-4 h-4"/>
              </button>

              <button onClick={handlePrevTrack} className="text-zinc-400 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer" title="Previous Track">
                <SkipBack className="w-4 h-4"/>
              </button>

              <button onClick={handlePlayPause} className="w-10 h-10 rounded-full border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-sm" title={isPlaying ? 'Pause (Space)' : 'Play (Space)'} aria-label={isPlaying ? 'Pause track' : 'Play track'}>
                {isPlaying ? (<Pause className="w-4 h-4"/>) : (<Play className="w-4 h-4 ml-0.5"/>)}
              </button>

              <button onClick={handleNextTrack} className="text-zinc-400 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer" title="Next Track">
                <SkipForward className="w-4 h-4"/>
              </button>

              <button onClick={() => setIsLooping(!isLooping)} className={`transition-colors cursor-pointer ${isLooping ? 'text-[#F27D26]' : 'text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white'}`} title="Repeat Track">
                <Repeat className="w-4 h-4"/>
              </button>
            </div>

            {/* Scrub Slider with custom minimalist progress */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] font-mono text-zinc-400 dark:text-white/40 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative flex items-center">
                <input type="range" min="0" max={duration || 180} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded-full accent-zinc-900 dark:accent-white cursor-pointer"/>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-white/40 w-8">
                {formatTime(duration || 180)}
              </span>
            </div>
          </div>

          {/* Volume Control & Smart Sync Pill (Right matching design) */}
          <div className="flex items-center justify-end gap-5 w-full md:w-1/3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-white/40">SMART SYNC</span>
              <div className="w-8 h-4 bg-[#F27D26] rounded-full flex items-center px-0.5 shadow-xs">
                <div className="w-3 h-3 bg-white rounded-full ml-auto shadow-xs"/>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} title={isMuted || volume === 0 ? 'Unmute (M)' : 'Mute (M)'} aria-label={isMuted || volume === 0 ? 'Unmute audio synthesizer' : 'Mute audio synthesizer'} className="text-zinc-400 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer">
                {isMuted || volume === 0 ? (<VolumeX className="w-4 h-4"/>) : (<Volume2 className="w-4 h-4"/>)}
              </button>
              <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1 bg-zinc-200 dark:bg-white/10 rounded-full accent-zinc-900 dark:accent-white cursor-pointer"/>
            </div>
          </div>
        </div>
      </div>

    </div>);
};
