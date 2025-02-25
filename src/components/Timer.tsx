import React, { useState, useEffect } from 'react';
import { messageService } from '../utils/messageService';
import '../styles/Timer.css';

// 格式化时间函数
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
};

interface TimerProps {
  taskId: string;
}

const Timer: React.FC<TimerProps> = ({ taskId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showRestoreNotice, setShowRestoreNotice] = useState(false);

  useEffect(() => {
    // 请求初始状态
    const requestInitialState = async () => {
      try {
        const response = await messageService.sendToBackground({
          type: 'REQUEST_TIMER_STATE',
          data: { taskId },
        });

        if (response && response.currentTime !== undefined) {
          setCurrentTime(response.currentTime);
          setIsRunning(response.isRunning);
        }
      } catch (error) {
        console.error('获取计时器状态失败:', error);
      }
    };

    void requestInitialState();

    // 监听来自后台的状态更新
    const handleTimerUpdate = (message: any) => {
      if (message.type === 'TIMER_STATE_UPDATE' && message.data.taskId === taskId) {
        setIsRunning(message.data.isRunning);
        setCurrentTime(message.data.currentTime);
      } else if (message.type === 'TIMER_RESTORED' && message.data.taskId === taskId) {
        // 显示计时器已恢复的通知
        setShowRestoreNotice(true);
        // 5秒后自动隐藏通知
        setTimeout(() => setShowRestoreNotice(false), 5000);
      }
    };

    messageService.listenFromBackground(handleTimerUpdate);

    // 组件卸载时清理监听器
    return () => {
      messageService.removeListener(handleTimerUpdate);
    };
  }, [taskId]);

  const handleStartStop = async () => {
    try {
      await messageService.sendToBackground({
        type: isRunning ? 'STOP_TIMER' : 'START_TIMER',
        data: { taskId },
      });
    } catch (error) {
      console.error('Failed to toggle timer:', error);
    }
  };

  return (
    <div className="timer">
      {showRestoreNotice && <div className="restore-notice">计时器已从上次会话恢复</div>}
      <div className="time-display">{formatTime(currentTime)}</div>
      <button className={`timer-button ${isRunning ? 'running' : ''}`} onClick={handleStartStop}>
        {isRunning ? '停止' : '开始'}
      </button>
    </div>
  );
};

export default Timer;
