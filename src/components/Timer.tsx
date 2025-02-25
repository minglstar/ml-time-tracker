import React, { useState, useEffect } from 'react';
import { messageService } from '../utils/messageService';

interface TimerProps {
  taskId: string;
}

const Timer: React.FC<TimerProps> = ({ taskId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // 监听来自后台的状态更新
    const handleTimerUpdate = (message: any) => {
      if (message.type === 'TIMER_STATE_UPDATE' && message.data.taskId === taskId) {
        setIsRunning(message.data.isRunning);
        setCurrentTime(message.data.currentTime);
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
      <div className="time-display">{formatTime(currentTime)}</div>
      <button className={`timer-button ${isRunning ? 'running' : ''}`} onClick={handleStartStop}>
        {isRunning ? '停止' : '开始'}
      </button>
    </div>
  );
};

export default Timer;
