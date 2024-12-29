// src/db/models/ProjectModel.ts
import { PrismaClient, Project } from '@prisma/client';
import { CreateProjectRequest, DatabaseError } from './types';
import { getPrismaClient } from '../connection';

export class ProjectModel {
  private static prisma = getPrismaClient();

  static async create(userId: string, data: CreateProjectRequest): Promise<Project> {
    try {
      return await this.prisma.project.create({
        data: {
          ...data,
          userId,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error creating project');
    }
  }

  static async findById(id: string): Promise<Project | null> {
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

  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Error getting user projects');
    }
  }

  static async update(id: string, data: Partial<CreateProjectRequest>): Promise<Project> {
    try {
      return await this.prisma.project.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new DatabaseError('Error updating project');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError('Error deleting project');
    }
  }
}