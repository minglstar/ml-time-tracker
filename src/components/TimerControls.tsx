import React from 'react';
import { Box, IconButton } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';

interface TimerControlsProps {
    isRunning: boolean;
    onStartStop: () => void;
    onReset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isRunning, onStartStop }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                margin: 2
            }}
        >
            <IconButton
                onClick={onStartStop}
                sx={{
                    backgroundColor: isRunning ? 'error.main' : 'success.main',
                    color: 'white',
                    width: 56,
                    height: 56,
                    '&:hover': {
                        backgroundColor: isRunning ? 'error.dark' : 'success.dark',
                    }
                }}
            >
                {isRunning ? <Stop /> : <PlayArrow />}
            </IconButton>
        </Box>
    );
};

export default TimerControls;
