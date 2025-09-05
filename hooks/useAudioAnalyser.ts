import React, { useEffect, useState, useRef, useCallback } from 'react';

export const useAudioAnalyser = (
  mediaRef: React.RefObject<HTMLMediaElement>,
  isMuted: boolean,
  volume: number,
) => {
  const [levels, setLevels] = useState({ l: 0, r: 0 });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const analyserLRef = useRef<AnalyserNode | null>(null);
  const analyserRRef = useRef<AnalyserNode | null>(null);
  
  const animationFrameId = useRef<number>(0);

  const resumeAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(e => console.error("Error resuming AudioContext", e));
    }
  }, []);

  useEffect(() => {
    const mediaElement = mediaRef.current;
    if (!mediaElement || sourceRef.current) {
      return;
    }
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaElementSource(mediaElement);
      sourceRef.current = source;
      
      const splitter = audioContext.createChannelSplitter(2);
      splitterRef.current = splitter;

      const analyserL = audioContext.createAnalyser();
      analyserL.fftSize = 256;
      analyserL.smoothingTimeConstant = 0.7;
      analyserLRef.current = analyserL;

      const analyserR = audioContext.createAnalyser();
      analyserR.fftSize = 256;
      analyserR.smoothingTimeConstant = 0.7;
      analyserRRef.current = analyserR;

      const gainNode = audioContext.createGain();
      gainRef.current = gainNode;

      // Connect the graph for stereo analysis and controlled output
      // Path for analysis: Source -> Splitter -> (AnalyserL, AnalyserR)
      // Path for output: Source -> Gain -> Destination
      source.connect(splitter);
      source.connect(gainNode);
      splitter.connect(analyserL, 0); // Connect channel 0 (left)
      splitter.connect(analyserR, 1); // Connect channel 1 (right)
      gainNode.connect(audioContext.destination);

      mediaElement.muted = false;
      mediaElement.volume = 1;

      const bufferLength = analyserL.frequencyBinCount;
      const dataArrayL = new Uint8Array(bufferLength);
      const dataArrayR = new Uint8Array(bufferLength);
      
      const draw = () => {
        animationFrameId.current = requestAnimationFrame(draw);
        if (!analyserLRef.current || !analyserRRef.current) return;
        
        analyserLRef.current.getByteFrequencyData(dataArrayL);
        analyserRRef.current.getByteFrequencyData(dataArrayR);

        const calculateRms = (data: Uint8Array) => {
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
                sum += data[i] * data[i];
            }
            return Math.sqrt(sum / data.length) / 128; // Normalize
        }
        
        const rmsL = calculateRms(dataArrayL);
        const rmsR = calculateRms(dataArrayR);
        
        setLevels({ l: rmsL, r: rmsR });
      };
      draw();

    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
    }

    mediaElement.addEventListener('play', resumeAudioContext);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      
      sourceRef.current?.disconnect();
      splitterRef.current?.disconnect();
      gainRef.current?.disconnect();
      sourceRef.current = null;

      audioContextRef.current?.close().catch(e => console.error("Error closing AudioContext on cleanup", e));
      audioContextRef.current = null;
      
      mediaElement.removeEventListener('play', resumeAudioContext);
    };
  }, [mediaRef, resumeAudioContext]);

  useEffect(() => {
    if (gainRef.current && audioContextRef.current) {
      const effectiveVolume = isMuted ? 0 : volume;
      gainRef.current.gain.setTargetAtTime(effectiveVolume, audioContextRef.current.currentTime, 0.02);
    }
  }, [isMuted, volume]);

  return { 
    levelL: levels.l,
    levelR: levels.r,
    resumeAudioContext 
  };
};