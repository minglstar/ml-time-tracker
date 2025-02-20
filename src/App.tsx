import React, { useState, useEffect } from 'react';
import { Box, Container, IconButton, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { NotificationsOutlined, Refresh, Edit } from '@mui/icons-material';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import { useTimer } from './hooks/useTimer';
import { TimerRecord } from './types/types';
import { storageUtils } from './utils/storage';
import './App.css';

const App: React.FC = () => {
  const { isRunning, time, startStop, reset } = useTimer();
  const [title, setTitle] = useState('Apple Iwork 08 Review');
  const [earned, setEarned] = useState('$450');
  const [customer, setCustomer] = useState('Mark Morton');
  const [records, setRecords] = useState<TimerRecord[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      const savedRecords = await storageUtils.getTimerRecords();
      setRecords(savedRecords);
    };
    loadRecords();
  }, []);

  const handleStartStop = async () => {
    const newIsRunning = await startStop();
    
    if (!newIsRunning && time > 0) {
      const newRecord: TimerRecord = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        title,
        time,
        earned,
        customer
      };
      const updatedRecords = [newRecord, ...records];
      setRecords(updatedRecords);
      await storageUtils.saveTimerRecords(updatedRecords);
    }
  };

  const handleEditTitle = () => {
    const newTitle = prompt('Enter new title:', title);
    if (newTitle) setTitle(newTitle);
  };

  const handleEditEarned = () => {
    const newEarned = prompt('Enter new earned amount:', earned);
    if (newEarned) setEarned(newEarned);
  };

  const handleEditCustomer = () => {
    const newCustomer = prompt('Enter new customer name:', customer);
    if (newCustomer) setCustomer(newCustomer);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <IconButton color="primary">
            <NotificationsOutlined />
          </IconButton>
          <IconButton color="primary">
            <Refresh />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton size="small" onClick={handleEditTitle}>
            <Edit />
          </IconButton>
        </Box>

        <TimerDisplay time={time} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, mr: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
              <Typography color="text.secondary">Earned</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{earned}</Typography>
                <IconButton size="small" onClick={handleEditEarned}>
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography color="text.secondary">Customer</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{customer}</Typography>
                <IconButton size="small" onClick={handleEditCustomer}>
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>

          <TimerControls
            isRunning={isRunning}
            onStartStop={handleStartStop}
            onReset={reset}
          />
        </Box>

        <List sx={{ mt: 3 }}>
          {records.map(record => (
            <ListItem
              key={record.id}
              divider
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <ListItemText
                primary={record.title}
                secondary={record.date}
              />
              <Typography>
                {Math.floor(record.time / 60)}:{String(record.time % 60).padStart(2, '0')}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default App;
