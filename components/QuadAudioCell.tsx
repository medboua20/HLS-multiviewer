

import React, { useState, useCallback } from 'react';
import type { QuadAudioItem } from '../types';
import { StreamStatus, AlertType, AudioBackgroundType } from '../types';
import Player from './Player';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { CloseIcon } from './icons/CloseIcon';
import { EditIcon } from './icons/EditIcon';
import { MaximizeIcon } from './icons/MaximizeIcon';
import { MinimizeIcon } from './icons/MinimizeIcon';

interface QuadAudioCellProps {
  cellId: string;
  item: QuadAudioItem;
  masterMute: boolean;
  onRemove: () => void;
  onEdit: () => void;
  dragAttributes: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  isSolo: boolean;
  setSoloCellId: (id: string | null) => void;
  globalRefreshKey: number;
  addAlert: (streamName: string, message: string, type: AlertType) => void;
  audibleAlertsEnabled: boolean;
}

const QuadAudioCell: React.FC<QuadAudioCellProps> = ({
  cellId,
  item,
  masterMute,
  onRemove,
  onEdit,
  dragAttributes,
  dragListeners,
  isSolo,
  setSoloCellId,
  globalRefreshKey,
  addAlert,
  audibleAlertsEnabled
}) => {
  const [statuses, setStatuses] = useState<Record<number, StreamStatus>>({});
  const [isHovering, setIsHovering] = useState(false);

  const handleStatusChange = useCallback((index: number, status: StreamStatus) => {
    setStatuses(prev => ({ ...prev, [index]: status }));
  }, []);

  const getIndividualOutlineClass = (status: StreamStatus | undefined) => {
    switch (status) {
      case StreamStatus.Connecting:
      case StreamStatus.Error:
      case StreamStatus.Stalled:
        return 'border-[8px] border-status-error animate-glow-red';
      default:
        return 'border-transparent';
    }
  };

  const handleSoloClick = () => {
    setSoloCellId(isSolo ? null : cellId);
  }

  return (
    <div 
      className={`relative w-full h-full bg-panel-bg rounded-lg shadow-md overflow-hidden flex flex-col p-2`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
        <header className={`absolute top-0 left-0 w-full p-2 flex items-center justify-between z-10 pointer-events-none transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 pointer-events-auto truncate">
                {dragListeners && !isSolo && (
                    <button {...dragAttributes} {...dragListeners} className="cursor-grab text-text-secondary hover:text-white flex-shrink-0 p-1 bg-black/40 hover:bg-black/60 rounded-full">
                        <DragHandleIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            <div className="flex items-center gap-2 pointer-events-auto flex-shrink-0">
                <button
                    onClick={handleSoloClick}
                    className="p-1 rounded-full text-text-secondary hover:bg-indigo-600 hover:text-white transition-colors bg-black/40"
                    aria-label={isSolo ? "Minimize cell" : "Maximize cell"}
                >
                    {isSolo ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
                </button>
                <button
                    onClick={onEdit}
                    className="p-1 rounded-full text-text-secondary hover:bg-blue-600 hover:text-white transition-colors bg-black/40"
                    aria-label="Edit cell"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={onRemove}
                    className="p-1 rounded-full text-text-secondary hover:bg-status-error hover:text-white transition-colors bg-black/40"
                    aria-label="Remove cell"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        </header>
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2">
            {Array.from({ length: 4 }).map((_, index) => {
                const url = item.urls[index];
                const imageUrl = item.imageUrls?.[index];
                const streamName = item.streamNames?.[index] || item.name;
                const titleImageUrl = item.titleImageUrls?.[index];
                const backgroundType = item.backgroundTypes?.[index] || AudioBackgroundType.Image;
                const backgroundVideoUrl = item.backgroundVideoUrls?.[index];
                const signalLossImageUrl = item.signalLossImageUrls?.[index];
                
                const status = statuses[index];
                const outlineClass = getIndividualOutlineClass(status);
                
                return (
                  <div
                    key={`${cellId}-${index}`}
                    className={`relative bg-cell-bg rounded-md flex flex-col justify-center overflow-hidden border ${outlineClass}`}
                  >
                    {url ? (
                      <Player
                        url={url}
                        isAudioOnly={true}
                        masterMute={masterMute}
                        onStatusChange={(status) => handleStatusChange(index, status)}
                        areControlsVisible={isHovering}
                        title={streamName}
                        titleImageUrl={titleImageUrl}
                        imageUrl={imageUrl}
                        backgroundType={backgroundType}
                        backgroundVideoUrl={backgroundVideoUrl}
                        signalLossImageUrl={signalLossImageUrl}
                        addAlert={addAlert}
                        audibleAlertsEnabled={audibleAlertsEnabled}
                        globalRefreshKey={globalRefreshKey}
                      />
                    ) : (
                      <div className="flex-grow flex items-center justify-center">
                        <span className="text-text-secondary text-sm opacity-60">No Stream</span>
                      </div>
                    )}
                  </div>
                );
            })}
        </div>
    </div>
  );
};

export default QuadAudioCell;