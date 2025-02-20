import { TimerRecord } from '../types/types';

export interface TimerState {
    isRunning: boolean;
    time: number;
    lastUpdated?: number;
}

export const storageUtils = {
    async saveTimerState(state: TimerState): Promise<void> {
        await chrome.storage.local.set({ timerState: state });
    },

    async getTimerState(): Promise<TimerState | null> {
        const result = await chrome.storage.local.get('timerState');
        return result.timerState || null;
    },

    async clearTimerState(): Promise<void> {
        await chrome.storage.local.remove('timerState');
    },

    async saveTimerRecords(records: TimerRecord[]): Promise<void> {
        await chrome.storage.local.set({ timerRecords: records });
    },

    async getTimerRecords(): Promise<TimerRecord[]> {
        const result = await chrome.storage.local.get('timerRecords');
        return result.timerRecords || [];
    }
};