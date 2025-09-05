
import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { CellType, AlertType, AudioBackgroundType } from './types';
import type { Cell, GridConfiguration, CellItem, AlertEntry, QuadAudioItem, VideoItem, ImageItem } from './types';
import Grid from './components/Grid';
import AddCellModal from './components/AddCellModal';
import AlertLogModal from './components/AlertLogModal';
import { loadConfiguration, saveConfiguration } from './services/storageService';
import { playAlertSound } from './services/audioAlertService';
import { PlusCircleIcon } from './components/icons/PlusCircleIcon';
import ControlPanel from './components/ControlPanel';
import { defaultConfig } from './config/defaultConfig';

const App: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [gridLayout, setGridLayout] = useState<string>('2x2');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [cellToEdit, setCellToEdit] = useState<Cell | null>(null);
  const [masterMute, setMasterMute] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const [soloCellId, setSoloCellId] = useState<string | null>(null);
  const [globalRefreshKey, setGlobalRefreshKey] = useState<number>(0);

  // Alerting states
  const [audibleAlertsEnabled, setAudibleAlertsEnabled] = useState<boolean>(true);
  const [alertLog, setAlertLog] = useState<AlertEntry[]>([]);
  const [isAlertLogModalOpen, setIsAlertLogModalOpen] = useState<boolean>(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState<boolean>(false);

  // Email alerting states
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);


  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    let savedConfig = loadConfiguration();
    if (savedConfig) {
      setCells(savedConfig.cells);
      setGridLayout(savedConfig.gridLayout || '2x2');
      setEmailAddress(savedConfig.emailSettings?.address || '');
      setEmailAlertsEnabled(savedConfig.emailSettings?.enabled || false);
    } else {
      setCells(defaultConfig.cells);
      setGridLayout(defaultConfig.gridLayout);
    }
  }, []);

  const sendEmailAlert = useCallback(async (to: string, subject: string, body: string) => {
    if (isSendingEmail) return;
    setIsSendingEmail(true);
    
    const apiUrl = "https://wz4k8z172d.execute-api.eu-central-1.amazonaws.com/default/Live-monitor-pro-emails-sender";

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, body }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        console.log('Email alert sent successfully.');
    } catch (error) {
        console.error('Error sending email alert:', error);
        // Do not alert the user here as it could be spammy
    } finally {
        setIsSendingEmail(false);
    }
  }, [isSendingEmail]);
  
  const addAlert = useCallback((streamName: string, message: string, type: AlertType) => {
    setAlertLog(prevLog => [
      { id: Date.now(), timestamp: new Date(), streamName, message, type },
      ...prevLog,
    ]);
    if (!isAlertLogModalOpen) {
        setHasUnreadAlerts(true);
    }
    if (type === AlertType.Error) {
        if (audibleAlertsEnabled) playAlertSound();
        if (emailAlertsEnabled && emailAddress) {
            sendEmailAlert(
                emailAddress,
                `[MultiViewer Alert] Stream: ${streamName}`,
                `An alert was triggered for stream: "${streamName}"\n\nMessage: ${message}\n\nTimestamp: ${new Date().toLocaleString()}`
            );
        }
    }
  }, [audibleAlertsEnabled, isAlertLogModalOpen, emailAlertsEnabled, emailAddress, sendEmailAlert]);

  const handleOpenAlertLog = () => {
    setIsAlertLogModalOpen(true);
    setHasUnreadAlerts(false);
  };
  
  const handleCloseAlertLog = () => {
    setIsAlertLogModalOpen(false);
  };

  const handleClearAlertLog = () => {
    setAlertLog([]);
  };

  const handleSaveConfiguration = useCallback(() => {
    try {
      const config: GridConfiguration = { 
        cells, 
        gridLayout, 
        emailSettings: { address: emailAddress, enabled: emailAlertsEnabled }
      };
      saveConfiguration(config);
      alert('Configuration saved to browser!');
    } catch (error) {
        console.error("Failed to save configuration:", error);
        alert("Failed to save configuration. It is likely too large to be stored in the browser.");
    }
  }, [cells, gridLayout, emailAddress, emailAlertsEnabled]);

  const handleResetGrid = useCallback(() => {
    setCells(defaultConfig.cells);
    setGridLayout(defaultConfig.gridLayout);
    setEmailAddress(defaultConfig.emailSettings?.address || '');
    setEmailAlertsEnabled(defaultConfig.emailSettings?.enabled || false);
    setCellToEdit(null);
    setSoloCellId(null);
    try {
      saveConfiguration(defaultConfig);
    } catch(error) {
        console.error("Could not save default configuration", error);
    }
  }, []);

  const handleRefreshAllStreams = useCallback(() => {
    setGlobalRefreshKey(k => k + 1);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCells((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCellToEdit(null);
  };

  const openAddModal = () => {
    setCellToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (id: string) => {
    const cell = cells.find(c => c.id === id);
    if (cell) {
      setCellToEdit(cell);
      setIsModalOpen(true);
    }
  };

  const addCell = async (type: CellType, urls: string[], names: string[], imageFiles: (File | undefined)[], titleImageFiles: (File | undefined)[], backgroundTypes: AudioBackgroundType[], backgroundVideoFiles: (File | undefined)[]) => {
    const imagePromises = imageFiles.map(file => file ? fileToDataUrl(file) : Promise.resolve(undefined));
    const titleImagePromises = titleImageFiles.map(file => file ? fileToDataUrl(file) : Promise.resolve(undefined));
    const backgroundVideoPromises = backgroundVideoFiles.map(file => file ? fileToDataUrl(file) : Promise.resolve(undefined));
    
    const dataUrls = await Promise.all(imagePromises);
    const titleDataUrls = await Promise.all(titleImagePromises);
    const backgroundVideoDataUrls = await Promise.all(backgroundVideoPromises);

    let item: CellItem;
    if (type === CellType.Video) {
      item = { 
        type, 
        urls: [urls[0]], 
        name: names[0], 
        imageUrl: dataUrls[0], 
        titleImageUrl: titleDataUrls[0],
      };
    } else if (type === CellType.Image) {
        item = {
          type,
          name: names[0],
          imageUrl: dataUrls[0] || '', // Needs a valid URL
        };
    } else {
      item = { 
        type, 
        urls, 
        name: names.find(n => n && n.trim()) || 'Quad Audio', 
        imageUrls: dataUrls,
        streamNames: names,
        titleImageUrls: titleDataUrls,
        backgroundTypes,
        backgroundVideoUrls: backgroundVideoDataUrls,
      };
    }
    
    const newCell: Cell = {
      id: `cell-${Date.now()}`,
      type,
      item,
    };
    setCells((prev) => [...prev, newCell]);
    handleModalClose();
  };

  const updateCell = async (originalCell: Cell, type: CellType, urls: string[], names: string[], imageFiles: (File | undefined)[], titleImageFiles: (File | undefined)[], backgroundTypes: AudioBackgroundType[], backgroundVideoFiles: (File | undefined)[]) => {
      const getExistingUrls = (prop: 'imageUrls' | 'titleImageUrls' | 'backgroundVideoUrls'): (string | undefined)[] => {
          if (originalCell.item.type === CellType.Video) {
              if (prop === 'imageUrls') return [originalCell.item.imageUrl];
              if (prop === 'titleImageUrls') return [originalCell.item.titleImageUrl];
              return [];
          }
          if (originalCell.item.type === CellType.Image) {
             if (prop === 'imageUrls') return [(originalCell.item as ImageItem).imageUrl];
             return [];
          }
          if (prop === 'imageUrls' || prop === 'titleImageUrls' || prop === 'backgroundVideoUrls') {
             return (originalCell.item as QuadAudioItem)[prop] || [];
          }
          return [];
      };

      const existingImageUrls = getExistingUrls('imageUrls');
      const existingTitleUrls = getExistingUrls('titleImageUrls');
      const existingBackgroundVideoUrls = getExistingUrls('backgroundVideoUrls');

      const imagePromises = imageFiles.map((file, i) => file ? fileToDataUrl(file) : Promise.resolve(existingImageUrls[i]));
      const titleImagePromises = titleImageFiles.map((file, i) => file ? fileToDataUrl(file) : Promise.resolve(existingTitleUrls[i]));
      const backgroundVideoPromises = backgroundVideoFiles.map((file, i) => file ? fileToDataUrl(file) : Promise.resolve(existingBackgroundVideoUrls[i]));

      const dataUrls = await Promise.all(imagePromises);
      const titleDataUrls = await Promise.all(titleImagePromises);
      const backgroundVideoDataUrls = await Promise.all(backgroundVideoPromises);

      let updatedItem: CellItem;
      if (type === CellType.Video) {
          updatedItem = { type, urls: [urls[0]], name: names[0], imageUrl: dataUrls[0], titleImageUrl: titleDataUrls[0] };
      } else if (type === CellType.Image) {
          updatedItem = { type, name: names[0], imageUrl: dataUrls[0] || (originalCell.item as ImageItem).imageUrl };
      } else {
          updatedItem = { type, urls, name: names.find(n => n && n.trim()) || 'Quad Audio', imageUrls: dataUrls, streamNames: names, titleImageUrls: titleDataUrls, backgroundTypes, backgroundVideoUrls: backgroundVideoDataUrls };
      }

      setCells(prev => prev.map(cell => cell.id === originalCell.id ? { ...cell, type, item: updatedItem } : cell));
      handleModalClose();
  };
  
  const handleSaveCell = (data: { type: CellType; urls: string[]; names: string[]; imageFiles: (File | undefined)[]; titleImageFiles: (File | undefined)[]; backgroundTypes: AudioBackgroundType[]; backgroundVideoFiles: (File | undefined)[]; }) => {
      if (cellToEdit) {
          updateCell(cellToEdit, data.type, data.urls, data.names, data.imageFiles, data.titleImageFiles, data.backgroundTypes, data.backgroundVideoFiles);
      } else {
          addCell(data.type, data.urls, data.names, data.imageFiles, data.titleImageFiles, data.backgroundTypes, data.backgroundVideoFiles);
      }
  };


  const removeCell = (id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id));
    if (soloCellId === id) {
      setSoloCellId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-brand-bg font-sans text-text-primary">
      {!isFullscreen && (
        <ControlPanel
          gridLayout={gridLayout}
          setGridLayout={setGridLayout}
          masterMute={masterMute}
          setMasterMute={setMasterMute}
          onSave={handleSaveConfiguration}
          onReset={handleResetGrid}
          onAddCell={openAddModal}
          onRefreshAll={handleRefreshAllStreams}
          audibleAlertsEnabled={audibleAlertsEnabled}
          setAudibleAlertsEnabled={setAudibleAlertsEnabled}
          onOpenAlertLog={handleOpenAlertLog}
          hasUnreadAlerts={hasUnreadAlerts}
          isFullscreen={isFullscreen}
          emailAddress={emailAddress}
          setEmailAddress={setEmailAddress}
          emailAlertsEnabled={emailAlertsEnabled}
          setEmailAlertsEnabled={setEmailAlertsEnabled}
        />
      )}
      <main className="flex-grow p-2 bg-border-color overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cells.map(c => c.id)} strategy={rectSortingStrategy}>
            {cells.length > 0 ? (
              <Grid
                cells={cells}
                gridLayout={gridLayout}
                removeCell={removeCell}
                onEditCell={openEditModal}
                masterMute={masterMute}
                soloCellId={soloCellId}
                setSoloCellId={setSoloCellId}
                globalRefreshKey={globalRefreshKey}
                addAlert={addAlert}
                audibleAlertsEnabled={audibleAlertsEnabled}
              />
            ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed border-border-color rounded-lg">
                <button
                  onClick={openAddModal}
                  className="flex flex-col items-center justify-center text-text-secondary hover:text-text-primary transition-colors duration-300 ease-in-out"
                >
                  <PlusCircleIcon className="w-24 h-24" />
                  <span className="mt-4 text-2xl font-semibold">Add a Monitoring Cell</span>
                  <span className="text-lg">Click the 'Add' button in the control panel to get started</span>
                </button>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </main>
      
      {isModalOpen && <AddCellModal onClose={handleModalClose} onSave={handleSaveCell} cellToEdit={cellToEdit} />}
      {isAlertLogModalOpen && <AlertLogModal alerts={alertLog} onClose={handleCloseAlertLog} onClear={handleClearAlertLog} />}
    </div>
  );
};

export default App;
