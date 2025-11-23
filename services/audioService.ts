class AudioService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Essential for mobile: This must be called inside a user interaction event (click/touch)
  public async unlock() {
    this.initContext();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      // Play silent buffer to fully unlock iOS/Android audio
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    }
  }

  public async startAlarm() {
    this.initContext();
    if (this.isPlaying || !this.audioContext) return;
    
    // Attempt to resume if suspended (might fail if not triggered by user, handled by unlock())
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn("Audio Context resume failed - user gesture needed previously", e);
      }
    }

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.type = 'triangle';
    this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
    
    // Create a pulsing effect
    this.oscillator.frequency.setTargetAtTime(880, this.audioContext.currentTime + 0.5, 0.1);
    
    // Modulation
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 4; // 4 pulses per second
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 500;
    
    lfo.connect(lfoGain);
    lfoGain.connect(this.oscillator.frequency);
    lfo.start();

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Fade in
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 2);

    this.oscillator.start();
    this.isPlaying = true;
  }

  public stopAlarm() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        console.warn("Error stopping oscillator", e);
      }
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }
}

export const audioService = new AudioService();