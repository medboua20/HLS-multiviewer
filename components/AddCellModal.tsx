import React, { useState, useEffect } from 'react';
import { CellType, Cell, AudioBackgroundType, ImageItem } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface AddCellModalProps {
  onClose: () => void;
  onSave: (data: { type: CellType; urls: string[]; names: string[]; imageFiles: (File | undefined)[]; titleImageFiles: (File | undefined)[]; backgroundTypes: AudioBackgroundType[]; backgroundVideoFiles: (File | undefined)[]; }) => void;
  cellToEdit: Cell | null;
}

const AddCellModal: React.FC<AddCellModalProps> = ({ onClose, onSave, cellToEdit }) => {
  const isEditMode = !!cellToEdit;
  
  const [cellType, setCellType] = useState<CellType>(CellType.Video);
  const [urls, setUrls] = useState<string[]>(Array(4).fill(''));
  const [streamNames, setStreamNames] = useState<string[]>(Array(4).fill(''));
  const [imageFiles, setImageFiles] = useState<(File | undefined)[]>(new Array(4).fill(undefined));
  const [titleImageFiles, setTitleImageFiles] = useState<(File | undefined)[]>(new Array(4).fill(undefined));
  const [backgroundTypes, setBackgroundTypes] = useState<AudioBackgroundType[]>(Array(4).fill(AudioBackgroundType.Image));
  const [backgroundVideoFiles, setBackgroundVideoFiles] = useState<(File | undefined)[]>(new Array(4).fill(undefined));
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEditMode && cellToEdit) {
      setCellType(cellToEdit.type);
      if (cellToEdit.item.type === CellType.Video) {
        setUrls(cellToEdit.item.urls);
        setStreamNames([cellToEdit.item.name]);
      } else if (cellToEdit.item.type === CellType.Image) {
        setUrls(['']);
        setStreamNames([(cellToEdit.item as ImageItem).name]);
      } else {
        const paddedUrls = [...cellToEdit.item.urls];
        while(paddedUrls.length < 4) paddedUrls.push('');
        setUrls(paddedUrls);

        const paddedNames = [...(cellToEdit.item.streamNames || [])];
        while(paddedNames.length < 4) paddedNames.push('');
        setStreamNames(paddedNames);

        const paddedTypes = [...(cellToEdit.item.backgroundTypes || [])];
        while(paddedTypes.length < 4) paddedTypes.push(AudioBackgroundType.Image);
        setBackgroundTypes(paddedTypes as AudioBackgroundType[]);
      }
      // Reset file inputs for all modes
      setImageFiles(new Array(4).fill(undefined));
      setTitleImageFiles(new Array(4).fill(undefined));
      setBackgroundVideoFiles(new Array(4).fill(undefined));
    } else {
      // Reset form to default for 'Add' mode
      setCellType(CellType.Video);
      setUrls(['']);
      setStreamNames(['']);
      setImageFiles(new Array(4).fill(undefined));
      setTitleImageFiles(new Array(4).fill(undefined));
      setBackgroundTypes(Array(4).fill(AudioBackgroundType.Image));
      setBackgroundVideoFiles(new Array(4).fill(undefined));
    }
  }, [cellToEdit, isEditMode]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as CellType;
    setCellType(newType);

    if (newType === CellType.QuadAudio) {
        setUrls(Array(4).fill(''));
        setStreamNames(Array(4).fill(''));
        setImageFiles(new Array(4).fill(undefined));
        setTitleImageFiles(new Array(4).fill(undefined));
        setBackgroundTypes(Array(4).fill(AudioBackgroundType.Image));
        setBackgroundVideoFiles(new Array(4).fill(undefined));
    } else { // for Video and Image
        setUrls(['']);
        setStreamNames(['']);
        setImageFiles([undefined]);
        setTitleImageFiles([undefined]);
    }
  };
  
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleStreamNameChange = (index: number, value: string) => {
    const newNames = [...streamNames];
    newNames[index] = value;
    setStreamNames(newNames);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newImageFiles = [...imageFiles];
    newImageFiles[index] = file || undefined;
    setImageFiles(newImageFiles);
  };

  const handleTitleFileChange = (index: number, file: File | null) => {
    const newImageFiles = [...titleImageFiles];
    newImageFiles[index] = file || undefined;
    setTitleImageFiles(newImageFiles);
  };
  
  const handleBackgroundTypeChange = (index: number, type: AudioBackgroundType) => {
    const newTypes = [...backgroundTypes];
    newTypes[index] = type;
    setBackgroundTypes(newTypes);
  };

  const handleBackgroundVideoFileChange = (index: number, file: File | null) => {
      const newVideoFiles = [...backgroundVideoFiles];
      newVideoFiles[index] = file || undefined;
      setBackgroundVideoFiles(newVideoFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cellType === CellType.Video && !streamNames[0]?.trim()) {
        setError('Stream Name is required.');
        return;
    }
    if (cellType === CellType.Image && !streamNames[0]?.trim()) {
        setError('Cell Name is required.');
        return;
    }
    const hasImageFile = imageFiles[0];
    if (cellType === CellType.Image && !isEditMode && !hasImageFile) {
        setError('An image or GIF file is required.');
        return;
    }

    const filledUrls = urls.filter(url => url && url.trim() !== '');
    if (cellType === CellType.Video && filledUrls.length !== 1) {
        setError('Video cell requires exactly one HLS URL.');
        return;
    }
     if (cellType === CellType.QuadAudio && filledUrls.length === 0) {
        setError('Quad Audio cell requires at least one HLS URL.');
        return;
    }
    
    onSave({ type: cellType, urls, names: streamNames, imageFiles, titleImageFiles, backgroundTypes, backgroundVideoFiles });
  };
  
  const renderInputs = () => {
    if (cellType === CellType.Video) {
      return (
        <div className="space-y-4">
          <div>
            <label htmlFor="name-0" className="block text-sm font-medium text-text-secondary">Stream Name</label>
            <input
              id="name-0"
              type="text"
              value={streamNames[0] || ''}
              onChange={(e) => handleStreamNameChange(0, e.target.value)}
              placeholder="e.g., Main Program Feed"
              className="mt-1 block w-full bg-cell-bg border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="title-file-0" className="block text-sm font-medium text-text-secondary">Title Image (replaces name)</label>
            <input
              id="title-file-0"
              type="file"
              accept="image/*"
              onChange={(e) => handleTitleFileChange(0, e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div>
            <label htmlFor="url-0" className="block text-sm font-medium text-text-secondary">HLS Stream URL</label>
            <input
              id="url-0"
              type="text"
              value={urls[0] || ''}
              onChange={(e) => handleUrlChange(0, e.target.value)}
              placeholder="https://example.com/stream.m3u8"
              className="mt-1 block w-full bg-cell-bg border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="file-0" className="block text-sm font-medium text-text-secondary">Poster Image (Optional)</label>
            <input
              id="file-0"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(0, e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>
      );
    } else if (cellType === CellType.Image) {
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name-0" className="block text-sm font-medium text-text-secondary">Cell Name</label>
              <input
                id="name-0"
                type="text"
                value={streamNames[0] || ''}
                onChange={(e) => handleStreamNameChange(0, e.target.value)}
                placeholder="e.g., Station Logo"
                className="mt-1 block w-full bg-cell-bg border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="file-0" className="block text-sm font-medium text-text-secondary">Image or GIF File</label>
              <input
                id="file-0"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(0, e.target.files ? e.target.files[0] : null)}
                className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required={!isEditMode}
              />
               {isEditMode && <p className="text-xs text-gray-400 mt-1">Leave blank to keep the existing image.</p>}
            </div>
          </div>
        );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 p-4 bg-gray-900/50 rounded-lg border border-border-color">
              <h4 className="font-semibold text-text-primary border-b border-border-color pb-2">Stream {index + 1}</h4>
               <div>
                <label htmlFor={`name-${index}`} className="block text-xs font-medium text-text-secondary">Stream Name</label>
                <input
                  id={`name-${index}`}
                  type="text"
                  value={streamNames[index] || ''}
                  onChange={(e) => handleStreamNameChange(index, e.target.value)}
                  placeholder="(optional)"
                  className="mt-1 block w-full bg-cell-bg border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
               <div>
                <label htmlFor={`title-file-${index}`} className="block text-xs font-medium text-text-secondary">Title Image (replaces name)</label>
                <input
                  id={`title-file-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTitleFileChange(index, e.target.files ? e.target.files[0] : null)}
                  className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <label htmlFor={`url-${index}`} className="block text-xs font-medium text-text-secondary">Audio Stream URL</label>
                <input
                  id={`url-${index}`}
                  type="text"
                  value={urls[index] || ''}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="(optional)"
                  className="mt-1 block w-full bg-cell-bg border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary">Background Type</label>
                <div className="mt-1 flex items-center space-x-4">
                    <label className="flex items-center text-sm text-text-primary">
                        <input
                            type="radio"
                            name={`bg-type-${index}`}
                            value={AudioBackgroundType.Image}
                            checked={backgroundTypes[index] === AudioBackgroundType.Image}
                            onChange={() => handleBackgroundTypeChange(index, AudioBackgroundType.Image)}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <span className="ml-2">Image</span>
                    </label>
                    <label className="flex items-center text-sm text-text-primary">
                        <input
                            type="radio"
                            name={`bg-type-${index}`}
                            value={AudioBackgroundType.Video}
                            checked={backgroundTypes[index] === AudioBackgroundType.Video}
                            onChange={() => handleBackgroundTypeChange(index, AudioBackgroundType.Video)}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <span className="ml-2">Video</span>
                    </label>
                </div>
              </div>
              {backgroundTypes[index] === AudioBackgroundType.Image ? (
                <div>
                  <label htmlFor={`file-${index}`} className="block text-xs font-medium text-text-secondary">Background Image</label>
                  <input
                    id={`file-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(index, e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor={`bg-video-file-${index}`} className="block text-xs font-medium text-text-secondary">Background Video (loop)</label>
                  <input
                    id={`bg-video-file-${index}`}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleBackgroundVideoFileChange(index, e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-panel-bg rounded-lg shadow-xl w-full max-w-4xl border border-border-color max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
          <h2 className="text-2xl font-bold text-text-primary">{isEditMode ? 'Edit' : 'Add New'} Monitoring Cell</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
                <label htmlFor="cell-type" className="block text-sm font-medium text-text-secondary">Cell Type</label>
                <select
                  id="cell-type"
                  value={cellType}
                  onChange={handleTypeChange}
                  disabled={isEditMode}
                  className="mt-1 block w-full md:w-1/2 bg-cell-bg border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={CellType.Video}>Video Player</option>
                  <option value={CellType.QuadAudio}>Quad Audio Monitor</option>
                  <option value={CellType.Image}>Image/GIF Cell</option>
                </select>
            </div>
            
            <hr className="border-border-color"/>

            {renderInputs()}

            {error && <p className="text-sm text-status-error text-center">{error}</p>}
          </div>

          <div className="mt-auto p-4 bg-gray-900/50 border-t border-border-color flex justify-end space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {isEditMode ? 'Save Changes' : 'Add Cell'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCellModal;