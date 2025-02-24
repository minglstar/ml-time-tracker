import { create } from 'zustand';
import { storageUtils } from '../utils/storage';

interface TaskStore {
  // 任务状态
  title: string;
  selectedProject: string;

  // 操作方法
  setTitle: (title: string) => void;
  setSelectedProject: (projectId: string) => void;
  clearTask: () => void;
  loadTask: () => Promise<void>;
  saveTask: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // 初始状态
  title: '',
  selectedProject: '',

  // 任务操作
  setTitle: (title: string) => {
    set({ title });
    void get().saveTask();
  },
  setSelectedProject: (projectId: string) => {
    set({ selectedProject: projectId });
    void get().saveTask();
  },
  clearTask: () => {
    set({ title: '', selectedProject: '' });
    void get().saveTask();
  },
  loadTask: async () => {
    const result = await chrome.storage.local.get(['taskTitle', 'taskProject']);
    set({
      title: result.taskTitle || '',
      selectedProject: result.taskProject || ''
    });
  },
  saveTask: async () => {
    const { title, selectedProject } = get();
    await chrome.storage.local.set({
      taskTitle: title,
      taskProject: selectedProject
    });
  }
}));
