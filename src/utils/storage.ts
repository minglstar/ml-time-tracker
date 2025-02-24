import { TimerRecord, Project } from '../types/types';

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
    const result = (await chrome.storage.local.get('timerState')) as { timerState?: TimerState };
    return result.timerState ?? null;
  },

  async clearTimerState(): Promise<void> {
    await chrome.storage.local.remove('timerState');
  },

  async saveTimerRecords(records: TimerRecord[]): Promise<void> {
    await chrome.storage.local.set({ timerRecords: records });
  },

  async getTimerRecords(): Promise<TimerRecord[]> {
    const result = (await chrome.storage.local.get('timerRecords')) as {
      timerRecords?: TimerRecord[];
    };
    return result.timerRecords ?? [];
  },

  async saveProjects(projects: Project[]): Promise<void> {
    await chrome.storage.local.set({ projects: projects });
  },

  async getProjects(): Promise<Project[]> {
    const result = (await chrome.storage.local.get('projects')) as { projects?: Project[] };
    return result.projects ?? [];
  },
};
