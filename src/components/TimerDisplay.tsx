import React from 'react';
import { Box, Typography } from '@mui/material';

interface TimerDisplayProps {
    time: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time }) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 3,
                backgroundColor: 'primary.main',
                borderRadius: 2,
                margin: 2
            }}
        >
            <Typography
                variant="h2"
                component="div"
                sx={{
                    fontWeight: 'bold',
                    color: 'white',
                    fontFamily: 'monospace'
                }}
            >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Typography>
        </Box>
    );
};

export default TimerDisplay;
