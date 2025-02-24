import React, { useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import HeaderControls from './components/common/HeaderControls';
import TaskInfoEditor from './components/common/TaskInfoEditor';
import TrackingRecords from './components/tracking/TrackingRecords';
import TimerDisplay from './components/timer/TimerDisplay';
import TimerControls from './components/timer/TimerControls';
import { useTimerStore } from './store/timerStore';
import { useTaskStore } from './store/taskStore';
import { useProjectStore } from './store/projectStore';
import { useRecordStore } from './store/recordStore';
import { TimerRecord } from './types/types';
import './App.css';

const App: React.FC = () => {
  const { isRunning, time, startStop } = useTimerStore();
  const { title, selectedProject, setTitle, setSelectedProject } = useTaskStore();
  const { projects, loadProjects } = useProjectStore();
  const { records, saveRecord, deleteRecord, continueRecord, loadRecords } = useRecordStore();

  useEffect(() => {
    void Promise.all([
      loadRecords().catch(error => console.error('加载记录失败:', error)),
      loadProjects().catch(error => console.error('加载项目失败:', error)),
    ]);
  }, [loadProjects, loadRecords]);

  const handleStartStop = () => {
    void (async () => {
      const newIsRunning = await startStop();
      if (!newIsRunning && time > 0) {
        await saveRecord(title, time, selectedProject);
        setTitle('');
        setSelectedProject('');
      }
    })();
  };

  const handleEditTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleDeleteRecord = (id: string) => {
    void deleteRecord(id);
  };

  const handleContinueRecord = (record: TimerRecord) => {
    continueRecord(record);
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

        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, mt: -2 }}
        >
          <TimerControls isRunning={isRunning} onStartStop={handleStartStop} />
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
