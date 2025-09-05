import React, { useRef, useState, useEffect } from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { StreamStatus, AlertType, AudioBackgroundType } from '../types';
import VUMeter from './VUMeter';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { CloseIcon } from './icons/CloseIcon';
import { EditIcon } from './icons/EditIcon';
import { MaximizeIcon } from './icons/MaximizeIcon';
import { MinimizeIcon } from './icons/MinimizeIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { VolumeOffIcon } from './icons/VolumeOffIcon';
import { VolumeHighIcon } from './icons/VolumeHighIcon';

interface PlayerProps {
  cellId?: string;
  url: string;
  isAudioOnly: boolean;
  title?: string;
  onRemove?: () => void;
  onEdit?: () => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  imageUrl?: string;
  masterMute: boolean;
  titleImageUrl?: string;
  isSolo?: boolean;
  setSoloCellId?: (id: string | null) => void;
  globalRefreshKey?: number;
  onStatusChange?: (status: StreamStatus) => void;
  areControlsVisible?: boolean;
  addAlert?: (streamName: string, message: string, type: AlertType) => void;
  backgroundType?: AudioBackgroundType;
  backgroundVideoUrl?: string;
  // FIX: Added optional signalLossImageUrl property to fix type error.
  signalLossImageUrl?: string;
  audibleAlertsEnabled?: boolean;
}

