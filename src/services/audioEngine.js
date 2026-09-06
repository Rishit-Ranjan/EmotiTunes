class AudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.masterGain = null;
        this.eqLow = null;
        this.eqMid = null;
        this.eqHigh = null;
        // Synthesizer playback state
        this.isPlaying = false;
        this.currentTrack = null;
        this.playbackTimer = null;
        this.stepIndex = 0;
        this.playbackTime = 0;
        this.activeVoices = [];
        // Mic capture state
        this.micStream = null;
        this.micSource = null;
        this.micAnalyser = null;
        this.isMicListening = false;
        // Listeners
        this.onTimeUpdateCallback = null;
        this.onTrackEndedCallback = null;
        // Cached analysis arrays
        this.timeData = null;
        this.freqData = null;
        this.prevFreqData = null;
    }
    init() {
        if (!this.ctx) {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtxClass();
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.8;
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.75;
            // 3-Band Equalizer
            this.eqLow = this.ctx.createBiquadFilter();
            this.eqLow.type = 'lowshelf';
            this.eqLow.frequency.value = 250;
            this.eqLow.gain.value = 0;
            this.eqMid = this.ctx.createBiquadFilter();
            this.eqMid.type = 'peaking';
            this.eqMid.frequency.value = 1500;
            this.eqMid.Q.value = 1.0;
            this.eqMid.gain.value = 0;
            this.eqHigh = this.ctx.createBiquadFilter();
            this.eqHigh.type = 'highshelf';
            this.eqHigh.frequency.value = 6000;
            this.eqHigh.gain.value = 0;
            // Chain: Synth -> eqLow -> eqMid -> eqHigh -> MasterGain -> Analyser -> Destination
            this.eqLow.connect(this.eqMid);
            this.eqMid.connect(this.eqHigh);
            this.eqHigh.connect(this.masterGain);
            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);
            this.timeData = new Uint8Array(this.analyser.fftSize);
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
            this.prevFreqData = new Float32Array(this.analyser.frequencyBinCount);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    setCallbacks(onTimeUpdate, onEnded) {
        this.onTimeUpdateCallback = onTimeUpdate;
        this.onTrackEndedCallback = onEnded;
    }
    playTrack(track) {
        this.init();
        this.stopPlayback();
        this.currentTrack = track;
        this.isPlaying = true;
        this.playbackTime = 0;
        this.stepIndex = 0;
        this.startSequencer(track);
    }
    togglePlayPause() {
        if (!this.currentTrack)
            return false;
        if (this.isPlaying) {
            this.pausePlayback();
            return false;
        }
        else {
            this.resumePlayback();
            return true;
        }
    }
    pausePlayback() {
        this.isPlaying = false;
        if (this.playbackTimer) {
            window.clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
        this.stopAllVoices();
    }
    resumePlayback() {
        if (!this.currentTrack)
            return;
        this.init();
        this.isPlaying = true;
        this.startSequencer(this.currentTrack);
    }
    stopPlayback() {
        this.isPlaying = false;
        if (this.playbackTimer) {
            window.clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
        this.stopAllVoices();
        this.stepIndex = 0;
        this.playbackTime = 0;
    }
    seek(seconds) {
        if (!this.currentTrack)
            return;
        this.playbackTime = Math.max(0, Math.min(seconds, this.currentTrack.duration));
    }
    setVolume(val) {
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
        }
    }
    setEQ(low, mid, high) {
        if (!this.ctx)
            return;
        const t = this.ctx.currentTime;
        if (this.eqLow)
            this.eqLow.gain.setValueAtTime(low, t);
        if (this.eqMid)
            this.eqMid.gain.setValueAtTime(mid, t);
        if (this.eqHigh)
            this.eqHigh.gain.setValueAtTime(high, t);
    }
    stopAllVoices() {
        this.activeVoices.forEach(({ osc, gain }) => {
            try {
                if (this.ctx) {
                    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
                }
                osc.stop();
                osc.disconnect();
            }
            catch (e) {
                // ignore already stopped
            }
        });
        this.activeVoices = [];
    }
    startSequencer(track) {
        const pattern = track.synthPattern;
        const bpm = pattern.tempo || track.bpm;
        // Step resolution: 16th notes
        const stepDurationMs = (60 / bpm / 4) * 1000;
        this.playbackTimer = window.setInterval(() => {
            if (!this.isPlaying || !this.ctx || !this.eqLow)
                return;
            this.playbackTime += stepDurationMs / 1000;
            if (this.onTimeUpdateCallback) {
                this.onTimeUpdateCallback(this.playbackTime, track.duration);
            }
            if (this.playbackTime >= track.duration) {
                this.stopPlayback();
                if (this.onTrackEndedCallback) {
                    this.onTrackEndedCallback();
                }
                return;
            }
            const chordIdx = Math.floor(this.stepIndex / 16) % pattern.chordProgression.length;
            const currentChord = pattern.chordProgression[chordIdx];
            const stepInMeasure = this.stepIndex % 16;
            // 1. Bass line on beats 0, 4, 8, 12 or syncopated
            if (stepInMeasure === 0 || stepInMeasure === 8 || (pattern.rhythmDensity >= 3 && (stepInMeasure === 6 || stepInMeasure === 14))) {
                this.triggerBassNote(pattern.rootFreq * Math.pow(2, currentChord[0] / 12), pattern.bassWave, pattern.filterCutoff);
            }
            // 2. Chords / Arpeggio
            if (pattern.rhythmDensity >= 2) {
                if (stepInMeasure % (4 / (pattern.rhythmDensity > 3 ? 2 : 1)) === 0) {
                    const noteOffset = currentChord[stepInMeasure % currentChord.length];
                    const freq = pattern.rootFreq * 2 * Math.pow(2, noteOffset / 12);
                    this.triggerMelodyNote(freq, pattern.leadWave, 0.18, 0.25);
                }
            }
            // 3. Percussion / Rhythm tick for excited / angry moods
            if (pattern.rhythmDensity >= 3) {
                if (stepInMeasure === 0 || stepInMeasure === 8) {
                    this.triggerKick(track.emotion === 'anger' ? 140 : 100);
                }
                if (stepInMeasure === 4 || stepInMeasure === 12) {
                    this.triggerSnareNoise(track.emotion);
                }
                if (stepInMeasure % 2 === 0) {
                    this.triggerHiHat();
                }
            }
            else if (track.emotion === 'sadness') {
                // Subtle ambient pad swells
                if (stepInMeasure === 0) {
                    currentChord.forEach((note) => {
                        const padFreq = pattern.rootFreq * 2 * Math.pow(2, note / 12);
                        this.triggerPadNote(padFreq, 2.5);
                    });
                }
            }
            else if (track.emotion === 'joy') {
                if (stepInMeasure === 0 || stepInMeasure === 6 || stepInMeasure === 10) {
                    const chordNote = currentChord[Math.floor(Math.random() * currentChord.length)];
                    this.triggerMelodyNote(pattern.rootFreq * 2 * Math.pow(2, chordNote / 12), 'triangle', 0.2, 0.4);
                }
            }
            this.stepIndex++;
        }, stepDurationMs);
    }
    // --- Synth Voice Triggers ---
    triggerBassNote(freq, wave, cutoff) {
        if (!this.ctx || !this.eqLow)
            return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff * 0.7, t);
        filter.frequency.exponentialRampToValueAtTime(120, t + 0.35);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.eqLow);
        osc.start(t);
        osc.stop(t + 0.45);
    }
    triggerMelodyNote(freq, wave, gainAmt, duration) {
        if (!this.ctx || !this.eqLow)
            return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(gainAmt, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain);
        gain.connect(this.eqLow);
        osc.start(t);
        osc.stop(t + duration + 0.05);
    }
    triggerPadNote(freq, duration) {
        if (!this.ctx || !this.eqLow)
            return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain);
        gain.connect(this.eqLow);
        osc.start(t);
        osc.stop(t + duration + 0.1);
    }
    triggerKick(startFreq) {
        if (!this.ctx || !this.eqLow)
            return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.25);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.eqLow);
        osc.start(t);
        osc.stop(t + 0.28);
    }
    triggerSnareNoise(emotion) {
        if (!this.ctx || !this.eqLow)
            return;
        const t = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = emotion === 'anger' ? 1800 : 2500;
        filter.Q.value = 1.2;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.eqLow);
        noise.start(t);
        noise.stop(t + 0.14);
    }
    triggerHiHat() {
        if (!this.ctx || !this.eqLow)
            return;
        const t = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8500;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.eqLow);
        noise.start(t);
        noise.stop(t + 0.05);
    }
    // --- Real-time Feature Extraction (Pillar 1) ---
    getLiveAudioFeatures() {
        const activeAnalyser = this.isMicListening && this.micAnalyser ? this.micAnalyser : this.analyser;
        if (!activeAnalyser || !this.timeData || !this.freqData) {
            return {
                rmsEnergy: 0.05,
                spectralCentroid: 1200,
                spectralRolloff: 2400,
                zeroCrossingRate: 0.04,
                spectralFlux: 0.02,
                tempoBpm: this.currentTrack?.bpm || 110,
                harmonicRatio: 0.7,
            };
        }
        activeAnalyser.getByteTimeDomainData(this.timeData);
        activeAnalyser.getByteFrequencyData(this.freqData);
        const length = this.timeData.length;
        let sumSquares = 0;
        let zeroCrossings = 0;
        for (let i = 0; i < length; i++) {
            const normalized = (this.timeData[i] - 128) / 128;
            sumSquares += normalized * normalized;
            if (i > 0) {
                const prevNorm = (this.timeData[i - 1] - 128) / 128;
                if ((normalized >= 0 && prevNorm < 0) || (normalized < 0 && prevNorm >= 0)) {
                    zeroCrossings++;
                }
            }
        }
        const rmsEnergy = Math.min(1, Math.sqrt(sumSquares / length) * 2.2);
        const zeroCrossingRate = zeroCrossings / length;
        // Spectral Centroid & Rolloff
        const binCount = this.freqData.length;
        const nyquist = (this.ctx?.sampleRate || 44100) / 2;
        const binFreq = nyquist / binCount;
        let spectralSum = 0;
        let weightedSum = 0;
        let spectralFlux = 0;
        for (let b = 0; b < binCount; b++) {
            const mag = this.freqData[b] / 255;
            spectralSum += mag;
            weightedSum += mag * (b * binFreq);
            if (this.prevFreqData) {
                const diff = mag - this.prevFreqData[b];
                if (diff > 0)
                    spectralFlux += diff;
                this.prevFreqData[b] = mag;
            }
        }
        const spectralCentroid = spectralSum > 0 ? Math.round(weightedSum / spectralSum) : 1000;
        // 85% Rolloff
        let rolloffSum = 0;
        let spectralRolloff = 2000;
        const rolloffTarget = spectralSum * 0.85;
        for (let b = 0; b < binCount; b++) {
            rolloffSum += this.freqData[b] / 255;
            if (rolloffSum >= rolloffTarget) {
                spectralRolloff = Math.round(b * binFreq);
                break;
            }
        }
        const harmonicRatio = Math.min(1, Math.max(0.2, 1.0 - zeroCrossingRate * 3.5));
        const tempoBpm = this.currentTrack?.bpm || Math.round(80 + rmsEnergy * 80);
        return {
            rmsEnergy: +rmsEnergy.toFixed(3),
            spectralCentroid: Math.max(200, Math.min(8000, spectralCentroid)),
            spectralRolloff: Math.max(500, Math.min(12000, spectralRolloff)),
            zeroCrossingRate: +zeroCrossingRate.toFixed(3),
            spectralFlux: +(spectralFlux / binCount).toFixed(3),
            tempoBpm,
            harmonicRatio: +harmonicRatio.toFixed(2),
        };
    }
    // --- Visualizer Data Buffers ---
    getTimeData() {
        const activeAnalyser = this.isMicListening && this.micAnalyser ? this.micAnalyser : this.analyser;
        if (!activeAnalyser || !this.timeData)
            return null;
        activeAnalyser.getByteTimeDomainData(this.timeData);
        return this.timeData;
    }
    getFrequencyData() {
        const activeAnalyser = this.isMicListening && this.micAnalyser ? this.micAnalyser : this.analyser;
        if (!activeAnalyser || !this.freqData)
            return null;
        activeAnalyser.getByteFrequencyData(this.freqData);
        return this.freqData;
    }
    // --- Microphone Live Stream (for AER Module) ---
    async startMicrophoneCapture() {
        try {
            this.init();
            if (!this.ctx)
                return false;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.micStream = stream;
            this.micAnalyser = this.ctx.createAnalyser();
            this.micAnalyser.fftSize = 1024;
            this.micAnalyser.smoothingTimeConstant = 0.75;
            this.micSource = this.ctx.createMediaStreamSource(stream);
            // Connect to analyser only (NOT to destination, to prevent feedback screech)
            this.micSource.connect(this.micAnalyser);
            this.isMicListening = true;
            return true;
        }
        catch (err) {
            console.error('Microphone capture error:', err);
            return false;
        }
    }
    stopMicrophoneCapture() {
        if (this.micStream) {
            this.micStream.getTracks().forEach((track) => track.stop());
            this.micStream = null;
        }
        if (this.micSource) {
            this.micSource.disconnect();
            this.micSource = null;
        }
        this.micAnalyser = null;
        this.isMicListening = false;
    }
    getIsMicListening() {
        return this.isMicListening;
    }
    getIsPlaying() {
        return this.isPlaying;
    }
    getCurrentTrack() {
        return this.currentTrack;
    }
    getPlaybackTime() {
        return this.playbackTime;
    }
}
export const audioEngine = new AudioEngine();
