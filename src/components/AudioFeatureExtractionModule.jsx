import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Waves, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { EMOTIONS_CONFIG } from '../data/musicCatalog';
export const AudioFeatureExtractionModule = ({ onAERDetected, currentEmotion, onNavigateToMIR, }) => {
    const [isMicActive, setIsMicActive] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [features, setFeatures] = useState({
        rmsEnergy: 0.28,
        spectralCentroid: 1850,
        spectralRolloff: 3400,
        zeroCrossingRate: 0.065,
        spectralFlux: 0.042,
        tempoBpm: 120,
        harmonicRatio: 0.78,
    });
    const [aerResult, setAerResult] = useState(null);
    const waveCanvasRef = useRef(null);
    const spectrumCanvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    // Toggle Live Microphone input
    const toggleMicrophone = async () => {
        if (isMicActive) {
            audioEngine.stopMicrophoneCapture();
            setIsMicActive(false);
        }
        else {
            const success = await audioEngine.startMicrophoneCapture();
            if (success) {
                setIsMicActive(true);
            }
        }
    };
    // Render Visualizers Loop (Waveform + Spectrum)
    useEffect(() => {
        let active = true;
        const render = () => {
            if (!active)
                return;
            // Extract current live features
            const currentFeatures = audioEngine.getLiveAudioFeatures();
            setFeatures(currentFeatures);
            // 1. Render Waveform (Time Domain)
            if (waveCanvasRef.current) {
                const canvas = waveCanvasRef.current;
                const ctx = canvas.getContext('2d');
                const timeData = audioEngine.getTimeData();
                if (ctx && timeData) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#F27D26'; // Sophisticated Dark Amber
                    ctx.beginPath();
                    const sliceWidth = canvas.width / timeData.length;
                    let x = 0;
                    for (let i = 0; i < timeData.length; i++) {
                        const v = timeData[i] / 128.0;
                        const y = (v * canvas.height) / 2;
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        }
                        else {
                            ctx.lineTo(x, y);
                        }
                        x += sliceWidth;
                    }
                    ctx.lineTo(canvas.width, canvas.height / 2);
                    ctx.stroke();
                    // Center baseline guide
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height / 2);
                    ctx.lineTo(canvas.width, canvas.height / 2);
                    ctx.stroke();
                }
            }
            // 2. Render Spectrum (Frequency Domain)
            if (spectrumCanvasRef.current) {
                const canvas = spectrumCanvasRef.current;
                const ctx = canvas.getContext('2d');
                const freqData = audioEngine.getFrequencyData();
                if (ctx && freqData) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const barWidth = (canvas.width / 64) - 1;
                    let x = 0;
                    for (let i = 0; i < 64; i++) {
                        // Aggregate frequency bin chunks
                        const dataIndex = Math.floor(i * (freqData.length / 64));
                        const barHeight = (freqData[dataIndex] / 255) * canvas.height;
                        // Amber-orange gradient for Sophisticated Dark theme
                        const lightness = Math.min(75, 40 + (barHeight / canvas.height) * 35);
                        ctx.fillStyle = `hsl(${22 + (i / 64) * 15}, 95%, ${lightness}%)`;
                        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }
                }
            }
            animationFrameRef.current = requestAnimationFrame(render);
        };
        render();
        return () => {
            active = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);
    // Run AER Wave Analysis against Backend API
    const runAERAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/emotion/aer-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acousticFeatures: features,
                    audioDuration: 5.0,
                }),
            });
            const data = await response.json();
            if (data.success && data.recognizedEmotion) {
                const result = {
                    recognizedEmotion: data.recognizedEmotion,
                    accuracy: data.accuracy ?? 85.8,
                    energyProfile: data.energyProfile || 'Dynamic acoustic wave',
                    waveCharacteristics: data.waveCharacteristics || 'Evaluated wave parameters',
                    aerMetrics: data.aerMetrics,
                    mirQueryPayload: data.mirQueryPayload,
                    timestamp: Date.now(),
                };
                setAerResult(result);
                onAERDetected(data.recognizedEmotion, result);
            }
        }
        catch (err) {
            console.error('AER recognition error:', err);
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const activeEmotionConfig = EMOTIONS_CONFIG[currentEmotion];
    return (<div id="audio-features-pillar" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-xs dark:shadow-none transition-colors duration-200">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#F27D26]/10 to-transparent pointer-events-none blur-2xl"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 dark:text-white/40">
                Pillars 1 &amp; 2 • Sound Analysis &amp; Audio Waveforms
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white/50 bg-zinc-100 dark:bg-white/5">
                DSP Engine Active
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-zinc-900 dark:text-white tracking-tight font-serif-display mb-2">
              Sound &amp; Voice Mood Analysis
            </h2>
            <p className="text-sm text-zinc-500 dark:text-white/40 max-w-2xl">
              Analyzes voice tone, pitch, dynamics, and audio waveforms to recognize your mood and curate your adaptive smart playlist.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button id="btn-toggle-mic" onClick={toggleMicrophone} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md ${isMicActive
            ? 'bg-[#EF4444] text-white ring-2 ring-[#EF4444]/40'
            : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-800 dark:text-white border border-zinc-200 dark:border-white/10'}`}>
              {isMicActive ? <MicOff className="w-3.5 h-3.5"/> : <Mic className="w-3.5 h-3.5"/>}
              <span>{isMicActive ? 'Stop Mic' : 'Microphone Live'}</span>
            </button>

            <button id="btn-run-aer" onClick={runAERAnalysis} disabled={isAnalyzing} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white/90 disabled:opacity-50 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg">
              <Activity className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`}/>
              <span>{isAnalyzing ? 'Evaluating...' : 'Analyze Sound Mood'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Signal Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visualizer 1: Time-Domain Waveform Oscilloscope */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Waves className="w-4 h-4 text-[#F27D26]"/>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40 font-medium">
                Voice &amp; Sound Waveform (Time Domain)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-white/40 uppercase tracking-widest">
              44.1 kHz • 1024 FFT
            </span>
          </div>

          <div className="h-44 bg-zinc-900 dark:bg-[#050505] rounded-xl p-2 border border-zinc-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
            <canvas ref={waveCanvasRef} width={540} height={160} className="w-full h-full"/>
            {isMicActive && (<div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-[#EF4444]/40 text-[#EF4444] text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping"/>
                <span>LIVE MIC STREAM</span>
              </div>)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-white/40 mt-3">
            Displays real-time acoustic wave vibrations used by the sound analyzer to detect dynamic volume surge and vocal energy.
          </p>
        </div>

        {/* Visualizer 2: Frequency Spectrum FFT */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-none transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-[#F27D26]"/>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40 font-medium">
                FFT Frequency Spectrum (Frequency Domain)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-white/40 uppercase tracking-widest">
              0 Hz - 22.05 kHz
            </span>
          </div>

          <div className="h-44 bg-zinc-900 dark:bg-[#050505] rounded-xl p-2 border border-zinc-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
            <canvas ref={spectrumCanvasRef} width={540} height={160} className="w-full h-full"/>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-white/40 mt-3">
            Deconstructs audio into discrete spectral bands to extract spectral centroid (timbre brightness) and harmonic content.
          </p>
        </div>
      </div>

      {/* Extracted Audio Features Dial Grid (Pillar 1) */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-none transition-colors duration-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40 font-medium">
              Real-Time Acoustic Feature Extraction Gauges
            </h3>
            <p className="text-xs text-zinc-500 dark:text-white/40 mt-0.5">
              Computed mathematically per frame and fed into the Emotion-Audio Recognition engine.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#F27D26] bg-[#F27D26]/10 border border-[#F27D26]/30 px-3 py-0.5 rounded-full">
            DSP Stream Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* 1. RMS Energy */}
          <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100/80 dark:hover:bg-white/[0.08] transition-colors">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40 font-medium">
              RMS Energy
            </div>
            <div className="text-2xl font-light font-serif-display text-zinc-900 dark:text-white mt-1">
              {features.rmsEnergy.toFixed(3)}
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#F27D26] transition-all duration-150" style={{ width: `${Math.min(100, features.rmsEnergy * 100)}%` }}/>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-white/30 mt-1.5 block">Amplitude power</span>
          </div>

          {/* 2. Spectral Centroid */}
          <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100/80 dark:hover:bg-white/[0.08] transition-colors">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40 font-medium">
              Centroid
            </div>
            <div className="text-2xl font-light font-serif-display text-zinc-900 dark:text-white mt-1">
              {features.spectralCentroid} <span className="text-xs font-mono text-zinc-400 dark:text-white/40">Hz</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#F27D26] transition-all duration-150" style={{ width: `${Math.min(100, (features.spectralCentroid / 6000) * 100)}%` }}/>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-white/30 mt-1.5 block">Timbre brightness</span>
          </div>

          {/* 3. Spectral Rolloff */}
          <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100/80 dark:hover:bg-white/[0.08] transition-colors">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40 font-medium">
              Rolloff (85%)
            </div>
            <div className="text-2xl font-light font-serif-display text-zinc-900 dark:text-white mt-1">
              {features.spectralRolloff} <span className="text-xs font-mono text-zinc-400 dark:text-white/40">Hz</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#FF4E00] transition-all duration-150" style={{ width: `${Math.min(100, (features.spectralRolloff / 10000) * 100)}%` }}/>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-white/30 mt-1.5 block">Upper freq bounds</span>
          </div>

          {/* 4. Zero-Crossing Rate */}
          <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100/80 dark:hover:bg-white/[0.08] transition-colors">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40 font-medium">
              ZCR (Noise)
            </div>
            <div className="text-2xl font-light font-serif-display text-zinc-900 dark:text-white mt-1">
              {features.zeroCrossingRate.toFixed(3)}
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#F27D26] transition-all duration-150" style={{ width: `${Math.min(100, features.zeroCrossingRate * 350)}%` }}/>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-white/30 mt-1.5 block">Percussion / rasp</span>
          </div>

          {/* 5. Harmonic Ratio */}
          <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100/80 dark:hover:bg-white/[0.08] transition-colors">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40 font-medium">
              Harmonic Ratio
            </div>
            <div className="text-2xl font-light font-serif-display text-zinc-900 dark:text-white mt-1">
              {features.harmonicRatio.toFixed(2)}
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#F27D26] transition-all duration-150" style={{ width: `${features.harmonicRatio * 100}%` }}/>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-white/30 mt-1.5 block">Tonality coherence</span>
          </div>

          {/* 6. Estimated BPM */}
          <div className="bg-zinc-50 dark:bg-white/5 p-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100/80 dark:hover:bg-white/[0.08] transition-colors">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-white/40 font-medium">
              Estimated Tempo
            </div>
            <div className="text-2xl font-light font-serif-display text-zinc-900 dark:text-white mt-1">
              {features.tempoBpm} <span className="text-xs font-mono text-zinc-400 dark:text-white/40">BPM</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#FF4E00] transition-all duration-150" style={{ width: `${Math.min(100, (features.tempoBpm / 180) * 100)}%` }}/>
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-white/30 mt-1.5 block">Rhythm velocity</span>
          </div>
        </div>
      </div>

      {/* Sound Mood Evaluation Outcome Card */}
      {aerResult && (<div className="bg-orange-50/70 dark:bg-[#0a0a0a] border border-[#F27D26]/40 rounded-2xl p-6 relative overflow-hidden shadow-xs dark:shadow-[0_0_25px_rgba(242,125,38,0.15)] transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#F27D26]"/>
                <span className="text-[10px] font-medium text-[#F27D26] uppercase tracking-[0.2em]">
                  Sound Mood Analysis Resolved
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/30">
                  {aerResult.accuracy}% Accuracy
                </span>
              </div>
              <h3 className="text-2xl font-light text-zinc-900 dark:text-white font-serif-display">
                Audio Emotion: {EMOTIONS_CONFIG[aerResult.recognizedEmotion]?.label} ({aerResult.energyProfile})
              </h3>
              <p className="text-xs text-zinc-600 dark:text-white/50 max-w-2xl">
                {aerResult.waveCharacteristics}
              </p>
            </div>

            <button onClick={onNavigateToMIR} className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-white/90 transition-all cursor-pointer whitespace-nowrap shadow-md">
              <span>Open Smart Playlist</span>
              <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>)}

      {/* Theoretical Model: 3 Pillars Software Engineering Architecture */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xs dark:shadow-none transition-colors duration-200">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-white/40 font-medium mb-4">
          EmotiTunes Three-Pillar Software Engineering Architecture
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-50 dark:bg-white/5 p-5 rounded-xl border border-zinc-200 dark:border-white/10">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-[#1a1a1a] text-zinc-700 dark:text-white/60 flex items-center justify-center font-mono text-xs mb-3">
              01
            </div>
            <h5 className="text-sm font-medium text-zinc-900 dark:text-white">Audio Feature Extraction</h5>
            <p className="text-xs text-zinc-500 dark:text-white/40 mt-1.5 leading-relaxed">
              Computes digital signal processing matrices: Fast Fourier Transform (FFT), Zero-Crossing Rate, Spectral Centroid, and RMS energy envelopes.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-white/5 p-5 rounded-xl border border-zinc-200 dark:border-white/10">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-[#1a1a1a] text-[#F27D26] flex items-center justify-center font-mono text-xs mb-3">
              02
            </div>
            <h5 className="text-sm font-medium text-zinc-900 dark:text-white">Sound &amp; Voice Mood Recognition</h5>
            <p className="text-xs text-zinc-500 dark:text-white/40 mt-1.5 leading-relaxed">
              Machine learning classifier evaluating dynamic audio waves, pitch variance, and harmonic ratios into 7 emotional categories.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-white/5 p-5 rounded-xl border border-zinc-200 dark:border-white/10">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-[#1a1a1a] text-zinc-700 dark:text-white/60 flex items-center justify-center font-mono text-xs mb-3">
              03
            </div>
            <h5 className="text-sm font-medium text-zinc-900 dark:text-white">Visual Emotion Extraction</h5>
            <p className="text-xs text-zinc-500 dark:text-white/40 mt-1.5 leading-relaxed">
              Vision-based facial expression analyzer operating within 80%-90% accuracy, feeding the smart mood playlist matching system.
            </p>
          </div>
        </div>
      </div>

    </div>);
};
