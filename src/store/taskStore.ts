import { create } from 'zustand';

interface TaskStore {
  // 任务状态
  title: string;
  selectedProject: string;

  // 操作方法
  setTitle: (title: string) => void;
  setSelectedProject: (projectId: string) => void;
  clearTask: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  // 初始状态
  title: '',
  selectedProject: '',

  // 任务操作
  setTitle: (title: string) => set({ title }),
  setSelectedProject: (projectId: string) => set({ selectedProject: projectId }),
  clearTask: () => set({ title: '', selectedProject: '' })
}));