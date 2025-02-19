import React from 'react';

interface TimerDisplayProps {
    time: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time }) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return (
        <div className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
};

export default TimerDisplay;
