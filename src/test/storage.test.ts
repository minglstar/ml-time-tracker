import { storageUtils, TimerState } from '../utils/storage';

// 模拟 chrome.storage API
jest.mock(
  'chrome',
  () => ({
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
      },
    },
  }),
  { virtual: true }
);

const fail = (message: string) => {
  console.error(message);
  return message;
};

describe('storageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveTimerState', () => {
    it('应该正确保存计时器状态', async () => {
      const timerState: TimerState = {
        isRunning: true,
        time: 120,
        lastUpdated: Date.now(),
      };

      (chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined);

      await storageUtils.saveTimerState(timerState);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ timerState });
    });

    it('应该在保存失败时处理错误', async () => {
      const timerState: TimerState = {
        isRunning: true,
        time: 120,
        lastUpdated: Date.now(),
      };

      try {
        const error = new Error('保存失败');
        (chrome.storage.local.set as jest.Mock).mockRejectedValue(error);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        await storageUtils.saveTimerState(timerState);

        expect(chrome.storage.local.set).toHaveBeenCalledWith({ timerState });
        expect(consoleSpy).toHaveBeenCalledWith('保存计时器状态失败:', error);

        consoleSpy.mockRestore();
      } catch (e) {
        expect(e).toEqual(new Error('保存失败'));
      }
    });
  });

  describe('getTimerState', () => {
    it('应该正确获取计时器状态', async () => {
      const mockTimerState: TimerState = {
        isRunning: true,
        time: 120,
        lastUpdated: Date.now(),
      };

      (chrome.storage.local.get as jest.Mock).mockResolvedValue({ timerState: mockTimerState });

      const result = await storageUtils.getTimerState();

      expect(chrome.storage.local.get).toHaveBeenCalledWith('timerState');
      expect(result).toEqual(mockTimerState);
    });

    it('应该在没有保存状态时返回null', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const result = await storageUtils.getTimerState();

      expect(chrome.storage.local.get).toHaveBeenCalledWith('timerState');
      expect(result).toBeNull();
    });

    it('应该在获取失败时处理错误', async () => {
      try {
        const error = new Error('获取失败');
        (chrome.storage.local.get as jest.Mock).mockRejectedValue(error);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await storageUtils.getTimerState();

        expect(chrome.storage.local.get).toHaveBeenCalledWith('timerState');
        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('获取计时器状态失败:', error);

        consoleSpy.mockRestore();
      } catch (e) {
        expect(e).toEqual(new Error('获取失败'));
      }
    });
  });
});
