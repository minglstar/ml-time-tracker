import React from 'react';
import { List, ListItem, ListItemText, Divider, Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { TimerRecord } from '../../types/types';

interface TrackingRecordsProps {
  records: TimerRecord[];
  onDeleteRecord: (id: string) => void;
}

const TrackingRecords: React.FC<TrackingRecordsProps> = ({ records, onDeleteRecord }) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const groupRecordsByDate = (records: TimerRecord[]) => {
    const groups: { [key: string]: TimerRecord[] } = {};
    records.forEach(record => {
      if (!groups[record.date]) {
        groups[record.date] = [];
      }
      groups[record.date].push(record);
    });
    return groups;
  };

  const calculateDailyTotal = (records: TimerRecord[]) => {
    return records.reduce((total, record) => total + record.time, 0);
  };

  return (
    <List sx={{ mt: 3 }}>
      {Object.entries(groupRecordsByDate(records)).map(([date, dateRecords]) => (
        <React.Fragment key={date}>
          <ListItem sx={{ bgcolor: 'grey.100' }}>
            <ListItemText
              primary={date}
              secondary={`总时间: ${formatTime(calculateDailyTotal(dateRecords))}`}
            />
          </ListItem>
          <Divider />
          {dateRecords.map(record => (
            <ListItem
              key={record.id}
              divider
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <ListItemText
                primary={record.title}
                secondary={`${record.customer ? `客户: ${record.customer}` : ''} ${record.earned ? `收入: ${record.earned}` : ''}`}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>
                  {formatTime(record.time)}
                </Typography>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDeleteRecord(record.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TrackingRecords;