

import React from 'react';
import type { Cell, AlertEntry } from '../types';
import { AlertType } from '../types';
import SortableCell from './SortableCell';

interface GridProps {
  cells: Cell[];
  gridLayout: string;
  removeCell: (id: string) => void;
  onEditCell: (id: string) => void;
  masterMute: boolean;
  soloCellId: string | null;
  setSoloCellId: (id: string | null) => void;
  globalRefreshKey: number;
  addAlert: (streamName: string, message: string, type: AlertType) => void;
  audibleAlertsEnabled: boolean;
}

const Grid: React.FC<GridProps> = ({ cells, gridLayout, removeCell, onEditCell, masterMute, soloCellId, setSoloCellId, globalRefreshKey, addAlert, audibleAlertsEnabled }) => {
  const [cols, rows] = gridLayout.split('x').map(Number);
  const gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  const gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

  const soloCell = soloCellId ? cells.find(c => c.id === soloCellId) : null;

  if (soloCell) {
    return (
      <div className="w-full h-full p-1">
        <SortableCell
            key={soloCell.id}
            cell={soloCell}
            removeCell={removeCell}
            onEditCell={onEditCell}
            masterMute={masterMute}
            isSolo={true}
            setSoloCellId={setSoloCellId}
            globalRefreshKey={globalRefreshKey}
            addAlert={addAlert}
            audibleAlertsEnabled={audibleAlertsEnabled}
        />
      </div>
    );
  }

  return (
    <div
      className="grid gap-2 h-full"
      style={{ gridTemplateColumns, gridTemplateRows }}
    >
      {cells.map(cell => (
        <SortableCell
          key={cell.id}
          cell={cell}
          removeCell={removeCell}
          onEditCell={onEditCell}
          masterMute={masterMute}
          isSolo={false}
          setSoloCellId={setSoloCellId}
          globalRefreshKey={globalRefreshKey}
          addAlert={addAlert}
          audibleAlertsEnabled={audibleAlertsEnabled}
        />
      ))}
    </div>
  );
};

export default Grid;
