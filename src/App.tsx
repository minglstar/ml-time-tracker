import React, { useState, useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import HeaderControls from './components/common/HeaderControls';
import TaskInfoEditor from './components/common/TaskInfoEditor';
import TrackingRecords from './components/tracking/TrackingRecords';
import TimerDisplay from './components/timer/TimerDisplay';
import TimerControls from './components/timer/TimerControls';
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
      
      // Reset timer and clear task info
      reset();
      setTitle('');
      setEarned('');
      setCustomer('');
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

  const handleDeleteRecord = async (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    await storageUtils.saveTimerRecords(updatedRecords);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <HeaderControls />

        <TaskInfoEditor
          title={title}
          earned={earned}
          customer={customer}
          onEditTitle={handleEditTitle}
          onEditEarned={handleEditEarned}
          onEditCustomer={handleEditCustomer}
        />

        <TimerDisplay time={time} />

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, mt: -2 }}>
          <TimerControls
            isRunning={isRunning}
            onStartStop={handleStartStop}
            onReset={reset}
          />
        </Box>

        <TrackingRecords records={records} onDeleteRecord={handleDeleteRecord} />
      </Paper>
    </Container>
  );
};

export default App;
