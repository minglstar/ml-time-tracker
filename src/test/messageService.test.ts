import { messageService } from '../utils/messageService';
import { TimerManager } from '../background/TimerManager';

// chrome对象已在setup.ts中全局配置

describe('Message Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('sendToBackground', () => {
    it('应该正确发送消息到background', async () => {
      const mockMessage = {
        type: 'TIMER_UPDATE',
        data: { isRunning: true, time: 0, lastUpdated: Date.now() },
      };

      const mockResponse = { success: true };
      const sendMessageMock = jest.spyOn(chrome.runtime, 'sendMessage');
      sendMessageMock.mockImplementation((message, callback: (response: any) => void) => {
        if (callback) callback(mockResponse);
        return Promise.resolve(mockResponse);
      });

      const response = await messageService.sendToBackground(mockMessage);
      expect(response).toEqual(mockResponse);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('当发送消息失败时应该抛出错误', async () => {
      const mockMessage = {
        type: 'TIMER_UPDATE',
        data: { isRunning: true, time: 0, lastUpdated: Date.now() },
      };

      const sendMessageMock = jest.spyOn(chrome.runtime, 'sendMessage');
      const error = new Error('发送失败');
      sendMessageMock.mockImplementation((message, callback: (response: any) => void) => {
        if (callback) callback(undefined);
        return Promise.reject(error);
      });

      await expect(messageService.sendToBackground(mockMessage)).rejects.toThrow('发送失败');
    });
  });

  describe('sendToPopup', () => {
    it('应该正确发送消息到popup', async () => {
      const mockMessage = {
        type: 'TIMER_UPDATE',
        data: { isRunning: true, time: 0, lastUpdated: Date.now() },
      };

      const sendMessageMock = jest.spyOn(chrome.runtime, 'sendMessage');
      sendMessageMock.mockImplementation(() => Promise.resolve(undefined));

      await messageService.sendToPopup(mockMessage);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(mockMessage);
    }, 3000);

    it('当发送消息失败时应该抛出错误', async () => {
      const mockMessage = {
        type: 'TIMER_UPDATE',
        data: { isRunning: true, time: 0, lastUpdated: Date.now() },
      };

      const sendMessageMock = jest.spyOn(chrome.runtime, 'sendMessage');
      sendMessageMock.mockRejectedValue(new Error('发送失败'));

      await expect(messageService.sendToPopup(mockMessage)).rejects.toThrow('发送失败');
    }, 3000);
  });

  describe('listenFromPopup', () => {
    it('应该正确处理来自popup的同步消息', () => {
      const mockCallback = jest.fn();
      const mockSender = {};
      const mockSendResponse = jest.fn();

      messageService.listenFromPopup(mockCallback);

      const mockMessage = {
        type: 'TIMER_UPDATE',
        data: { isRunning: true, time: 0, lastUpdated: Date.now() },
      };

      // 触发监听器
      const listeners = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      listeners(mockMessage, mockSender, mockSendResponse);

      expect(mockCallback).toHaveBeenCalledWith(mockMessage, mockSender, mockSendResponse);
    });

    it('应该正确处理来自popup的异步消息', async () => {
      const mockCallback = jest.fn().mockImplementation(() => Promise.resolve());
      const mockSender = {};
      const mockSendResponse = jest.fn();

      messageService.listenFromPopup(mockCallback);

      const mockMessage = {
        type: 'TIMER_UPDATE',
        data: { isRunning: true, time: 0, lastUpdated: Date.now() },
      };

      // 触发监听器
      const listeners = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      const result = listeners(mockMessage, mockSender, mockSendResponse);

      expect(result).toBe(true); // 异步消息应该返回true以保持消息通道开放
      expect(mockCallback).toHaveBeenCalledWith(mockMessage, mockSender, mockSendResponse);
    });
  });

  describe('listenFromBackground', () => {
    it('应该正确处理来自background的有效消息', () => {
      const mockCallback = jest.fn();
      messageService.listenFromBackground(mockCallback);

      const mockMessage = {
        type: 'TIMER_UPDATE',
        data: { isRunning: true, time: 0, lastUpdated: Date.now() },
      };

      // 触发监听器
      const listeners = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      listeners(mockMessage);

      expect(mockCallback).toHaveBeenCalledWith(mockMessage);
    });

    it('应该忽略无效的消息格式', () => {
      const mockCallback = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error');
      messageService.listenFromBackground(mockCallback);

      const invalidMessage = { invalidKey: 'value' };

      // 触发监听器
      const listeners = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      listeners(invalidMessage);

      expect(mockCallback).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Received invalid message:', invalidMessage);
    });
  });

  describe('TimerManager', () => {
    it('should immediately broadcast timer state when starting timer', async () => {
      const timerManager = new TimerManager();
      const taskId = 'test-task-1';

      let broadcastReceived = false;
      // 模拟消息广播
      chrome.runtime.sendMessage.mockImplementation(message => {
        if (message.type === 'TIMER_STATE_UPDATE') {
          broadcastReceived = true;
        }
      });

      await timerManager.startTimer(taskId);

      expect(broadcastReceived).toBe(true);
    });
  });
});
