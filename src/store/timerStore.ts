import { create } from 'zustand';
import { messageService } from '../utils/messageService';

// 定义计时器接口
interface Timer {
  currentTime: number;
  isRunning: boolean;
  lastSyncTime: number;
  intervalId?: NodeJS.Timeout;
}

// 定义计时器状态接口
interface TimerState {
  taskId: string;
  isRunning: boolean;
  currentTime: number;
}

// 定义 TimerStore 接口
interface TimerStore {
  // 计时器状态
  timers: Record<string, Timer>;
  activeTimerId: string | null;

  // 兼容旧接口
  isRunning: boolean;
  time: number;
  lastUpdated: number;

  // 操作方法
  startTimer: (taskId: string) => Promise<void>;
  stopTimer: (taskId: string) => Promise<void>;
  getTimerState: (taskId: string) => TimerState | null;
  getAllTimerStates: () => Record<string, TimerState>;
  syncTimersWithActualTime: () => Promise<void>;
  saveTimerState: () => Promise<void>;
  loadSavedTimers: () => Promise<void>;

  // 兼容旧接口的方法
  startStop: () => Promise<boolean>;
  reset: () => Promise<void>;
  setTime: (time: number) => void;
  initState: () => Promise<void>;
}

// 创建 TimerStore
export const useTimerStore = create<TimerStore>((set, get) => ({
  // 初始状态
  timers: {},
  activeTimerId: null,

  // 兼容旧接口的状态
  isRunning: false,
  time: 0,
  lastUpdated: Date.now(),

  // 启动计时器
  startTimer: async (taskId: string) => {
    const { timers } = get();

    // 如果计时器不存在，创建一个新的
    if (!timers[taskId]) {
      timers[taskId] = {
        currentTime: 0,
        isRunning: false,
        lastSyncTime: Date.now(),
      };
    }

    const timer = timers[taskId];
    timer.isRunning = true;
    timer.lastSyncTime = Date.now();

    // 更新状态
    set({
      timers: { ...timers },
      activeTimerId: taskId,
      // 更新兼容状态
      isRunning: true,
      time: timer.currentTime,
      lastUpdated: timer.lastSyncTime,
    });

    // 发送状态更新到 background
    await messageService.sendToBackground({
      type: 'TIMER_STATE_UPDATE',
      data: {
        taskId,
        isRunning: true,
        currentTime: timer.currentTime,
      },
    });

    // 创建计时器间隔
    if (!timer.intervalId) {
      timer.intervalId = setInterval(async () => {
        const currentTimer = get().timers[taskId];
        if (currentTimer && currentTimer.isRunning) {
          currentTimer.currentTime += 1;
          currentTimer.lastSyncTime = Date.now();

          // 更新状态
          set({
            timers: { ...get().timers },
            // 更新兼容状态
            time: currentTimer.currentTime,
            lastUpdated: currentTimer.lastSyncTime,
          });

          // 发送状态更新到 background
          await messageService.sendToBackground({
            type: 'TIMER_STATE_UPDATE',
            data: {
              taskId,
              isRunning: true,
              currentTime: currentTimer.currentTime,
            },
          });

          // 每分钟保存一次状态
          if (currentTimer.currentTime % 60 === 0) {
            await get().saveTimerState();
          }
        }
      }, 1000);

      // 更新计时器对象
      set({
        timers: { ...get().timers },
      });
    }

    // 保存状态
    await get().saveTimerState();
  },

  // 停止计时器
  stopTimer: async (taskId: string) => {
    const { timers } = get();
    const timer = timers[taskId];

    if (timer?.intervalId) {
      clearInterval(timer.intervalId);
      timer.intervalId = undefined;
      timer.isRunning = false;

      // 更新状态
      set({
        timers: { ...timers },
        // 更新兼容状态
        isRunning: false,
        lastUpdated: Date.now(),
      });

      // 发送状态更新到 background
      await messageService.sendToBackground({
        type: 'TIMER_STATE_UPDATE',
        data: {
          taskId,
          isRunning: false,
          currentTime: timer.currentTime,
        },
      });

      // 保存状态
      await get().saveTimerState();
    }
  },

  // 获取计时器状态
  getTimerState: (taskId: string) => {
    const timer = get().timers[taskId];
    if (!timer) return null;

    return {
      taskId,
      isRunning: timer.isRunning,
      currentTime: timer.currentTime,
    };
  },

  // 获取所有计时器状态
  getAllTimerStates: () => {
    const { timers } = get();

    return Object.entries(timers).reduce(
      (acc, [taskId, timer]) => {
        acc[taskId] = {
          taskId,
          isRunning: timer.isRunning,
          currentTime: timer.currentTime,
        };
        return acc;
      },
      {} as Record<string, TimerState>
    );
  },

  // 同步计时器与实际时间
  syncTimersWithActualTime: async () => {
    const { timers } = get();
    const now = Date.now();
    const updatedTasks: string[] = [];

    Object.keys(timers).forEach(taskId => {
      const timer = timers[taskId];
      if (timer.isRunning) {
        // 计算应该经过的时间（秒）
        const elapsedSeconds = Math.floor((now - timer.lastSyncTime) / 1000);
        if (elapsedSeconds > 0) {
          timer.currentTime += elapsedSeconds;
          updatedTasks.push(taskId);
        }
      }
      // 更新同步时间
      timer.lastSyncTime = now;
    });

    if (updatedTasks.length > 0) {
      // 更新状态
      set({
        timers: { ...timers },
        // 更新兼容状态
        time: get().activeTimerId ? timers[get().activeTimerId]?.currentTime || 0 : 0,
        lastUpdated: now,
      });

      // 广播所有更新的计时器状态
      for (const taskId of updatedTasks) {
        await messageService.sendToBackground({
          type: 'TIMER_STATE_UPDATE',
          data: {
            taskId,
            isRunning: true,
            currentTime: timers[taskId].currentTime,
          },
        });
      }

      // 保存更新后的状态
      await get().saveTimerState();
    }
  },

  // 保存计时器状态
  saveTimerState: async () => {
    try {
      const { timers } = get();

      // 只保存必要的数据，不包括 intervalId
      const timersToSave = Object.entries(timers).reduce(
        (acc, [id, timer]) => {
          const { intervalId, ...timerData } = timer;
          acc[id] = timerData;
          return acc;
        },
        {} as Record<string, Omit<Timer, 'intervalId'>>
      );

      // 通知 background 保存状态
      await messageService.sendToBackground({
        type: 'SAVE_TIMER_STATES',
        data: { timers: timersToSave },
      });
    } catch (error) {
      console.error('保存计时器状态失败:', error);
    }
  },

  // 加载保存的计时器状态
  loadSavedTimers: async () => {
    try {
      // 从 chrome.storage 加载数据
      const result = await chrome.storage.local.get('savedTimers');
      const savedTimers = (result.savedTimers as Record<string, Omit<Timer, 'intervalId'>>) || {};

      // 如果没有保存的计时器，尝试加载兼容格式的数据
      if (Object.keys(savedTimers).length === 0) {
        const oldResult = await chrome.storage.local.get('timerState');
        const oldState = oldResult.timerState as
          | { isRunning: boolean; time: number; lastUpdated: number }
          | undefined;

        if (oldState) {
          // 创建默认计时器
          savedTimers.default = {
            currentTime: oldState.time,
            isRunning: oldState.isRunning,
            lastSyncTime: oldState.lastUpdated,
          };

          // 更新兼容状态
          set({
            isRunning: oldState.isRunning,
            time: oldState.time,
            lastUpdated: oldState.lastUpdated,
            activeTimerId: 'default',
          });
        }
      }

      // 恢复保存的计时器
      const newTimers: Record<string, Timer> = {};
      let activeId: string | null = null;

      for (const [taskId, timerData] of Object.entries(savedTimers)) {
        newTimers[taskId] = {
          ...timerData,
          isRunning: false, // 先设为 false，如果需要运行会在下面重启
        };

        // 如果计时器之前是运行状态，记录它
        if (timerData.isRunning) {
          activeId = taskId;
        }
      }

      // 更新状态
      set({
        timers: newTimers,
        activeTimerId: activeId,
      });

      // 如果有活动的计时器，重新启动它
      if (activeId) {
        await get().startTimer(activeId);
      }
    } catch (error) {
      console.error('加载计时器状态失败:', error);
    }
  },

  // 兼容旧接口的方法
  startStop: async () => {
    const { isRunning, activeTimerId } = get();
    const defaultTaskId = activeTimerId || 'default';

    if (isRunning) {
      await get().stopTimer(defaultTaskId);
      return false;
    } else {
      await get().startTimer(defaultTaskId);
      return true;
    }
  },

  reset: async () => {
    const { activeTimerId } = get();
    const defaultTaskId = activeTimerId || 'default';

    // 停止计时器
    await get().stopTimer(defaultTaskId);

    // 重置计时器
    const { timers } = get();
    if (timers[defaultTaskId]) {
      timers[defaultTaskId].currentTime = 0;

      // 更新状态
      set({
        timers: { ...timers },
        time: 0,
        lastUpdated: Date.now(),
      });

      // 保存状态
      await get().saveTimerState();
    }
  },

  setTime: (time: number) => {
    const { activeTimerId, timers } = get();
    const defaultTaskId = activeTimerId || 'default';

    // 如果计时器不存在，创建一个新的
    if (!timers[defaultTaskId]) {
      timers[defaultTaskId] = {
        currentTime: time,
        isRunning: false,
        lastSyncTime: Date.now(),
      };
    } else {
      timers[defaultTaskId].currentTime = time;
    }

    // 更新状态
    set({
      timers: { ...timers },
      time,
      lastUpdated: Date.now(),
      activeTimerId: defaultTaskId,
    });
  },

  initState: async () => {
    try {
      // 加载保存的计时器状态
      await get().loadSavedTimers();

      // 同步计时器与实际时间
      await get().syncTimersWithActualTime();
    } catch (error) {
      console.error('初始化计时器状态失败:', error);
    }
  },
}));

