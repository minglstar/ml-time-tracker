import React from 'react';

interface TimerControlsProps {
    isRunning: boolean;
    onStartStop: () => void;
    onReset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isRunning, onStartStop, onReset }) => {
    return (
        <div className="button-container">
            <button onClick={onStartStop}>{isRunning ? 'Stop' : 'Start'}</button>
            <button onClick={onReset}>Reset</button>
        </div>
    );
};

export default TimerControls;
