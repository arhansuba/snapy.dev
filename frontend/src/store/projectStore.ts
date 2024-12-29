// frontend/src/store/projectStore.ts
import { create } from 'zustand';
import { Project, ProjectState } from '../../../shared/types/project';
import { api } from '../utils/api';

interface ProjectStore extends ProjectState {
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  resetProjectState: () => void;
}

const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  loading: false,
  error: null,
};

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  ...initialState,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await api.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        loading: false
      });
    }
  },

  fetchProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const project = await api.getProject(id);
      set({ currentProject: project, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        loading: false
      });
    }
  },

  createProject: async (data: Partial<Project>) => {
    set({ loading: true, error: null });
    try {
      const newProject = await api.createProject(data);
      set((state) => ({
        projects: [...state.projects, newProject],
        currentProject: newProject,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        loading: false
      });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    set({ loading: true, error: null });
    try {
      const updatedProject = await api.updateProject(id, data);
      set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? updatedProject : p
        ),
        currentProject: updatedProject,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
        loading: false
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
        loading: false
      });
      throw error;
    }
  },

  resetProjectState: () => {
    set(initialState);
  },
}));