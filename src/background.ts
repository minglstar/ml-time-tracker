import { messageService } from './utils/messageService';
import { storageUtils, TimerState } from './utils/storage';

let timerState: TimerState = {
  isRunning: false,
  time: 0,
  lastUpdated: Date.now(),
};

let intervalId: NodeJS.Timeout | null = null;

// 初始化时从storage加载计时器状态
const initTimerState = async () => {
  const savedState = await storageUtils.getTimerState();
  if (savedState) {
    timerState = savedState;
    if (timerState.isRunning) {
      startTimer();
    }
  }
};

// 启动计时器
const startTimer = () => {
  if (!intervalId) {
    intervalId = setInterval(async () => {
      timerState.time += 1;
      timerState.lastUpdated = Date.now();
      await storageUtils.saveTimerState(timerState);
      try {
        // 确保消息发送到所有打开的popup页面
        await messageService.sendToPopup({
          type: 'TIMER_UPDATE',
          data: { ...timerState },
        });
      } catch (error) {
        console.error('Failed to update popup timer:', error);
      }
    }, 1000);
  }
};

// 停止计时器
const stopTimer = async () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    // 重置计时器状态
    timerState = {
      isRunning: false,
      time: 0,
      lastUpdated: Date.now(),
    };
    // 保存当前状态并通知所有popup
    await storageUtils.saveTimerState(timerState);
    await messageService.sendToPopup({
      type: 'TIMER_UPDATE',
      data: timerState,
    });
  }
};

// 处理来自popup的消息
messageService.listenFromPopup(async (message, _sender, sendResponse) => {
  switch (message.type) {
    case 'REQUEST_TIMER_STATE':
      sendResponse(timerState);
      break;
    case 'TIMER_UPDATE':
      const newState = message.data;
      timerState = newState;

      if (newState.isRunning && !intervalId) {
        startTimer();
      } else if (!newState.isRunning && intervalId) {
        stopTimer();
      }

      await storageUtils.saveTimerState(timerState);
      // 主动通知所有popup页面状态更新
      await messageService.sendToPopup({
        type: 'TIMER_UPDATE',
        data: timerState,
      });
      sendResponse(timerState);
      break;
  }
});

// 初始化
void initTimerState();
