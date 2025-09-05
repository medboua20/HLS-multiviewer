

import React, { useState } from 'react';
import type { VideoItem } from '../types';
import { StreamStatus, AlertType } from '../types';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import Player from './Player';

interface VideoCellProps {
  cellId: string;
  item: VideoItem;
  onRemove: () => void;
  onEdit: () => void;
  dragAttributes: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  masterMute: boolean;
  isSolo: boolean;
  setSoloCellId: (id: string | null) => void;
  globalRefreshKey: number;
  addAlert: (streamName: string, message: string, type: AlertType) => void;
  audibleAlertsEnabled: boolean;
}

const VideoCell: React.FC<VideoCellProps> = ({
  cellId,
  item,
  onRemove,
  onEdit,
  dragAttributes,
  dragListeners,
  masterMute,
  isSolo,
  setSoloCellId,
  globalRefreshKey,
  addAlert,
  audibleAlertsEnabled
}) => {
  const [status, setStatus] = useState<StreamStatus>(StreamStatus.Idle);

  const getBorderClass = () => {
    switch (status) {
      case StreamStatus.Connecting:
      case StreamStatus.Error:
      case StreamStatus.Stalled:
        return 'border-[12px] border-status-error animate-glow-red';
      default:
        return 'border-2 border-border-color';
    }
  };

  return (
    <div className={`w-full h-full bg-black rounded-lg overflow-hidden shadow-md ${getBorderClass()}`}>
      <Player
        cellId={cellId}
        url={item.urls[0]}
        isAudioOnly={false}
        title={item.name}
        titleImageUrl={item.titleImageUrl}
        onRemove={onRemove}
        onEdit={onEdit}
        dragAttributes={dragAttributes}
        dragListeners={dragListeners}
        imageUrl={item.imageUrl}
        signalLossImageUrl={item.signalLossImageUrl}
        masterMute={masterMute}
        isSolo={isSolo}
        setSoloCellId={setSoloCellId}
        globalRefreshKey={globalRefreshKey}
        onStatusChange={setStatus}
        addAlert={addAlert}
        audibleAlertsEnabled={audibleAlertsEnabled}
      />
    </div>
  );
};

export default VideoCell;