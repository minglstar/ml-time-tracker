import { TimerState } from './storage';

export interface MessagePayload<T = unknown> {
  type: string;
  data: T;
}

export interface TimerUpdateMessage extends MessagePayload<TimerState> {
  type: 'TIMER_UPDATE';
}

export interface RequestTimerStateMessage extends MessagePayload<void> {
  type: 'REQUEST_TIMER_STATE';
}

export type ChromeMessage = TimerUpdateMessage | RequestTimerStateMessage;

export const messageService = {
  // 发送消息到background
  async sendToBackground<T = unknown>(message: MessagePayload): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response as T);
        }
      });
    });
  },

  // 发送消息到所有活跃的popup
  async sendToPopup(message: MessagePayload): Promise<void> {
    try {
      // 使用runtime.sendMessage广播消息到所有监听者
      await chrome.runtime.sendMessage({ ...message });
    } catch (error) {
      console.error('Failed to send message to popup:', error);
      throw error;
    }
  },

  // 监听来自popup的消息
  listenFromPopup(
    callback: (
      message: ChromeMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => void | Promise<void>
  ): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const response = callback(message, sender, sendResponse);
      if (response instanceof Promise) {
        response.catch(error => {
          console.error('Error handling message:', error);
          sendResponse({ error: error.message });
        });
        return true; // 保持消息通道开放以等待异步响应
      }
      return false;
    });
  },

  // 监听来自background的消息
  listenFromBackground(callback: (message: ChromeMessage) => void): void {
    chrome.runtime.onMessage.addListener((message: unknown) => {
      if (isChromeMessage(message)) {
        callback(message);
      } else {
        console.error('Received invalid message:', message);
      }
    });
  },
};

// 类型守卫函数
function isChromeMessage(message: unknown): message is ChromeMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof (message as { type: unknown }).type === 'string'
  );
}
