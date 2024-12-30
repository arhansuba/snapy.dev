// Project Types
export enum ProjectType {
    COMPONENT = 'component',
    PAGE = 'page',
    API = 'api',
    FULL_APP = 'full-app'
   }
   
   export enum ProjectFramework {
    REACT = 'react',
    VUE = 'vue', 
    ANGULAR = 'angular'
   }
   
   export enum ProjectStyling {
    TAILWIND = 'tailwind',
    CSS = 'css',
    SCSS = 'scss'
   }
   
   // Base project interface
   export interface Project {
    id: string;
    userId: string;
    name: string;
    description?: string;
    framework: ProjectFramework;
    styling: ProjectStyling;
    files: ProjectFiles;
    createdAt: Date;
    updatedAt: Date;
   }
   
   // File structure types
   export interface ProjectFiles {
    [path: string]: string | ProjectDirectory;
   }
   
   export interface ProjectDirectory {
    [name: string]: string | ProjectDirectory;
   }
   
   // Generation request types
   export interface GenerateRequest {
    prompt: string;
    type: ProjectType;
    framework?: ProjectFramework;
    styling?: ProjectStyling;
    name?: string;
   }
   
   export interface RegenerateRequest {
    projectId: string;
    filePath: string;
    prompt: string;
   }
   
   // Generation response types
   export interface GenerateResponse {
    success: boolean;
    projectId?: string;
    files?: ProjectFiles;
    code?: string;
    language?: string;
    error?: string;
   }
   
   // Project state management
   export interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;
   }
   
   // Project actions
   export interface CreateProjectRequest {
    name: string;
    description?: string;
    framework: ProjectFramework;
    styling: ProjectStyling;
    files?: ProjectFiles;
   }
   
   export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    files?: ProjectFiles;
   }
   
   // Project context
   export interface ProjectContextType {
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;
    createProject: (data: CreateProjectRequest) => Promise<Project>;
    updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
    deleteProject: (id: string) => Promise<void>;
    getProject: (id: string) => Promise<Project>;
    setCurrentProject: (project: Project | null) => void;
   }
   
   // File operation types
   export interface FileOperation {
    type: 'create' | 'update' | 'delete';
    path: string;
    content?: string;
   }
   
   // Project template
   export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    framework: ProjectFramework;
    styling: ProjectStyling;
    files: ProjectFiles;
    thumbnail?: string;
   }
   
   // Project sharing
   export interface SharedProject extends Project {
    shareId: string;
    sharedBy: string;
    sharedAt: Date;
    accessLevel: 'read' | 'write';
   }
   
   // Export/Import types
   export interface ProjectExport {
    version: string;
    project: Omit<Project, 'id' | 'userId'>;
    metadata: {
      exportedAt: Date;
      exportedBy: string;
    };
   }
   
   export interface ImportResult {
    success: boolean;
    project?: Project;
    error?: string;
    warnings?: string[];
   }
   
   // Project statistics
   export interface ProjectStats {
    totalFiles: number;
    totalLines: number;
    fileTypes: Record<string, number>;
    lastModified: Date;
    generationCount: number;
   }
   
   // Search/Filter types
   export interface ProjectFilter {
    framework?: ProjectFramework;
    styling?: ProjectStyling;
    dateRange?: {
      start: Date;
      end: Date;
    };
    searchTerm?: string;
   }
   
   // Constants
   export const MAX_PROJECT_NAME_LENGTH = 50;
   export const MAX_DESCRIPTION_LENGTH = 500;
   export const SUPPORTED_FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.css', '.scss'];