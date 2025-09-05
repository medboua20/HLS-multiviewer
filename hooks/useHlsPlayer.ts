import React, { useEffect, useState, useRef, useCallback } from 'react';
import type Hls from 'hls.js';
import { StreamStatus } from '../types';

declare global {
  interface Window {
    Hls: typeof Hls;
  }
}

// Configuration for automatic retries
const INITIAL_RETRY_DELAY = 1000; // 1 second
const BACKOFF_FACTOR = 1.5;
const MAX_RETRY_DELAY = 30000; // 30 seconds

export const useHlsPlayer = (
  src: string,
  videoRef: React.RefObject<HTMLVideoElement>,
  globalRefreshKey?: number
) => {
  const [status, setStatus] = useState<StreamStatus>(StreamStatus.Idle);
  const [refreshCount, setRefreshCount] = useState(0);
  const hlsRef = useRef<Hls | null>(null);
  
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const retryTimerRef = useRef<number | null>(null);
  const retryAttemptRef = useRef<number>(0);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // Internal function to re-trigger the useEffect hook
  const internalRefresh = useCallback(() => {
    console.log(`Attempting to load stream: ${src}`);
    setRefreshCount(count => count + 1);
  }, [src]);

  const scheduleRetry = useCallback(() => {
    clearRetryTimer();

    const retryDelay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(BACKOFF_FACTOR, retryAttemptRef.current),
      MAX_RETRY_DELAY
    );
    
    console.log(`Stream ${src} interrupted. Retrying in ${Math.round(retryDelay)}ms (Attempt ${retryAttemptRef.current + 1})`);

    // Set status to connecting to show a loading indicator during retry attempt
    if(statusRef.current !== StreamStatus.Connecting) {
        setStatus(StreamStatus.Connecting);
    }

    retryTimerRef.current = window.setTimeout(() => {
      retryAttemptRef.current += 1;
      internalRefresh(); // This triggers the useEffect to re-initialize the player
    }, retryDelay);

  }, [src, clearRetryTimer, internalRefresh]);


  useEffect(() => {
    if (!src || !videoRef.current) {
        setStatus(StreamStatus.Idle);
        return;
    }

    const videoElement = videoRef.current;
    
    // --- Native Media Element Event Handlers ---
    const onPlaying = () => {
        // Successful connection
        setStatus(StreamStatus.Connected);
        clearRetryTimer();
        retryAttemptRef.current = 0; // Reset retry counter on success
    };

    const onWaiting = () => {
        // Buffering
        if (statusRef.current === StreamStatus.Connected) {
             setStatus(StreamStatus.Stalled);
        }
    };

    const onError = () => {
        // A generic error on the video element, e.g., network error
        if (statusRef.current !== StreamStatus.Error && statusRef.current !== StreamStatus.Connecting) {
           setStatus(StreamStatus.Error);
           scheduleRetry();
        }
    };

     const onStalled = () => {
        // The browser is trying to fetch data, but it's not available.
        // This is a strong signal for an interruption.
        if (statusRef.current === StreamStatus.Connected) {
            setStatus(StreamStatus.Stalled);
            scheduleRetry();
        }
    };

    const onCanPlay = () => {
        // Attempt to play the video once it's ready.
        videoElement.play().catch(() => {
            // Autoplay was likely blocked by the browser.
            setStatus(StreamStatus.Idle);
        });
    }

    const initializePlayer = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
        
        if (window.Hls.isSupported()) {
            setStatus(StreamStatus.Connecting);
            const hls = new window.Hls({
                enableWorker: true,
                liveSyncDurationCount: 3.5,
                liveMaxLatencyDurationCount: 10,
                maxBufferLength: 60,
                maxMaxBufferLength: 120,
                fragLoadingMaxRetry: 6,
                manifestLoadingMaxRetry: 4,
                levelLoadingMaxRetry: 4,
                fragLoadingRetryDelay: 1000,
                manifestLoadingRetryDelay: 1000,
                levelLoadingRetryDelay: 1000,
            });
            hlsRef.current = hls;

            hls.loadSource(src);
            hls.attachMedia(videoElement);

            hls.on(window.Hls.Events.ERROR, (event, data) => {
                console.error(
                    `HLS.js Error on ${src}: Type=${data.type}, Details=${data.details}, Fatal=${data.fatal}`,
                    data
                );

                const criticalErrorDetails = [
                    window.Hls.ErrorDetails.MANIFEST_LOAD_ERROR,
                    window.Hls.ErrorDetails.MANIFEST_PARSING_ERROR,
                    window.Hls.ErrorDetails.LEVEL_LOAD_ERROR,
                    window.Hls.ErrorDetails.INTERNAL_EXCEPTION,
                ];

                if (data.fatal || criticalErrorDetails.includes(data.details)) {
                    console.warn(`Critical HLS error on ${src} (${data.details}). Triggering full player refresh.`);
                    scheduleRetry();
                }
            });
            
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = src;
            setStatus(StreamStatus.Connecting);
        }

        // Add event listeners to the video element
        videoElement.addEventListener('playing', onPlaying);
        videoElement.addEventListener('waiting', onWaiting);
        videoElement.addEventListener('error', onError);
        videoElement.addEventListener('stalled', onStalled);
        videoElement.addEventListener('canplay', onCanPlay);
    };
    
    initializePlayer();

    return () => {
      // Cleanup on component unmount or dependency change
      clearRetryTimer();
      if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
      }
      if (videoElement) {
          videoElement.removeEventListener('playing', onPlaying);
          videoElement.removeEventListener('waiting', onWaiting);
          videoElement.removeEventListener('error', onError);
          videoElement.removeEventListener('stalled', onStalled);
          videoElement.removeEventListener('canplay', onCanPlay);
      }
    };
  }, [src, videoRef, refreshCount, globalRefreshKey, scheduleRetry, clearRetryTimer]);

  const refreshStream = useCallback(() => {
    clearRetryTimer();
    retryAttemptRef.current = 0;
    internalRefresh();
  }, [clearRetryTimer, internalRefresh]);

  return { status, refreshStream };
};