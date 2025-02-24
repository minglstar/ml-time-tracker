import React from 'react';
import { Box, IconButton } from '@mui/material';
import { NotificationsOutlined, Refresh } from '@mui/icons-material';

interface HeaderControlsProps {
  onNotification?: () => void;
  onRefresh?: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({ onNotification, onRefresh }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <IconButton color="primary" onClick={onNotification}>
      <NotificationsOutlined />
    </IconButton>
    <IconButton color="primary" onClick={onRefresh}>
      <Refresh />
    </IconButton>
  </Box>
);

export default HeaderControls;
