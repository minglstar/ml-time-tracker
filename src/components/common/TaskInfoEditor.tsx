import React, { useState, useEffect } from 'react';
import { generateId } from '../../utils/idGenerator';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import { Project } from '../../types/types';
import { storageUtils } from '../../utils/storage';

interface NewProject {
  name: string;
  color: string;
  description: string;
}

interface TaskInfoEditorProps {
  title: string;
  selectedProject?: string;
  onEditTitle: (newTitle: string) => void;
  onSelectProject?: (projectId: string) => void;
}

const TaskInfoEditor: React.FC<TaskInfoEditorProps> = ({
  title,
  selectedProject: initialSelectedProject,
  onEditTitle,
  onSelectProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [localSelectedProject, setLocalSelectedProject] = useState<string>(
    initialSelectedProject ?? ''
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<NewProject>({
    name: '',
    color: '#000000',
    description: '',
  });

  useEffect(() => {
    setLocalSelectedProject(initialSelectedProject ?? '');
  }, [initialSelectedProject]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const savedProjects = await storageUtils.getProjects();
        setProjects(savedProjects);
      } catch (error) {
        console.error('加载项目失败:', error);
      }
    };
    void loadProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      if (!newProject.name) return;

      const project: Project = {
        id: generateId(),
        ...newProject,
      };

      const updatedProjects = [...projects, project];
      await storageUtils.saveProjects(updatedProjects);
      setProjects(updatedProjects);
      setIsDialogOpen(false);
      setNewProject({ name: '', color: '#000000', description: '' });
    } catch (error) {
      console.error('创建项目失败:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      await storageUtils.saveProjects(updatedProjects);
      setProjects(updatedProjects);
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="任务描述"
          value={title}
          onChange={e => onEditTitle(e.target.value)}
          size="small"
        />
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>选择项目</InputLabel>
          <Select
            value={localSelectedProject}
            label="选择项目"
            onChange={e => {
              const value = e.target.value;
              setLocalSelectedProject(value);
              onSelectProject?.(value);
            }}
            renderValue={value => {
              const project = projects.find(p => p.id === value);
              return project ? (
                <span style={{ color: project.color, fontWeight: 'bold' }}>{project.name}</span>
              ) : (
                ''
              );
            }}
          >
            {projects.map(project => (
              <MenuItem
                key={project.id}
                value={project.id}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: project.color, fontWeight: 'bold' }}>{project.name}</span>
                <IconButton
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    void handleDeleteProject(project.id);
                  }}
                  sx={{ ml: 1 }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </MenuItem>
            ))}
            <MenuItem>
              <Button
                startIcon={<Add />}
                onClick={() => setIsDialogOpen(true)}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                创建新项目
              </Button>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} disableScrollLock>
        <DialogTitle>创建新项目</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="项目名称"
            fullWidth
            value={newProject.name}
            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="项目描述"
            fullWidth
            value={newProject.description}
            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="项目颜色"
            type="color"
            fullWidth
            value={newProject.color}
            onChange={e => setNewProject({ ...newProject, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>取消</Button>
          <Button onClick={() => void handleCreateProject()}>创建</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskInfoEditor;
