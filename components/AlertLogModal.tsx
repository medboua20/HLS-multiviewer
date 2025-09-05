import React from 'react';
import type { AlertEntry } from '../types';
import { AlertType } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface AlertLogModalProps {
  alerts: AlertEntry[];
  onClose: () => void;
  onClear: () => void;
}

const AlertLogModal: React.FC<AlertLogModalProps> = ({ alerts, onClose, onClear }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-panel-bg rounded-lg shadow-xl w-full max-w-3xl border border-border-color max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
          <h2 className="text-2xl font-bold text-text-primary">Alert Log</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6">
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`flex items-center p-4 rounded-lg border ${
                  alert.type === AlertType.Error 
                    ? 'bg-red-500/20 border-red-500/40' 
                    : 'bg-green-500/15 border-green-500/30'
                }`}>
                  <div className="flex-shrink-0">
                    {alert.type === AlertType.Error ? 
                      <AlertTriangleIcon className="w-6 h-6 text-red-400" /> : 
                      <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    }
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="text-base font-medium text-text-primary">
                      <span className="font-bold">{alert.streamName}</span> - {alert.message}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-text-secondary">No alerts have been recorded during this session.</p>
            </div>
          )}
        </main>
        
        <footer className="mt-auto p-4 bg-gray-900/50 border-t border-border-color flex justify-between items-center flex-shrink-0">
          <button
            type="button"
            onClick={onClear}
            className="bg-red-800/60 hover:bg-red-700/80 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            disabled={alerts.length === 0}
          >
            Clear Log
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AlertLogModal;
