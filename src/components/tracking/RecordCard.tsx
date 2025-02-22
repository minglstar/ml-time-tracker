import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { TimerRecord, Project } from '../../types/types';

interface RecordCardProps {
  record: TimerRecord;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, record: TimerRecord) => void;
  formatTime: (time: number) => string;
  projects?: Project[];
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onMenuClick, formatTime, projects }) => {
  const [isTimeSegmentsOpen, setIsTimeSegmentsOpen] = useState(false);

  const handleTimeSegmentsClick = () => {
    setIsTimeSegmentsOpen(true);
  };

  const handleTimeSegmentsClose = () => {
    setIsTimeSegmentsOpen(false);
  };

  const formatSegmentTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card 
      variant="outlined" 
      sx={{
        backgroundColor: '#f5f5f5',
        position: 'relative',
        height: '120px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ flex: 1, pb: '40px !important' }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          {record.title}
        </Typography>
        {record.projectId && projects && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {projects.find(p => p.id === record.projectId)?.name}
          </Typography>
        )}
        
        <Box sx={{ 
          position: 'absolute',
          bottom: 8,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="body2" color="text.secondary">
            {formatTime(record.time)}
          </Typography>
          {record.timeSegments && record.timeSegments.length > 0 && (
            <IconButton
              size="small"
              onClick={handleTimeSegmentsClick}
              sx={{ p: 0.5 }}
            >
              <AccessTimeIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8
          }}
          onClick={(e) => onMenuClick(e, record)}
        >
          <MoreHorizIcon />
        </IconButton>
      </CardContent>

      <Dialog
        open={isTimeSegmentsOpen}
        onClose={handleTimeSegmentsClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>时间段列表</DialogTitle>
        <DialogContent>
          <List>
            {record.timeSegments?.map((segment, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`时间段 ${index + 1}`}
                  secondary={`${formatSegmentTime(segment.startTime)} - ${formatSegmentTime(segment.endTime)}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RecordCard;