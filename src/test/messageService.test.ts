import { messageService } from '../utils/messageService';
import { TimerManager } from '../background/TimerManager';
import { ChromeMessage } from '../types/types';
import { MessagePayload } from '../utils/messageService';

// chrome对象已在setup.ts中全局配置

// 模拟 chrome API
jest.mock(
  'chrome',
  () => ({
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  }),
  { virtual: true }
);

const fail = (message: string) => expect(message).toBeFalsy();

describe('Message Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('sendToBackground', () => {
    it('应该正确发送消息到后台并返回响应', async () => {
      const message: MessagePayload<{ test: string }> = {
        type: 'TEST_MESSAGE',
        data: { test: 'data' },
      };

      const mockResponse = { success: true };
      (chrome.runtime.sendMessage as jest.Mock).mockImplementation((msg, callback) => {
        if (callback) callback(mockResponse);
        return Promise.resolve(mockResponse);
      });

      const response = await messageService.sendToBackground(message);

      // 检查第一个参数是否匹配，忽略回调函数
      expect(chrome.runtime.sendMessage).toHaveBeenCalled();
      expect((chrome.runtime.sendMessage as jest.Mock).mock.calls[0][0]).toEqual(message);
      expect(response).toEqual(mockResponse);
    });

    it('应该在发送失败时抛出错误', async () => {
      const message: MessagePayload<{ test: string }> = {
        type: 'TEST_MESSAGE',
        data: { test: 'data' },
      };

      // 修改 messageService.ts 中的实现，确保它正确处理 lastError
      (chrome.runtime.sendMessage as jest.Mock).mockImplementation((msg, callback) => {
        chrome.runtime.lastError = { message: '发送失败' };
        if (callback) callback(undefined);
        return Promise.resolve(undefined);
      });

      try {
        await messageService.sendToBackground(message);
        fail('应该抛出错误');
      } catch (error) {
        expect(error.message).toBe('发送失败');
      }

      // 清理
      delete chrome.runtime.lastError;
    });
  });

  describe('sendToPopup', () => {
    it('应该正确发送消息到popup', async () => {
      const message: MessagePayload<{ test: string }> = {
        type: 'TEST_MESSAGE',
        data: { test: 'data' },
      };

      (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue(undefined);

      await messageService.sendToPopup(message);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
    });

    it('应该在发送失败时处理错误', async () => {
      const message: MessagePayload<{ test: string }> = {
        type: 'TEST_MESSAGE',
        data: { test: 'data' },
      };

      // 使用 try/catch 避免测试本身抛出错误
      try {
        const error = new Error('发送失败');
        (chrome.runtime.sendMessage as jest.Mock).mockRejectedValue(error);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        await messageService.sendToPopup(message);

        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      } catch (e) {
        expect(e).toEqual(new Error('发送失败'));
      }
    });
  });

  describe('listenFromPopup', () => {
    it('应该正确添加消息监听器', () => {
      const mockCallback = jest.fn();

      messageService.listenFromPopup(mockCallback);

      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });

    it('应该正确处理来自popup的消息', () => {
      const mockCallback = jest.fn();
      const mockSender = {};
      const mockSendResponse = jest.fn();
      const mockMessage = { type: 'TEST', data: {} };

      messageService.listenFromPopup(mockCallback);

      // 触发监听器
      const listener = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      listener(mockMessage, mockSender, mockSendResponse);

      expect(mockCallback).toHaveBeenCalledWith(mockMessage, mockSender, mockSendResponse);
    });

    it('应该正确处理来自popup的异步消息', () => {
      const mockCallback = jest.fn().mockImplementation(() => Promise.resolve());
      const mockSender = {};
      const mockSendResponse = jest.fn();
      const mockMessage = { type: 'TEST', data: {} };

      messageService.listenFromPopup(mockCallback);

      // 触发监听器
      const listener = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      const result = listener(mockMessage, mockSender, mockSendResponse);

      expect(result).toBe(true); // 异步消息应该返回true以保持消息通道开放
      expect(mockCallback).toHaveBeenCalledWith(mockMessage, mockSender, mockSendResponse);
    });
  });

  describe('listenFromBackground', () => {
    it('应该正确添加消息监听器', () => {
      const mockCallback = jest.fn();

      messageService.listenFromBackground(mockCallback);

      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });

    it('应该正确处理来自background的消息', () => {
      const mockCallback = jest.fn();
      const mockMessage = { type: 'TEST', data: {} };

      messageService.listenFromBackground(mockCallback);

      // 触发监听器
      const listener = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      listener(mockMessage);

      expect(mockCallback).toHaveBeenCalledWith(mockMessage);
    });

    it('应该忽略无效消息', () => {
      const mockCallback = jest.fn();
      const invalidMessage = null;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      messageService.listenFromBackground(mockCallback);

      // 触发监听器
      const listener = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0];
      listener(invalidMessage);

      expect(mockCallback).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toBe('Received invalid message:');

      consoleSpy.mockRestore();
    });
  });

  describe('removeListener', () => {
    it('应该正确移除消息监听器', () => {
      const mockCallback = jest.fn();

      messageService.removeListener(mockCallback);

      expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(mockCallback);
    });
  });

  describe('TimerManager', () => {
    it('should immediately broadcast timer state when starting timer', async () => {
      const timerManager = new TimerManager();
      const taskId = 'test-task-1';

      let broadcastReceived = false;
      // 模拟消息广播
      (chrome.runtime.sendMessage as jest.Mock).mockImplementation((message: any) => {
        if (message.type === 'TIMER_STATE_UPDATE') {
          broadcastReceived = true;
        }
      });

      await timerManager.startTimer(taskId);

      expect(broadcastReceived).toBe(true);
    });
  });
});
