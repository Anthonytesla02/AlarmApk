export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  isEnabled: boolean;
  repeat: number[]; // 0 = Sun, 1 = Mon, etc.
  isSmart: boolean; // Triggers Gemini motivation
  snoozeInterval: number; // minutes
}

export enum ViewState {
  LIST = 'LIST',
  EDIT = 'EDIT',
  RINGING = 'RINGING',
  AI_SUMMARY = 'AI_SUMMARY'
}

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
