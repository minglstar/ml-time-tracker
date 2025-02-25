import { messageService } from './utils/messageService';
import { storageUtils, TimerState } from './utils/storage';
import { TimerManager } from './background/TimerManager';

// 创建TimerManager实例
const timerManager = new TimerManager();

// 处理来自popup的消息
messageService.listenFromPopup(async (message, _sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'REQUEST_TIMER_STATE': {
        // 如果请求特定任务的状态
        if (message.data?.taskId) {
          const state = timerManager.getTimerState(message.data.taskId);
          sendResponse(state);
        } else {
          // 否则返回所有计时器状态
          const allStates = timerManager.getAllTimerStates();
          sendResponse(allStates);
        }
        break;
      }
      case 'START_TIMER':
        await timerManager.startTimer(message.data.taskId);
        sendResponse({ success: true });
        break;
      case 'STOP_TIMER':
        await timerManager.stopTimer(message.data.taskId);
        sendResponse({ success: true });
        break;
      default: {
        console.warn('Received unknown message type:', (message as { type: string }).type);
        sendResponse({ error: 'Unknown message type' });
      }
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
    sendResponse({ error: String(error) });
  }
});

// 为了向后兼容，保留旧的计时器逻辑
let oldTimerState: TimerState = {
  isRunning: false,
  time: 0,
  lastUpdated: Date.now(),
};

let intervalId: NodeJS.Timeout | null = null;

// 初始化时从storage加载计时器状态
const initTimerState = async () => {
  const savedState = await storageUtils.getTimerState();
  if (savedState) {
    oldTimerState = savedState;
    if (oldTimerState.isRunning) {
      startTimer();
    }
  }
};

// 启动计时器
const startTimer = () => {
  if (!intervalId) {
    intervalId = setInterval(() => {
      void (async () => {
        oldTimerState.time += 1;
        oldTimerState.lastUpdated = Date.now();
        await storageUtils.saveTimerState(oldTimerState);
        try {
          // 确保消息发送到所有打开的popup页面
          await messageService.sendToPopup({
            type: 'TIMER_UPDATE',
            data: { ...oldTimerState },
          });
        } catch (error) {
          console.error('Failed to update popup timer:', error);
        }
      })();
    }, 1000);
  }
};

// 停止计时器
const stopTimer = async () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    // 重置计时器状态
    oldTimerState = {
      isRunning: false,
      time: 0,
      lastUpdated: Date.now(),
    };
    // 保存当前状态并通知所有popup
    await storageUtils.saveTimerState(oldTimerState);
    await messageService.sendToPopup({
      type: 'TIMER_UPDATE',
      data: oldTimerState,
    });
  }
};

// 初始化
void initTimerState();
