import { messageService } from '../utils/messageService';

interface Timer {
  currentTime: number;
  isRunning: boolean;
  intervalId?: NodeJS.Timeout;
  lastSyncTime?: number; // 添加上次同步时间
}

interface TimerState {
  taskId: string;
  isRunning: boolean;
  currentTime: number;
}

export class TimerManager {
  private timers: Record<string, Timer> = {};

  constructor() {
    this.timers = {};

    // 添加可见性变化监听器，处理浏览器休眠恢复
    if (typeof document !== 'undefined') {
      // 确保在background环境中不会报错
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void this.syncTimersWithActualTime();
        }
      });
    }

    // 注释掉自动加载，避免测试中的问题
    // void this.loadSavedTimers();
  }

  // 同步计时器与实际时间，处理休眠期间的时间差
  private async syncTimersWithActualTime() {
    const now = Date.now();
    const updatedTasks: string[] = [];

    Object.keys(this.timers).forEach(taskId => {
      const timer = this.timers[taskId];
      if (timer.isRunning && timer.lastSyncTime) {
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

    // 广播所有更新的计时器状态
    for (const taskId of updatedTasks) {
      await this.broadcastTimerState({
        taskId,
        isRunning: true,
        currentTime: this.timers[taskId].currentTime,
      });
    }

    // 保存更新后的状态
    await this.saveTimerState();
  }

  private async broadcastTimerState(state: TimerState) {
    await messageService.sendToPopup({
      type: 'TIMER_STATE_UPDATE',
      data: state,
    });
  }

  async startTimer(taskId: string) {
    if (!this.timers[taskId]) {
      this.timers[taskId] = {
        currentTime: 0,
        isRunning: false,
      };
    }

    const timer = this.timers[taskId];
    timer.isRunning = true;
    timer.lastSyncTime = Date.now(); // 记录开始时间

    // 立即发送状态更新
    await this.broadcastTimerState({
      taskId,
      isRunning: true,
      currentTime: timer.currentTime,
    });

    timer.intervalId = setInterval(async () => {
      timer.currentTime += 1;
      timer.lastSyncTime = Date.now(); // 更新同步时间

      await this.broadcastTimerState({
        taskId,
        isRunning: true,
        currentTime: timer.currentTime,
      });

      // 每分钟保存一次状态
      if (timer.currentTime % 60 === 0) {
        await this.saveTimerState();
      }
    }, 1000);

    // 启动计时器后保存状态
    await this.saveTimerState();
  }

  async stopTimer(taskId: string) {
    const timer = this.timers[taskId];
    if (timer?.intervalId) {
      clearInterval(timer.intervalId);
      timer.isRunning = false;

      await this.broadcastTimerState({
        taskId,
        isRunning: false,
        currentTime: timer.currentTime,
      });

      // 停止计时器后保存状态
      await this.saveTimerState();
    }
  }

  // 保存计时器状态到存储
  async saveTimerState() {
    try {
      // 只保存运行中的计时器
      const timersToSave = Object.entries(this.timers).reduce(
        (acc, [id, timer]) => {
          // 不保存intervalId，因为它不能被序列化
          const { intervalId, ...timerData } = timer;
          acc[id] = timerData;
          return acc;
        },
        {} as Record<string, Omit<Timer, 'intervalId'>>
      );

      await chrome.storage.local.set({ savedTimers: timersToSave });
    } catch (error) {
      console.error('保存计时器状态失败:', error);
    }
  }

  // 从存储加载计时器状态
  async loadSavedTimers() {
    try {
      console.log('开始加载计时器状态');
      const result = await chrome.storage.local.get('savedTimers');
      console.log('获取到存储数据:', result);

      const savedTimers = (result.savedTimers as Record<string, Omit<Timer, 'intervalId'>>) || {};

      // 如果没有保存的计时器，直接返回
      if (Object.keys(savedTimers).length === 0) {
        console.log('没有保存的计时器');
        return;
      }

      console.log('恢复计时器:', savedTimers);

      // 恢复保存的计时器
      for (const [taskId, timerData] of Object.entries(savedTimers)) {
        this.timers[taskId] = {
          ...timerData,
          isRunning: false, // 先设为false，如果需要运行会在下面重启
        };

        // 如果计时器之前是运行状态，重新启动它
        if (timerData.isRunning) {
          console.log('重启计时器:', taskId);
          await this.startTimer(taskId);

          console.log('发送恢复通知:', taskId);
          // 通知用户计时器已恢复
          await messageService.sendToPopup({
            type: 'TIMER_RESTORED',
            data: {
              taskId,
              currentTime: this.timers[taskId].currentTime,
            },
          });
        }
      }

      console.log('计时器加载完成');
    } catch (error) {
      console.error('加载计时器状态失败:', error);
    }
  }

  // 获取计时器状态
  getTimerState(taskId: string): TimerState | null {
    const timer = this.timers[taskId];
    if (!timer) return null;

    return {
      taskId,
      isRunning: timer.isRunning,
      currentTime: timer.currentTime,
    };
  }

  // 获取所有计时器状态
  getAllTimerStates(): Record<string, TimerState> {
    return Object.entries(this.timers).reduce(
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
  }
}
