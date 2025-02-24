import '@jest/globals';
import '@testing-library/jest-dom';
import { ChromeMessage, TimerState } from '../types/types';

// 扩展全局类型以支持Jest mock
declare global {
  namespace jest {
    interface Mock<T = any> {
      mockImplementation: (implementation: Function) => jest.Mock;
      mock: {
        calls: any[][];
      };
    }
  }
}

// 模拟 Chrome API
const mockChrome = {
  storage: {
    local: {
      get: jest.fn() as jest.Mock<typeof chrome.storage.local.get>,
      set: jest.fn() as jest.Mock<typeof chrome.storage.local.set>,
      remove: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn() as jest.Mock<typeof chrome.runtime.sendMessage>,
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    lastError: null,
  },
} as unknown as typeof chrome;

// 全局模拟 chrome 对象
global.chrome = mockChrome;

// 清理所有模拟的实现
beforeEach(() => {
  jest.clearAllMocks();
});
