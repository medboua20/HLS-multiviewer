
export enum StreamStatus {
  Idle = 'IDLE',
  Connecting = 'CONNECTING',
  Connected = 'CONNECTED',
  Error = 'ERROR',
  Stalled = 'STALLED',
}

export enum AlertType {
  Error = 'ERROR',
  Recovery = 'RECOVERY',
}

export interface AlertEntry {
  id: number;
  timestamp: Date;
  streamName: string;
  message: string;
  type: AlertType;
}

export enum CellType {
  Video = 'VIDEO',
  QuadAudio = 'QUAD_AUDIO',
  Image = 'IMAGE',
}

export enum AudioBackgroundType {
  Image = 'IMAGE',
  Video = 'VIDEO',
}

export interface VideoItem {
  type: CellType.Video;
  urls: string[];
  name: string;
  imageUrl?: string;
  titleImageUrl?: string;
  // FIX: Added optional signalLossImageUrl property.
  signalLossImageUrl?: string;
}

export interface QuadAudioItem {
  type: CellType.QuadAudio;
  urls: string[];
  name: string;
  imageUrls?: (string | undefined)[];
  streamNames?: (string | undefined)[];
  titleImageUrls?: (string | undefined)[];
  backgroundTypes?: (AudioBackgroundType | undefined)[];
  backgroundVideoUrls?: (string | undefined)[];
  // FIX: Added optional signalLossImageUrls property.
  signalLossImageUrls?: (string | undefined)[];
}

export interface ImageItem {
  type: CellType.Image;
  name: string;
  imageUrl: string;
}

export type CellItem = VideoItem | QuadAudioItem | ImageItem;

export interface Cell {
  id: string;
  type: CellType;
  item: CellItem;
}

export interface GridConfiguration {
  cells: Cell[];
  gridLayout: string; // e.g., "2x2", "4x3"
  emailSettings?: {
    address: string;
    enabled: boolean;
  };
}
