import { PrismaClient, Prisma } from '@prisma/client';
import { DatabaseError } from './types';
import { getPrismaClient } from '../connection';

// Define the valid framework and styling values
const VALID_FRAMEWORKS = ['react', 'vue', 'angular'] as const;
const VALID_STYLING = ['tailwind', 'css', 'scss'] as const;

type Framework = typeof VALID_FRAMEWORKS[number];
type Styling = typeof VALID_STYLING[number];

export interface CreateProjectRequest {
  name: string;
  description?: string;
  files: Prisma.InputJsonValue;
  framework?: Framework;
  styling?: Styling;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  framework: typeof VALID_FRAMEWORKS[number];
  styling: typeof VALID_STYLING[number];
  files: Record<string, string>;
}

export class ProjectModel {
  private static prisma = getPrismaClient();

  static async create(
    userId: string, 
    data: CreateProjectRequest
  ) {
    try {
      const projectData: Prisma.ProjectCreateInput = {
        user: { connect: { id: userId } },
        name: data.name,
        description: data.description,
        files: data.files,
        framework: data.framework || 'react',
        styling: data.styling || 'tailwind',
      };

      return await this.prisma.project.create({
        data: projectData
      });
    } catch (error) {
      throw new DatabaseError('Error creating project');
    }
  }

  static async findById(id: string) {
    try {
      return await this.prisma.project.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding project');
    }
  }

  static async getUserProjects(userId: string) {
    try {
      return await this.prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Error getting user projects');
    }
  }

  static async update(
    id: string, 
    data: Partial<CreateProjectRequest>
  ) {
    try {
      const projectData: Prisma.ProjectUpdateInput = {
        name: data.name,
        description: data.description,
        files: data.files as Prisma.InputJsonValue,
        ...(data.framework && { framework: data.framework }),
        ...(data.styling && { styling: data.styling }),
        updatedAt: new Date(),
      };

      return await this.prisma.project.update({
        where: { id },
        data: projectData,
      });
    } catch (error) {
      throw new DatabaseError('Error updating project');
    }
  }

  static async updateFile(
    id: string,
    path: string,
    content: string
  ) {
    try {
      const project = await this.findById(id);
      if (!project) {
        throw new DatabaseError('Project not found');
      }

      const files = project.files as Record<string, any>;
      const updatedFiles = {
        ...files,
        [path]: content
      };

      return await this.update(id, { files: updatedFiles });
    } catch (error) {
      throw new DatabaseError('Error updating file');
    }
  }

  static async delete(id: string) {
    try {
      await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError('Error deleting project');
    }
  }
}