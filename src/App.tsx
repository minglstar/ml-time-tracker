import React, { useEffect } from 'react';
import { Box, Container, ThemeProvider, createTheme } from '@mui/material';
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

const theme = createTheme({
  components: {
    MuiDialog: {
      defaultProps: {
        disableScrollLock: true,
      },
      styleOverrides: {
        paper: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: 8,
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disableScrollLock: true,
          PaperProps: {
            sx: {
              mt: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  const { isRunning, time, startStop, initState } = useTimerStore();
  const { title, selectedProject, setTitle, setSelectedProject, loadTask } = useTaskStore();
  const { projects, loadProjects } = useProjectStore();
  const { records, saveRecord, deleteRecord, continueRecord, loadRecords } = useRecordStore();

  useEffect(() => {
    void Promise.all([
      initState().catch(error => console.error('初始化计时器状态失败:', error)),
      loadRecords().catch(error => console.error('加载记录失败:', error)),
      loadProjects().catch(error => console.error('加载项目失败:', error)),
      loadTask().catch(error => console.error('加载任务信息失败:', error)),
    ]);
  }, [initState, loadProjects, loadRecords, loadTask]);

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
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ p: 0, minHeight: '100vh', bgcolor: 'transparent' }}>
        <Box sx={{ p: 3, bgcolor: 'white', minHeight: '100vh' }}>
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
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
