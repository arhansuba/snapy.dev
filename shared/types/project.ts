// shared/types/project.ts
import { PlanType } from './payment';

export enum ProjectType {
  WEB_APP = 'WEB_APP',
  LANDING_PAGE = 'LANDING_PAGE',
  DASHBOARD = 'DASHBOARD',
  E_COMMERCE = 'E_COMMERCE',
  PORTFOLIO = 'PORTFOLIO',
  CUSTOM = 'CUSTOM'
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED'
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: ProjectType;
  framework: Framework;
  status: ProjectStatus;
  files: ProjectFiles;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  deployedUrl?: string;
  previewUrl?: string;
}

export interface ProjectFiles {
  structure: FileStructure;
  content: Record<string, string>;
  dependencies: Record<string, string>;
}

export interface FileStructure {
  [key: string]: FileNode;
}

export interface FileNode {
  type: 'file' | 'directory';
  name: string;
  path: string;
  children?: FileNode[];
  content?: string;
  size?: number;
  lastModified?: Date;
}

export interface ProjectSettings {
  framework: Framework;
  styling: StylingOption;
  features: Feature[];
  deployment: DeploymentConfig;
  testing: TestingConfig;
  seo: SEOConfig;
}

export interface Framework {
  name: 'react' | 'vue' | 'angular';
  version: string;
  typescript: boolean;
}

export interface StylingOption {
  type: 'tailwind' | 'css' | 'scss';
  config?: Record<string, any>;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface DeploymentConfig {
  provider?: 'vercel' | 'netlify' | 'custom';
  settings?: Record<string, any>;
  environment?: Record<string, string>;
}

export interface TestingConfig {
  framework?: 'jest' | 'vitest' | 'cypress';
  coverage?: boolean;
  e2e?: boolean;
}

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  metadata?: Record<string, string>;
}

export interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  thumbnail?: string;
  settings: ProjectSettings;
  requiredPlan: PlanType;
}