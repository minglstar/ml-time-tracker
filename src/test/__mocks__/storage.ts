// 模拟 storage 模块
export const getTimerState = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    isRunning: false,
    currentTime: 0,
  });
});

export const saveTimerState = jest.fn().mockImplementation(() => {
  return Promise.resolve();
});

export const getAllTimerStates = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    'test-task-1': {
      isRunning: false,
      currentTime: 0,
    },
  });
});

// 添加获取 timerState 的方法
export const getStorageItem = jest.fn().mockImplementation(key => {
  if (key === 'timerState') {
    return Promise.resolve(null);
  }
  if (key === 'savedTimers') {
    return Promise.resolve({});
  }
  return Promise.resolve(null);
});
