import { useState, useEffect, useRef } from 'react';
import { storageUtils } from '../utils/storage';
import { TimerState } from '../types/types';

export const useTimer = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const isRunningRef = useRef(isRunning);
    const timeRef = useRef(time);

    const saveState = async () => {
        const state: TimerState = {
            isRunning: isRunningRef.current,
            time: timeRef.current,
            lastUpdated: new Date().getTime()
        };
        await storageUtils.saveTimerState(state);
    };

    useEffect(() => {
        const loadState = async () => {
            const savedState = await storageUtils.getTimerState();
            if (savedState) {
                isRunningRef.current = savedState.isRunning;
                timeRef.current = savedState.time;
                setIsRunning(savedState.isRunning);
                
                if (savedState.isRunning && savedState.lastUpdated) {
                    const elapsedTime = Math.floor((new Date().getTime() - savedState.lastUpdated) / 1000);
                    timeRef.current = savedState.time + elapsedTime;
                    setTime(timeRef.current);
                } else {
                    setTime(savedState.time);
                }
            }
        };
        loadState();
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isRunning) {
            intervalId = setInterval(() => {
                timeRef.current += 1;
                setTime(timeRef.current);
            }, 1000);
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveState();
            }
        };

        window.addEventListener('beforeunload', saveState);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (intervalId) clearInterval(intervalId);
            window.removeEventListener('beforeunload', saveState);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            saveState();
        };
    }, [isRunning]);

    const startStop = async () => {
        const newIsRunning = !isRunningRef.current;
        isRunningRef.current = newIsRunning;
        setIsRunning(newIsRunning);
        
        if (newIsRunning) {
            setStartTime(new Date().getTime());
        }
        
        await saveState();
        return newIsRunning;
    };

    const reset = async () => {
        isRunningRef.current = false;
        timeRef.current = 0;
        setIsRunning(false);
        setTime(0);
        setStartTime(null);
        await saveState();
    };

    return { isRunning, time, startStop, reset, startTime };
};
