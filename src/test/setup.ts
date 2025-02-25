import '@jest/globals';
import '@testing-library/jest-dom';
// 移除未使用的导入
// import { ChromeMessage, TimerState } from '../types/types';

// 扩展全局类型以支持Jest mock
declare global {
  namespace jest {
    interface Mock<T = any> {
      mockImplementation: (implementation: (...args: unknown[]) => unknown) => jest.Mock<T>;
      mock: {
        calls: unknown[][];
        instances: unknown[];
      };
    }
  }
}

// 模拟 Chrome API
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(() => {
        return { mock: { calls: [[]] } };
      }),
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

// 更新 chrome.storage.local.get 的模拟实现
(chrome.storage.local.get as jest.Mock).mockImplementation((keys, callback) => {
  // 根据请求的键返回不同的数据
  if (keys === 'timerState') {
    callback({ timerState: null });
  } else if (keys === 'savedTimers') {
    callback({ savedTimers: {} });
  } else {
    callback({});
  }
});