// 添加可见性变化监听器，处理浏览器休眠恢复
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void useTimerStore.getState().syncTimersWithActualTime();
    }
  });
}

// 监听来自background的消息以更新状态
messageService.listenFromBackground((message: { type: string; data?: any }) => {
  if (message.type === 'TIMER_UPDATE' && message.data) {
    // 确保更新最新的计时器状态
    useTimerStore.setState({
      isRunning: message.data.isRunning,
      time: message.data.time,
      lastUpdated: message.data.lastUpdated,
    });
  } else if (message.type === 'TIMER_STATE_UPDATE' && message.data) {
    const { taskId, isRunning, currentTime } = message.data;
    const store = useTimerStore.getState();
    const timers = { ...store.timers };

    // 如果计时器不存在，创建一个新的
    if (!timers[taskId]) {
      timers[taskId] = {
        currentTime: 0,
        isRunning: false,
        lastSyncTime: Date.now(),
      };
    }

    // 更新计时器状态
    timers[taskId].currentTime = currentTime;
    timers[taskId].isRunning = isRunning;
    timers[taskId].lastSyncTime = Date.now();

    // 更新状态
    useTimerStore.setState({
      timers,
      activeTimerId: taskId,
      // 更新兼容状态
      isRunning,
      time: currentTime,
      lastUpdated: Date.now(),
    });
  }
});
