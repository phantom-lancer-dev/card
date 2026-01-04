export interface CardData {
  id: string;
  name: string | null;
  company: string | null;
  phone: string[]; // Changed to array
  email: string[]; // Changed to array
  website: string | null;
  description: string | null;
  tags: string[];
  notes: string;
  nickname: string | null;
  imageUri: string;
  createdAt: string;
  processedAt: string | null;
  lastSyncedAt: string | null;
  isSyncing?: boolean;
}

export interface ExtractedData {
  name: string | null;
  company: string | null;
  phone: string[];
  email: string[];
  website: string | null;
  description: string | null;
  tags: string[];
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}