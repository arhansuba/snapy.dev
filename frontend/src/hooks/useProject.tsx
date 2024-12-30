import { createContext, useContext, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Project, CreateProjectRequest, UpdateProjectRequest, ProjectFiles } from '../types/project';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: Error | null;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Promise<Project>;
  updateProjectFiles: (id: string, files: ProjectFiles) => Promise<Project>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL;

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/projects`);
      return data;
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectRequest) => {
      const { data } = await axios.post(`${API_URL}/projects`, projectData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectRequest }) => {
      const { data: response } = await axios.put(`${API_URL}/projects/${id}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const updateProjectFilesMutation = useMutation({
    mutationFn: async ({ id, files }: { id: string; files: ProjectFiles }) => {
      const { data } = await axios.put(`${API_URL}/projects/${id}/files`, { files });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  const createProject = useCallback(async (data: CreateProjectRequest) => {
    return createProjectMutation.mutateAsync(data);
  }, [createProjectMutation]);

  const updateProject = useCallback(async (id: string, data: UpdateProjectRequest) => {
    return updateProjectMutation.mutateAsync({ id, data });
  }, [updateProjectMutation]);

  const deleteProject = useCallback(async (id: string) => {
    return deleteProjectMutation.mutateAsync(id);
  }, [deleteProjectMutation]);

  const getProject = useCallback(async (id: string) => {
    const { data } = await axios.get(`${API_URL}/projects/${id}`);
    return data;
  }, []);

  const updateProjectFiles = useCallback(async (id: string, files: ProjectFiles) => {
    return updateProjectFilesMutation.mutateAsync({ id, files });
  }, [updateProjectFilesMutation]);

  const value = useMemo(() => ({
    projects,
    currentProject: null,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    updateProjectFiles,
  }), [
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    updateProjectFiles,
  ]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  
  return context;
}