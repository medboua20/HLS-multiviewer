
import React from 'react';
import type { ImageItem } from '../types';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { CloseIcon } from './icons/CloseIcon';
import { EditIcon } from './icons/EditIcon';

interface ImageCellProps {
  item: ImageItem;
  onRemove: () => void;
  onEdit: () => void;
  dragAttributes: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
}

const ImageCell: React.FC<ImageCellProps> = ({ item, onRemove, onEdit, dragAttributes, dragListeners }) => {
  const [isHovering, setIsHovering] = React.useState(false);

  return (
    <div 
      className="relative w-full h-full bg-white rounded-lg shadow-md overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
      <div className={`absolute top-0 left-0 w-full p-2 flex items-center justify-between z-10 pointer-events-none transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 pointer-events-auto truncate">
          {dragListeners && (
            <button {...dragAttributes} {...dragListeners} className="cursor-grab text-text-secondary hover:text-white flex-shrink-0 p-1 bg-black/40 hover:bg-black/60 rounded-full">
              <DragHandleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto flex-shrink-0">
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
      </div>
    </div>
  );
};

export default ImageCell;
