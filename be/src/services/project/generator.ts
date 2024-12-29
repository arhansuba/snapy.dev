// src/services/project/generator.ts
import { DeepSeek } from '../../llm/deepseek';
import { ProjectModel } from '../../db/models/Project';
import { logger } from '../../utils/logger';
import path from 'path';
import fs from 'fs-extra';
import { Zipper } from './zipper';

interface GenerateProjectOptions {
  name: string;
  description?: string;
  framework: 'react' | 'vue' | 'angular';
  styling: 'tailwind' | 'css' | 'scss';
  features: string[];
}

interface ProjectFile {
  path: string;
  content: string;
}

export class ProjectGenerator {
  private llm: DeepSeek;
  private zipper: Zipper;

  constructor() {
    this.llm = new DeepSeek();
    this.zipper = new Zipper();
  }

  async generateProject(
    userId: string,
    options: GenerateProjectOptions
  ): Promise<{ projectId: string; files: ProjectFile[] }> {
    try {
      logger.info('Starting project generation', { userId, ...options });

      // Generate project structure
      const files = await this.generateProjectFiles(options);

      // Save project to database
      const project = await ProjectModel.create(userId, {
        name: options.name,
        description: options.description,
        files: this.serializeFiles(files),
      });

      // Create temporary directory and save files
      const tempDir = await this.saveTempFiles(files, project.id);

      // Create zip file
      await this.zipper.createZip(tempDir, project.id);

      // Cleanup temporary directory
      await fs.remove(tempDir);

      logger.info('Project generation completed', { projectId: project.id });

      return { projectId: project.id, files };
    } catch (error) {
      logger.error('Project generation failed:', error);
      throw new Error('Failed to generate project');
    }
  }

  private async generateProjectFiles(
    options: GenerateProjectOptions
  ): Promise<ProjectFile[]> {
    const files: ProjectFile[] = [];

    // Generate main component files
    for (const feature of options.features) {
      const componentCode = await this.llm.generateCode({
        type: 'component',
        framework: options.framework,
        prompt: `Create a ${feature} component with ${options.styling} styling`,
      });

      files.push({
        path: `src/components/${this.formatFileName(feature)}.${this.getFileExtension(options.framework)}`,
        content: componentCode.text,
      });
    }

    // Generate project configuration files
    const configFiles = await this.generateConfigFiles(options);
    files.push(...configFiles);

    // Generate main application files
    const mainFiles = await this.generateMainFiles(options);
    files.push(...mainFiles);

    return files;
  }

  private async generateConfigFiles(
    options: GenerateProjectOptions
  ): Promise<ProjectFile[]> {
    const configs: ProjectFile[] = [];

    // Package.json
    const packageJson = await this.llm.generateCode({
      type: 'full',
      prompt: `Generate package.json for a ${options.framework} project with ${options.styling}`,
    });
    configs.push({
      path: 'package.json',
      content: packageJson.text,
    });

    // Configuration files based on framework
    switch (options.framework) {
      case 'react':
        configs.push({
          path: 'tsconfig.json',
          content: await this.getReactTsConfig(),
        });
        if (options.styling === 'tailwind') {
          configs.push({
            path: 'tailwind.config.js',
            content: await this.getTailwindConfig(),
          });
        }
        break;
      // Add configurations for other frameworks
    }

    return configs;
  }
  getReactTsConfig(): string | PromiseLike<string> {
    throw new Error('Method not implemented.');
  }
  getTailwindConfig(): string | PromiseLike<string> {
    throw new Error('Method not implemented.');
  }

  private async generateMainFiles(
    options: GenerateProjectOptions
  ): Promise<ProjectFile[]> {
    const mainFiles: ProjectFile[] = [];

    // Main app file
    const mainApp = await this.llm.generateCode({
      type: 'full',
      framework: options.framework,
      prompt: `Create main app file that imports and uses all components`,
    });

    mainFiles.push({
      path: `src/App.${this.getFileExtension(options.framework)}`,
      content: mainApp.text,
    });

    // Index file
    const index = await this.llm.generateCode({
      type: 'full',
      framework: options.framework,
      prompt: `Create index file that sets up the application`,
    });

    mainFiles.push({
      path: `src/index.${this.getFileExtension(options.framework)}`,
      content: index.text,
    });

    return mainFiles;
  }

  private getFileExtension(framework: string): string {
    switch (framework) {
      case 'react':
      case 'vue':
        return 'tsx';
      case 'angular':
        return 'ts';
      default:
        return 'js';
    }
  }

  private formatFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  private serializeFiles(files: ProjectFile[]): Record<string, any> {
    return files.reduce(
      (acc, file) => ({
        ...acc,
        [file.path]: file.content,
      }),
      {}
    );
  }

  private async saveTempFiles(
    files: ProjectFile[],
    projectId: string
  ): Promise<string> {
    const tempDir = path.join(__dirname, '../../../temp', projectId);
    await fs.ensureDir(tempDir);

    for (const file of files) {
      const filePath = path.join(tempDir, file.path);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content);
    }

    return tempDir;
  }
}