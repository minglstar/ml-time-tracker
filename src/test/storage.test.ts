import { storageUtils } from '../utils/storage';

describe('Storage Utils Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTimerState', () => {
    it('应该正确获取计时器状态', async () => {
      const mockTimerState = {
        isRunning: true,
        time: 100,
        lastUpdated: Date.now(),
      };

      const getMock = jest.spyOn(chrome.storage.local, 'get') as jest.SpyInstance;
      getMock.mockResolvedValue({ timerState: mockTimerState });

      const result = await storageUtils.getTimerState();
      expect(result).toEqual(mockTimerState);
      expect(chrome.storage.local.get).toHaveBeenCalledWith('timerState');
    });

    it('当没有存储状态时应该返回默认值', async () => {
      const getMock = jest.spyOn(chrome.storage.local, 'get') as jest.SpyInstance;
      getMock.mockResolvedValue({});

      const result = await storageUtils.getTimerState();
      expect(result).toEqual(null);
    });
  });

  describe('setTimerState', () => {
    it('应该正确保存计时器状态', async () => {
      const mockTimerState = {
        isRunning: true,
        time: 100,
        lastUpdated: Date.now(),
      };

      const setMock = jest.spyOn(chrome.storage.local, 'set') as jest.SpyInstance;
      setMock.mockResolvedValue(undefined);

      await storageUtils.saveTimerState(mockTimerState);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        timerState: mockTimerState,
      });
    });

    it('当保存失败时应该抛出错误', async () => {
      const mockTimerState = {
        isRunning: true,
        time: 100,
        lastUpdated: Date.now(),
      };

      const setMock = jest.spyOn(chrome.storage.local, 'set') as jest.SpyInstance;
      setMock.mockRejectedValue(new Error('保存失败'));

      await expect(storageUtils.saveTimerState(mockTimerState)).rejects.toThrow('保存失败');
    });
  });
});