const Player: React.FC<PlayerProps> = ({
  cellId,
  url,
  isAudioOnly,
  title,
  onRemove,
  onEdit,
  dragAttributes,
  dragListeners,
  imageUrl,
  masterMute,
  titleImageUrl,
  isSolo,
  setSoloCellId,
  globalRefreshKey,
  onStatusChange,
  areControlsVisible,
  addAlert,
  backgroundType,
  backgroundVideoUrl,
  audibleAlertsEnabled,
}) => {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const prevStatusRef = useRef<StreamStatus>(StreamStatus.Idle);
  const [isMuted, setIsMuted] = useState(true); // Individual mute state
  const [isHovering, setIsHovering] = useState(false); // For self-hovering (video player)
  
  const { status, refreshStream } = useHlsPlayer(url, mediaRef, globalRefreshKey);
  const showSignalLossImage = (status === StreamStatus.Connecting || status === StreamStatus.Error || status === StreamStatus.Stalled);
  
  const { levelL, levelR, resumeAudioContext } = useAudioAnalyser(
    mediaRef,
    isMuted || masterMute, // Combine local and global mute states
    1 // Volume is always 1, controlled by mute state
  );
  
  useEffect(() => {
    onStatusChange?.(status);

    const prevStatus = prevStatusRef.current;
    const streamIdentifier = title || url;
    
    // Alert on entering an error state from a good or connecting state
    if ((status === StreamStatus.Error || status === StreamStatus.Stalled) && 
        (prevStatus === StreamStatus.Connected || prevStatus === StreamStatus.Idle || prevStatus === StreamStatus.Connecting)) {
      const message = status === StreamStatus.Error ? 'Fatal error detected' : 'Stream stalled';
      addAlert?.(streamIdentifier, message, AlertType.Error);
    }
    
    // Alert on recovery
    if (status === StreamStatus.Connected && (prevStatus === StreamStatus.Error || prevStatus === StreamStatus.Stalled)) {
      addAlert?.(streamIdentifier, 'Stream recovered', AlertType.Recovery);
    }

    prevStatusRef.current = status;
  }, [status, onStatusChange, addAlert, title, url, audibleAlertsEnabled]);

  const handleToggleMute = () => {
    const willBeMuted = !isMuted;
    setIsMuted(willBeMuted);
    if (!willBeMuted) {
      resumeAudioContext();
      if (mediaRef.current) {
        mediaRef.current.muted = false;
      }
    }
  };
  
  const handleSoloClick = () => {
    if (setSoloCellId && cellId) {
        setSoloCellId(isSolo ? null : cellId);
    }
  };
  
  const handleManualRefresh = () => {
    refreshStream();
  };

  const StatusIndicator = ({ className = '' }: { className?: string }) => {
    let text = status;
    let icon = null;

    switch (status) {
      case StreamStatus.Connected:
      case StreamStatus.Idle:
        return null; 

      case StreamStatus.Connecting:
        icon = <SparklesIcon className="w-3 h-3 animate-led-blink mr-1" />;
        break;
      case StreamStatus.Stalled:
        icon = <AlertTriangleIcon className="w-3 h-3 mr-1" />;
        break;
      case StreamStatus.Error:
        icon = <AlertTriangleIcon className="w-3 h-3 mr-1" />;
        break;
      default:
        return null; 
    }

    const colorClass = 'bg-status-error';

    return (
      <div className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white flex items-center ${colorClass} bg-opacity-90 ${className}`}>
        {icon} {text}
      </div>
    );
  };

  if (isAudioOnly) {
    const effectiveMute = isMuted || masterMute;
    const showOverlays = areControlsVisible ?? false;

    return (
      <div className="w-full h-full flex flex-row items-stretch">
        <video ref={mediaRef} className="hidden" playsInline autoPlay muted />
        {/* VU Meter column on the left */}
        <div className="p-1 flex flex-row bg-black w-16 lg:w-24 flex-shrink-0">
            <VUMeter leftLevel={levelL} rightLevel={levelR} />
        </div>

        {/* Main content area on the right */}
        <div className="relative flex-grow h-full min-w-0">
            {/* Background Layer */}
            {backgroundType === AudioBackgroundType.Video && backgroundVideoUrl ? (
                <video
                    key={backgroundVideoUrl}
                    src={backgroundVideoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            ) : (
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
                ></div>
            )}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Top Name "Enclosure" */}
            <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-10">
              {titleImageUrl ? (
                  <img src={titleImageUrl} alt={title || 'Stream Title'} className="h-8 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
              ) : title ? (
                  <div className="bg-black/60 px-3 py-1 rounded-b-lg text-sm font-semibold text-text-primary truncate">
                      {title}
                  </div>
              ) : null}
            </div>

            {/* Bottom Controls Overlay */}
            <div className={`absolute bottom-0 left-0 w-full p-2 flex items-center justify-between pointer-events-none transition-opacity duration-300 z-10 ${showOverlays ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-1 pointer-events-auto">
                    <button
                        onClick={handleToggleMute}
                        className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                        aria-label={effectiveMute ? 'Unmute' : 'Mute'}
                    >
                        {effectiveMute ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeHighIcon className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleManualRefresh}
                      className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                      aria-label="Refresh Stream"
                    >
                      <RefreshIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="pointer-events-auto">
                  <StatusIndicator />
                </div>
            </div>
        </div>
      </div>
    );
  }

  const effectiveMute = isMuted || masterMute;
  const showOverlays = isHovering;

  return (
    <div 
      className="w-full h-full flex flex-row items-stretch"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="p-1 flex flex-row w-16 lg:w-24 flex-shrink-0">
        <VUMeter leftLevel={levelL} rightLevel={levelR} />
      </div>

      <div className="relative flex-grow h-full min-w-0 bg-black">
        <video ref={mediaRef} className="w-full h-full object-fill" poster={imageUrl} playsInline autoPlay muted crossOrigin="anonymous" />
        
        {/* Center: Title (always visible) */}
        <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none">
          {titleImageUrl ? (
              <img src={titleImageUrl} alt={title || 'Stream Title'} className="h-14 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          ) : title ? (
              <h3 className="bg-black/60 px-4 py-2 rounded-b-lg font-bold text-xl text-text-primary truncate uppercase" title={title}>
                  {title}
              </h3>
          ) : null}
        </div>
        
        {/* Top Controls Overlay: Contains side controls (on hover) */}
        <div className="absolute top-0 left-0 w-full p-2 flex items-start justify-between pointer-events-none">
          {/* Left: Drag handle (on hover) */}
          <div className={`flex-1 flex justify-start transition-opacity duration-300 ${showOverlays ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {dragListeners && !isSolo && (
                <button {...dragAttributes} {...dragListeners} className="cursor-grab text-text-secondary hover:text-white flex-shrink-0 p-1 bg-black/40 hover:bg-black/60 rounded-full">
                    <DragHandleIcon className="w-5 h-5" />
                </button>
            )}
          </div>

          {/* Spacer to allow title to be in its own layer */}
          <div className="flex-1" />

          {/* Right: Edit & Close buttons (on hover) */}
          <div className={`flex-1 flex justify-end items-center gap-1 transition-opacity duration-300 ${showOverlays ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="p-1 rounded-full text-text-secondary bg-black/40 hover:bg-blue-600 hover:text-white transition-colors"
                    aria-label="Edit cell"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-1 rounded-full text-text-secondary bg-black/40 hover:bg-status-error hover:text-white transition-colors"
                aria-label="Remove cell"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Overlay: Mute Button, Status, Solo (on hover) */}
        <div className={`absolute bottom-0 left-0 w-full p-2 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${showOverlays ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
                onClick={handleToggleMute}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label={effectiveMute ? 'Unmute' : 'Mute'}
            >
                {effectiveMute ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeHighIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              aria-label="Refresh Stream"
            >
              <RefreshIcon className="w-6 h-6" />
            </button>
          </div>
          <StatusIndicator />
           <button
                onClick={handleSoloClick}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors pointer-events-auto"
                aria-label={isSolo ? "Minimize" : "Maximize"}
            >
                {isSolo ? <MinimizeIcon className="w-6 h-6" /> : <MaximizeIcon className="w-6 h-6" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
