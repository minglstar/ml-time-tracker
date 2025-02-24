import { messageService } from '../utils/messageService';
import { storageUtils } from '../utils/storage';

// 模拟依赖
jest.mock('../utils/messageService');
jest.mock('../utils/storage');

describe('Background Timer Tests', () => {
  let messageCallback: any;
  let backgroundModule: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    messageCallback = null;
    backgroundModule = null;

    // 初始化messageCallback
    (messageService.listenFromPopup as jest.Mock).mockImplementation(callback => {
      messageCallback = callback;
      // 立即调用callback以确保它被正确初始化
      callback({ type: 'INIT', data: {} }, {}, () => {});
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('应该正确初始化计时器状态', async () => {
    const mockState = {
      isRunning: false,
      time: 0,
      lastUpdated: Date.now(),
    };

    (storageUtils.getTimerState as jest.Mock).mockResolvedValue(mockState);

    // 导入background模块以触发初始化
    backgroundModule = await import('../background');

    expect(storageUtils.getTimerState).toHaveBeenCalled();
  });

  it('应该在收到TIMER_UPDATE消息时正确更新计时器状态', async () => {
    // 确保messageCallback已经被初始化
    await new Promise<void>(resolve => {
      (messageService.listenFromPopup as jest.Mock).mockImplementation(callback => {
        messageCallback = callback;
        resolve();
      });
    });

    const mockState = {
      isRunning: true,
      time: 10,
      lastUpdated: Date.now(),
    };

    // 模拟接收消息
    messageCallback({
      type: 'TIMER_UPDATE',
      data: mockState,
    });

    // 验证状态更新
    expect(messageService.sendToPopup).toHaveBeenCalledWith({
      type: 'TIMER_UPDATE',
      data: mockState,
    });
  }, 3000);

  it('应该每秒递增计时器并更新状态', async () => {
    jest.setTimeout(3000); // 设置测试超时时间为3秒
    // 确保messageCallback已经被初始化
    await new Promise<void>(resolve => {
      (messageService.listenFromPopup as jest.Mock).mockImplementation(callback => {
        messageCallback = callback;
        resolve();
      });
    });

    const mockState = {
      isRunning: true,
      time: 0,
      lastUpdated: Date.now(),
    };

    // 模拟启动计时器
    messageCallback({
      type: 'TIMER_UPDATE',
      data: mockState,
    });

    // 快进1秒
    await jest.advanceTimersByTimeAsync(1000);

    // 验证计时器更新
    expect(messageService.sendToPopup).toHaveBeenLastCalledWith({
      type: 'TIMER_UPDATE',
      data: expect.objectContaining({
        isRunning: true,
        time: 1,
      }),
    });

    // 快进2秒
    await jest.advanceTimersByTimeAsync(2000);

    // 验证计时器再次更新
    expect(messageService.sendToPopup).toHaveBeenLastCalledWith({
      type: 'TIMER_UPDATE',
      data: expect.objectContaining({
        isRunning: true,
        time: 3,
      }),
    });
  });
});
