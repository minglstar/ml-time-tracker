import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { TimerRecord, Project } from '../../types/types';
import RecordCard from './RecordCard';

interface DateGroupProps {
  date: string;
  records: TimerRecord[];
  formatTime: (time: number) => string;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, record: TimerRecord) => void;
  onMenuClose: () => void;
  projects?: Project[];
}

const DateGroup: React.FC<DateGroupProps> = ({ date, records, formatTime, onMenuClick, projects }) => {
  const calculateDailyTotal = (records: TimerRecord[]) => {
    return records.reduce((total, record) => total + record.time, 0);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {date} - 总时间: {formatTime(calculateDailyTotal(records))}
      </Typography>
      <Grid container spacing={2}>
        {records.map(record => (
          <Grid item xs={6} key={record.id}>
            <RecordCard
              record={record}
              onMenuClick={onMenuClick}
              formatTime={formatTime}
              projects={projects}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DateGroup;