import { create } from 'zustand';
import { Project } from '../types/types';
import { storageUtils } from '../utils/storage';

interface ProjectStore {
  // 项目状态
  projects: Project[];

  // 操作方法
  loadProjects: () => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // 初始状态
  projects: [],

  // 项目操作
  loadProjects: async () => {
    const projects = await storageUtils.getProjects();
    set({ projects });
  },

  addProject: async (project: Project) => {
    const projects = [...get().projects, project];
    set({ projects });
    await storageUtils.saveProjects(projects);
  },

  updateProject: async (project: Project) => {
    const projects = get().projects.map(p => (p.id === project.id ? project : p));
    set({ projects });
    await storageUtils.saveProjects(projects);
  },

  deleteProject: async (id: string) => {
    const projects = get().projects.filter(p => p.id !== id);
    set({ projects });
    await storageUtils.saveProjects(projects);
  },
}));
