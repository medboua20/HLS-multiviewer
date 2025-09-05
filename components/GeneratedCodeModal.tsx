
import React, { useState, useCallback } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { CopyIcon } from './icons/CopyIcon';

interface GeneratedCodeModalProps {
  code: string;
  onClose: () => void;
}

const GeneratedCodeModal: React.FC<GeneratedCodeModalProps> = ({ code, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-panel-bg rounded-lg shadow-xl w-full max-w-4xl border border-border-color max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
          <h2 className="text-2xl font-bold text-text-primary">Generated Configuration Code</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6 flex-grow overflow-y-auto">
            <p className="text-text-secondary mb-4">
              To make this your default configuration, copy the code below and replace the contents of the 
              <code className="bg-gray-900 text-amber-300 px-1 py-0.5 rounded-md text-sm mx-1">config/defaultConfig.ts</code> file.
            </p>
            <div className="relative bg-gray-900 rounded-lg">
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 bg-cell-bg hover:bg-gray-600 text-text-secondary font-semibold py-1 px-3 rounded-lg transition-colors text-sm flex items-center"
                >
                    <CopyIcon className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="p-4 text-text-primary text-sm whitespace-pre-wrap break-all overflow-x-auto">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
        
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

export default GeneratedCodeModal;
