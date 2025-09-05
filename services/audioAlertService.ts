let audioContext: AudioContext | null = null;
let isInitialized = false;

const initializeAudio = (): void => {
  if (isInitialized || typeof window === 'undefined') return;

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context on the first user gesture
    const resume = () => {
      if (audioContext?.state === 'suspended') {
        audioContext.resume().catch(e => console.error("Could not resume audio context", e));
      }
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('touchstart', resume);
    isInitialized = true;
  } catch (e) {
    console.error("Web Audio API is not supported in this browser.", e);
  }
};

export const playAlertSound = (): void => {
  if (!isInitialized) {
    initializeAudio();
  }
  
  if (!audioContext || audioContext.state !== 'running') {
      console.warn("AudioContext not running. Cannot play alert sound.");
      return;
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

// Auto-initialize
initializeAudio();