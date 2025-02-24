import { create } from 'zustand';
import { TimerState } from '../types/types';
import { storageUtils } from '../utils/storage';

interface TimerStore {
  // 计时器状态
  isRunning: boolean;
  time: number;
  startTime: number | null;
  intervalId: NodeJS.Timeout | null;

  // 操作方法
  startStop: () => Promise<boolean>;
  reset: () => Promise<void>;
  setTime: (time: number) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // 初始状态
  isRunning: false,
  time: 0,
  startTime: null,
  intervalId: null,

  // 计时器控制
  startStop: async () => {
    const { isRunning, time } = get();
    const newIsRunning = !isRunning;
    const newStartTime = newIsRunning ? Date.now() : null;

    set({ isRunning: newIsRunning, startTime: newStartTime });

    // 启动或停止计时器
    if (newIsRunning) {
      const intervalId = setInterval(() => {
        const { startTime } = get();
        if (startTime) {
          const currentTime = Math.floor((Date.now() - startTime) / 1000);
          set({ time: currentTime });
        }
      }, 1000);
      set({ intervalId });
    } else {
      const { intervalId } = get();
      if (intervalId) {
        clearInterval(intervalId);
        set({ intervalId: null, time: 0 });
      }
    }

    // 保存计时器状态
    const state: TimerState = {
      isRunning: newIsRunning,
      time,
      lastUpdated: Date.now(),
    };
    await storageUtils.saveTimerState(state);

    return newIsRunning;
  },

  reset: async () => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({ isRunning: false, time: 0, startTime: null, intervalId: null });
    const state: TimerState = {
      isRunning: false,
      time: 0,
      lastUpdated: Date.now(),
    };
    await storageUtils.saveTimerState(state);
  },

  setTime: (time: number) => set({ time }),
}));
