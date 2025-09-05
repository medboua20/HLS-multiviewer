

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Cell } from '../types';
import { CellType, AlertType } from '../types';
import VideoCell from './VideoCell';
import QuadAudioCell from './QuadAudioCell';
import ImageCell from './ImageCell';

interface SortableCellProps {
  cell: Cell;
  removeCell: (id: string) => void;
  onEditCell: (id: string) => void;
  masterMute: boolean;
  isSolo: boolean;
  setSoloCellId: (id: string | null) => void;
  globalRefreshKey: number;
  addAlert: (streamName: string, message: string, type: AlertType) => void;
  audibleAlertsEnabled: boolean;
}

const SortableCell: React.FC<SortableCellProps> = ({ cell, removeCell, onEditCell, masterMute, isSolo, setSoloCellId, globalRefreshKey, addAlert, audibleAlertsEnabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cell.id,
    disabled: isSolo, // Disable sorting when in solo mode
    resizeObserverConfig: {
        disabled: true,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const renderCell = () => {
    switch (cell.item.type) {
        case CellType.Video:
            return <VideoCell
                cellId={cell.id}
                item={cell.item}
                onRemove={() => removeCell(cell.id)}
                onEdit={() => onEditCell(cell.id)}
                dragAttributes={attributes}
                dragListeners={listeners}
                masterMute={masterMute}
                isSolo={isSolo}
                setSoloCellId={setSoloCellId}
                globalRefreshKey={globalRefreshKey}
                addAlert={addAlert}
                audibleAlertsEnabled={audibleAlertsEnabled}
                />;
        case CellType.QuadAudio:
            return <QuadAudioCell
                cellId={cell.id}
                item={cell.item}
                masterMute={masterMute}
                onRemove={() => removeCell(cell.id)}
                onEdit={() => onEditCell(cell.id)}
                dragAttributes={attributes}
                dragListeners={listeners}
                isSolo={isSolo}
                setSoloCellId={setSoloCellId}
                globalRefreshKey={globalRefreshKey}
                addAlert={addAlert}
                audibleAlertsEnabled={audibleAlertsEnabled}
                />;
        case CellType.Image:
            return <ImageCell
                item={cell.item}
                onRemove={() => removeCell(cell.id)}
                onEdit={() => onEditCell(cell.id)}
                dragAttributes={attributes}
                dragListeners={listeners}
                />;
        default:
            return null;
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={`min-h-0 h-full ${isDragging ? 'shadow-2xl' : ''}`}>
      {renderCell()}
    </div>
  );
};

export default SortableCell;