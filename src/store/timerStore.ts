import { create } from 'zustand';
import { TimerState } from '../types/types';
import { messageService } from '../utils/messageService';

interface TimerStore {
  // 计时器状态
  isRunning: boolean;
  time: number;
  lastUpdated: number;

  // 操作方法
  startStop: () => Promise<void>;
  reset: () => Promise<void>;
  setTime: (time: number) => void;
  initState: () => Promise<void>;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // 初始状态
  isRunning: false,
  time: 0,
  lastUpdated: Date.now(),

  // 初始化状态
  initState: async () => {
    try {
      const state = await messageService.sendToBackground<TimerState>({
        type: 'REQUEST_TIMER_STATE',
        data: undefined,
      });
      set(state);
    } catch (error) {
      console.error('Failed to initialize timer state:', error);
    }
  },

  // 计时器控制
  startStop: async () => {
    const state = await messageService.sendToBackground<TimerState>({
      type: 'TIMER_UPDATE',
      data: {
        isRunning: !get().isRunning,
        time: get().time,
        lastUpdated: Date.now(),
      },
    });
    set(state);
  },

  reset: async () => {
    const state = await messageService.sendToBackground<TimerState>({
      type: 'TIMER_UPDATE',
      data: {
        isRunning: false,
        time: 0,
        lastUpdated: Date.now(),
      },
    });
    set(state);
  },

  setTime: (time: number) => set({ time }),
}));

// 监听来自background的消息以更新状态
messageService.listenFromBackground(message => {
  if (message.type === 'TIMER_UPDATE' && message.data) {
    // 确保更新最新的计时器状态
    useTimerStore.setState({
      isRunning: message.data.isRunning,
      time: message.data.time,
      lastUpdated: message.data.lastUpdated
    });
  }
});
