import { messageService } from './utils/messageService';

// 定义计时器状态接口
interface TimerState {
  taskId: string;
  isRunning: boolean;
  currentTime: number;
}

// 存储计时器状态
const timerStates: Record<
  string,
  {
    isRunning: boolean;
    currentTime: number;
    lastSyncTime: number;
  }
> = {};

// 处理来自popup的消息
messageService.listenFromPopup(async (message, _sender, sendResponse) => {
  try {
    switch (message.type) {
      case 'REQUEST_TIMER_STATE': {
        // 如果请求特定任务的状态
        if (message.data && 'taskId' in message.data) {
          const taskId = message.data.taskId as string;
          const timer = timerStates[taskId];

          if (timer) {
            sendResponse({
              taskId,
              isRunning: timer.isRunning,
              currentTime: timer.currentTime,
            });
          } else {
            sendResponse(null);
          }
        } else {
          // 否则返回所有计时器状态
          const allStates = Object.entries(timerStates).reduce(
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
          sendResponse(allStates);
        }
        break;
      }

      case 'TIMER_STATE_UPDATE': {
        // 处理来自 timerStore 的状态更新
        if (message.data && 'taskId' in message.data) {
          const { taskId, isRunning, currentTime } = message.data;

          // 更新或创建计时器状态
          if (!timerStates[taskId]) {
            timerStates[taskId] = {
              isRunning: false,
              currentTime: 0,
              lastSyncTime: Date.now(),
            };
          }

          timerStates[taskId].isRunning = isRunning;
          timerStates[taskId].currentTime = currentTime;
          timerStates[taskId].lastSyncTime = Date.now();

          // 保存状态
          await saveTimerStates();

          sendResponse({ success: true });
        } else {
          sendResponse({ error: 'Invalid timer state data' });
        }
        break;
      }

      case 'SAVE_TIMER_STATES': {
        // 保存所有计时器状态
        await saveTimerStates();
        sendResponse({ success: true });
        break;
      }

      default: {
        console.warn('Unknown message type:', message.type);
        sendResponse({ error: 'Unknown message type' });
      }
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
    sendResponse({ error: String(error) });
  }
});

// 保存计时器状态到存储
async function saveTimerStates() {
  try {
    await chrome.storage.local.set({ savedTimers: timerStates });

    // 同时保存兼容格式的数据（如果有活动的计时器）
    const activeTimers = Object.entries(timerStates).filter(([_, timer]) => timer.isRunning);
    if (activeTimers.length > 0) {
      const [activeId, activeTimer] = activeTimers[0];

      await chrome.storage.local.set({
        timerState: {
          isRunning: activeTimer.isRunning,
          time: activeTimer.currentTime,
          lastUpdated: activeTimer.lastSyncTime,
        },
      });
    }
  } catch (error) {
    console.error('保存计时器状态失败:', error);
  }
}

// 加载保存的计时器状态
async function loadSavedTimers() {
  try {
    const result = await chrome.storage.local.get('savedTimers');
    const savedTimers =
      (result.savedTimers as Record<
        string,
        {
          isRunning: boolean;
          currentTime: number;
          lastSyncTime: number;
        }
      >) || {};

    // 恢复保存的计时器
    Object.entries(savedTimers).forEach(([taskId, timer]) => {
      timerStates[taskId] = {
        ...timer,
        isRunning: false, // 初始化时设为停止状态
      };
    });

    // 如果没有保存的计时器，尝试加载兼容格式的数据
    if (Object.keys(savedTimers).length === 0) {
      const oldResult = await chrome.storage.local.get('timerState');
      const oldState = oldResult.timerState as
        | {
            isRunning: boolean;
            time: number;
            lastUpdated: number;
          }
        | undefined;

      if (oldState) {
        timerStates.default = {
          currentTime: oldState.time,
          isRunning: false, // 初始化时设为停止状态
          lastSyncTime: oldState.lastUpdated,
        };
      }
    }

    // 通知所有前端页面更新状态
    for (const [taskId, timer] of Object.entries(timerStates)) {
      await messageService.sendToPopup({
        type: 'TIMER_STATE_UPDATE',
        data: {
          taskId,
          isRunning: timer.isRunning,
          currentTime: timer.currentTime,
        },
      });
    }
  } catch (error) {
    console.error('加载计时器状态失败:', error);
  }
}

// 初始化
void loadSavedTimers();
