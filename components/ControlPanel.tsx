
import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import SettingsModal from './SettingsModal';
import { VolumeOffIcon } from './icons/VolumeOffIcon';
import { VolumeHighIcon } from './icons/VolumeHighIcon';
import { MaximizeIcon } from './icons/MaximizeIcon';
import { MinimizeIcon } from './icons/MinimizeIcon';
import { BellIcon } from './icons/BellIcon';
import { MailIcon } from './icons/MailIcon';

interface ControlPanelProps {
  gridLayout: string;
  setGridLayout: (layout: string) => void;
  masterMute: boolean;
  setMasterMute: (muted: boolean) => void;
  onSave: () => void;
  onReset: () => void;
  onAddCell: () => void;
  onRefreshAll: () => void;
  audibleAlertsEnabled: boolean;
  setAudibleAlertsEnabled: (enabled: boolean) => void;
  onOpenAlertLog: () => void;
  hasUnreadAlerts: boolean;
  isFullscreen: boolean;
  emailAddress: string;
  setEmailAddress: (email: string) => void;
  emailAlertsEnabled: boolean;
  setEmailAlertsEnabled: (enabled: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  gridLayout,
  setGridLayout,
  masterMute,
  setMasterMute,
  onSave,
  onReset,
  onAddCell,
  onRefreshAll,
  audibleAlertsEnabled,
  setAudibleAlertsEnabled,
  onOpenAlertLog,
  hasUnreadAlerts,
  isFullscreen,
  emailAddress,
  setEmailAddress,
  emailAlertsEnabled,
  setEmailAlertsEnabled,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmailInputVisible, setIsEmailInputVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const emailPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (emailPopupRef.current && !emailPopupRef.current.contains(event.target as Node)) {
            setIsEmailInputVisible(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emailPopupRef]);

  const validateEmail = (email: string) => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmailAddress(newEmail);
    validateEmail(newEmail);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const ActionButton: React.FC<{onClick?: () => void, children: React.ReactNode, className?: string, title: string}> = ({onClick, children, className, title}) => (
    <button
      onClick={onClick}
      title={title}
      className={`relative bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center transition-colors ${className}`}
    >
      {children}
    </button>
  );

  return (
    <>
      <header className="bg-panel-bg p-2 flex items-center justify-between border-b-2 border-border-color shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-text-primary">STREAMING SITE WEB </h1>
          <button
            onClick={onAddCell}
            title="Add Cell"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg flex items-center transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <ActionButton onClick={onRefreshAll} title="Refresh All Streams" className="bg-yellow-500 hover:bg-yellow-600">
            <RefreshIcon className="w-5 h-5" />
          </ActionButton>

          <div className="w-px h-6 bg-border-color mx-2"></div>
          
          <ActionButton onClick={onOpenAlertLog} title="Alert Log" className="relative">
            <BellIcon className="w-5 h-5" />
            {hasUnreadAlerts && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-status-error border-2 border-panel-bg animate-pulse"></span>
            )}
          </ActionButton>

          <ActionButton 
            onClick={() => setAudibleAlertsEnabled(!audibleAlertsEnabled)} 
            title={audibleAlertsEnabled ? "Disable audible alerts" : "Enable audible alerts"}
            className={audibleAlertsEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
          >
            {audibleAlertsEnabled ? <VolumeHighIcon className="w-5 h-5" /> : <VolumeOffIcon className="w-5 h-5" />}
          </ActionButton>

           <div className="relative" ref={emailPopupRef}>
            <ActionButton 
              onClick={() => setIsEmailInputVisible(!isEmailInputVisible)}
              title="Email Alerts"
              className={emailAlertsEnabled ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <MailIcon className="w-5 h-5" />
              {emailAlertsEnabled && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-panel-bg"></span>}
            </ActionButton>
            {isEmailInputVisible && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-panel-bg border border-border-color rounded-lg shadow-lg p-4 z-20 animate-fade-in">
                <h4 className="font-semibold text-text-primary mb-2">Email Alert Settings</h4>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="email-toggle" className="text-sm text-text-secondary">Enable Email Alerts</label>
                  <input 
                    type="checkbox" 
                    id="email-toggle"
                    checked={emailAlertsEnabled}
                    onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                    className="h-5 w-5 text-purple-600 bg-cell-bg border-border-color rounded focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="email-address" className="block text-sm text-text-secondary mb-1">Recipient Email</label>
                  <input 
                    type="email" 
                    id="email-address"
                    value={emailAddress}
                    onChange={handleEmailChange}
                    onBlur={() => validateEmail(emailAddress)}
                    placeholder="your.email@example.com"
                    className={`w-full bg-cell-bg border ${emailError ? 'border-status-error' : 'border-border-color'} rounded-md py-1.5 px-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {emailError && <p className="text-xs text-status-error mt-1">{emailError}</p>}
                </div>
              </div>
            )}
          </div>

          <ActionButton onClick={() => setIsSettingsOpen(true)} title="Settings">
            <SettingsIcon className="w-5 h-5" />
          </ActionButton>

          <div className="w-px h-6 bg-border-color mx-2"></div>

          <ActionButton onClick={toggleFullScreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullscreen ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
          </ActionButton>
          
          <ActionButton
            onClick={() => setMasterMute(!masterMute)}
            title="Master Mute"
            className={masterMute ? 'bg-status-error hover:bg-red-600' : ''}
          >
            {masterMute ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeHighIcon className="w-5 h-5" />}
            <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-panel-bg ${masterMute ? 'bg-red-400 animate-led-blink' : 'bg-green-400'}`}></span>
          </ActionButton>
        </div>
      </header>

      {isSettingsOpen && (
        <SettingsModal 
            onClose={() => setIsSettingsOpen(false)}
            gridLayout={gridLayout}
            setGridLayout={setGridLayout}
            onSave={onSave}
            onReset={onReset}
        />
      )}
    </>
  );
};

export default ControlPanel;
