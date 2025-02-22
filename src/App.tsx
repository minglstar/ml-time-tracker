import React, { useState, useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import HeaderControls from './components/common/HeaderControls';
import TaskInfoEditor from './components/common/TaskInfoEditor';
import TrackingRecords from './components/tracking/TrackingRecords';
import TimerDisplay from './components/timer/TimerDisplay';
import TimerControls from './components/timer/TimerControls';
import { useTimer } from './hooks/useTimer';
import { TimerRecord, Project } from './types/types';
import { storageUtils } from './utils/storage';
import { generateId } from './utils/idGenerator';
import './App.css';

const App: React.FC = () => {
  const { isRunning, time, startStop, reset, startTime } = useTimer();
  const [title, setTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [records, setRecords] = useState<TimerRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      const savedRecords = await storageUtils.getTimerRecords();
      setRecords(savedRecords);
    };
    loadRecords();
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      const savedProjects = await storageUtils.getProjects();
      setProjects(savedProjects);
    };
    loadProjects();
  }, []);

  const handleStartStop = async () => {
    const newIsRunning = await startStop();
    
    if (!newIsRunning && time > 0) {
      const currentDate = new Date().toLocaleDateString();
      const endTime = new Date().getTime();
      const newTimeSegment = {
        startTime: startTime || endTime - (time * 1000),
        endTime,
        duration: time
      };

      const existingRecord = records.find(record => 
        record.title === title && 
        record.date === currentDate
      );
      
      if (existingRecord) {
        const updatedRecords = records.map(record => {
          if (record.id === existingRecord.id) {
            return {
              ...record,
              time: record.time + time,
              timeSegments: [...(record.timeSegments || []), newTimeSegment],
              projectId: selectedProject || record.projectId
            };
          }
          return record;
        });
        setRecords(updatedRecords);
        await storageUtils.saveTimerRecords(updatedRecords);
      } else {
        const newRecord: TimerRecord = {
          id: generateId(),
          date: currentDate,
          title,
          time,
          timeSegments: [newTimeSegment],
          projectId: selectedProject || undefined
        };
        const updatedRecords = [newRecord, ...records];
        setRecords(updatedRecords);
        await storageUtils.saveTimerRecords(updatedRecords);
      }
      
      reset();
      setTitle('');
      setSelectedProject('');
    }
  };

  const handleEditTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleDeleteRecord = async (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    await storageUtils.saveTimerRecords(updatedRecords);
  };

  const handleContinueRecord = (record: TimerRecord) => {
    setTitle(record.title);
    setSelectedProject(record.projectId || '');
    reset();
    startStop();
  };

  return (
    <Container maxWidth="sm" sx={{ p: 0 }}>
      <Paper elevation={3} sx={{ minHeight: '100vh', p: 3, borderRadius: 0 }}>
        <HeaderControls />

        <TaskInfoEditor
          title={title}
          selectedProject={selectedProject}
          onEditTitle={handleEditTitle}
          onSelectProject={setSelectedProject}
        />

        <TimerDisplay time={time} />

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, mt: -2 }}>
          <TimerControls
            isRunning={isRunning}
            onStartStop={handleStartStop}
            onReset={reset}
          />
        </Box>

        <TrackingRecords
          records={records}
          onDeleteRecord={handleDeleteRecord}
          onContinueRecord={handleContinueRecord}
          projects={projects}
        />
      </Paper>
    </Container>
  );
};

export default App;
