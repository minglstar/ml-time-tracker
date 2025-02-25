import { messageService } from '../utils/messageService';

interface Timer {
  currentTime: number;
  isRunning: boolean;
  intervalId?: NodeJS.Timeout;
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
  }

  private async broadcastTimerState(state: TimerState) {
    await messageService.sendToPopup({
      type: 'TIMER_STATE_UPDATE',
      data: state
    });
  }

  async startTimer(taskId: string) {
    if (!this.timers[taskId]) {
      this.timers[taskId] = {
        currentTime: 0,
        isRunning: false
      };
    }

    const timer = this.timers[taskId];
    timer.isRunning = true;

    // 立即发送状态更新
    await this.broadcastTimerState({
      taskId,
      isRunning: true,
      currentTime: timer.currentTime
    });

    timer.intervalId = setInterval(async () => {
      timer.currentTime += 1;
      await this.broadcastTimerState({
        taskId,
        isRunning: true,
        currentTime: timer.currentTime
      });
    }, 1000);
  }

  async stopTimer(taskId: string) {
    const timer = this.timers[taskId];
    if (timer && timer.intervalId) {
      clearInterval(timer.intervalId);
      timer.isRunning = false;
      await this.broadcastTimerState({
        taskId,
        isRunning: false,
        currentTime: timer.currentTime
      });
    }
  }
} 