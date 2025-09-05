import type { GridConfiguration } from '../types';

const STORAGE_KEY = 'liveMonitorProConfig';

export const saveConfiguration = (config: GridConfiguration): void => {
  try {
    const serializedState = JSON.stringify(config);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Could not save configuration to localStorage", error);
    throw error;
  }
};

export const loadConfiguration = (): GridConfiguration | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load configuration from localStorage", error);
    return null;
  }
};