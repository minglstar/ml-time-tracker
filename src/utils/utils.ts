import { TimerRecord } from '../types/types';

export const formatTime = (time: number): string => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const groupRecordsByDate = (records: TimerRecord[]): { [key: string]: TimerRecord[] } => {
  const groups: { [key: string]: TimerRecord[] } = {};
  records.forEach(record => {
    if (!groups[record.date]) {
      groups[record.date] = [];
    }
    groups[record.date].push(record);
  });
  return groups;
};