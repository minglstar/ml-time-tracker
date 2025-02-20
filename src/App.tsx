import React, { useState, useEffect } from 'react';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import { storageUtils } from './utils/storage';
import './App.css';

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  // 保存状态的函数
  const saveState = async () => {
    try {
      const state = {
        isRunning,
        time,
        lastUpdated: Date.now()
      };
      console.log('Saving timer state:', state);
      await storageUtils.saveTimerState(state);
      console.log('Timer state saved successfully');
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  };

  // 加载保存的状态
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        console.log('Loading saved timer state...');
        const savedState = await storageUtils.getTimerState();
        console.log('Loaded timer state:', savedState);
        if (savedState) {
          if (savedState.lastUpdated && savedState.isRunning) {
            const elapsedSeconds = Math.floor((Date.now() - savedState.lastUpdated) / 1000);
            const newTime = savedState.time + elapsedSeconds;
            console.log(`Updating time with elapsed seconds: ${elapsedSeconds}, new time: ${newTime}`);
            setTime(newTime);
          } else {
            setTime(savedState.time);
          }
          setIsRunning(savedState.isRunning);
        }
      } catch (error) {
        console.error('Failed to load timer state:', error);
      }
    };
    loadSavedState();
  }, []);

  // 处理计时和状态保存
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let saveIntervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);

      // 每次时间更新时保存状态
      saveIntervalId = setInterval(saveState, 1000);
    }

    // 组件卸载或状态变化时保存
    const handleBeforeUnload = async () => {
      console.log('Window unloading, saving final state...');
      await saveState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (saveIntervalId) clearInterval(saveIntervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // 确保在组件卸载时保存最终状态
      saveState();
    };
  }, [isRunning, time]); // 添加time作为依赖项

  const handleStartStop = async () => {
    const newIsRunning = !isRunning;
    console.log(`Timer ${newIsRunning ? 'started' : 'stopped'}`);
    setIsRunning(newIsRunning);
    await saveState();
  };

  const handleReset = async () => {
    console.log('Resetting timer...');
    setIsRunning(false);
    setTime(0);
    await storageUtils.clearTimerState();
    console.log('Timer reset complete');
  };

  return (
    <div className="app-container">
      <h1>Time Tracker</h1>
      <TimerDisplay time={time} />
      <TimerControls
        isRunning={isRunning}
        onStartStop={handleStartStop}
        onReset={handleReset}
      />
    </div>
  );
};

export default App;
