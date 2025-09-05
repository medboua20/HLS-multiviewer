import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { SaveIcon } from './icons/SaveIcon';
import { ResetIcon } from './icons/ResetIcon';

interface SettingsModalProps {
  gridLayout: string;
  setGridLayout: (layout: string) => void;
  onSave: () => void;
  onReset: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  gridLayout,
  setGridLayout,
  onSave,
  onReset,
  onClose,
}) => {
  const handleGridLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGridLayout(e.target.value);
  };
  
  const handleResetClick = () => {
    if (window.confirm('Are you sure you want to reset the grid? Your current configuration will be replaced with the default one.')) {
        onReset();
        onClose();
    }
  };
  
  const Section: React.FC<{title: string; children: React.ReactNode; description?: string}> = ({title, description, children}) => (
    <div className="border-b border-border-color pb-6 last:border-b-0 last:pb-0">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        <div className="mt-4">{children}</div>
    </div>
  );
  
  const ActionButton: React.FC<{onClick?: () => void; children: React.ReactNode; className?: string; title: string;}> = ({onClick, children, className, title}) => (
    <button
      onClick={onClick}
      title={title}
      className={`w-full flex items-center justify-center bg-cell-bg hover:bg-gray-600/70 border border-border-color text-text-primary font-semibold py-2 px-4 rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );

  const availableLayouts = ["1x1", "2x2", "3x3", "4x3", "4x4", "5x5", "6x6"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-panel-bg rounded-lg shadow-xl w-full max-w-2xl border border-border-color max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary">Application Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-6 space-y-6">
            <Section title="Grid Layout">
                <div className="flex items-center space-x-2 max-w-xs">
                    <label htmlFor="grid-layout-modal" className="text-sm font-medium text-text-secondary">Grid dimensions:</label>
                    <select
                        id="grid-layout-modal"
                        value={gridLayout}
                        onChange={handleGridLayoutChange}
                        className="bg-cell-bg border border-border-color rounded-md px-2 py-1 text-text-primary focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        {availableLayouts.map(layout => (
                          <option key={layout} value={layout}>{layout}</option>
                        ))}
                    </select>
                </div>
            </Section>

            <Section title="Configuration Management">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ActionButton onClick={onSave} title="Save Config (in browser)">
                        <SaveIcon className="w-5 h-5 mr-3 text-green-400" />
                        <span>Save to Browser</span>
                    </ActionButton>
                </div>
            </Section>

            <Section title="About">
              <p className="text-sm text-text-primary">Created by: <span className="font-semibold">Hicham Ibnoukhaldoun</span></p>
            </Section>

            <Section title="Danger Zone">
                 <ActionButton onClick={handleResetClick} title="Reset Grid" className="bg-red-900/40 hover:bg-red-800/50 border-red-500/50 hover:border-red-500/80">
                    <ResetIcon className="w-5 h-5 mr-3 text-red-400" />
                    <span>Reset Grid Layout</span>
                </ActionButton>
            </Section>
        </main>
        
        <footer className="mt-auto p-4 bg-gray-900/50 border-t border-border-color flex justify-end space-x-3 flex-shrink-0">
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

export default SettingsModal;