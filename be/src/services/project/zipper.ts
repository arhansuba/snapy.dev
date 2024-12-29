// src/services/project/zipper.ts
import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../../utils/logger';

export class Zipper {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '../../../downloads');
  }

  async createZip(sourceDir: string, projectId: string): Promise<string> {
    const outputPath = path.join(this.outputDir, `${projectId}.zip`);
    await fs.ensureDir(this.outputDir);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      });

      output.on('close', () => {
        logger.info('Project zip created', {
          projectId,
          size: archive.pointer(),
        });
        resolve(outputPath);
      });

      archive.on('error', (err) => {
        logger.error('Zip creation failed:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async getZipStream(projectId: string): Promise<fs.ReadStream> {
    const zipPath = path.join(this.outputDir, `${projectId}.zip`);
    
    if (!await fs.pathExists(zipPath)) {
      throw new Error('Zip file not found');
    }

    return fs.createReadStream(zipPath);
  }

  async deleteZip(projectId: string): Promise<void> {
    const zipPath = path.join(this.outputDir, `${projectId}.zip`);
    
    try {
      await fs.remove(zipPath);
      logger.info('Project zip deleted', { projectId });
    } catch (error) {
      logger.error('Failed to delete zip:', error);
      throw error;
    }
  }

  async cleanupOldZips(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.outputDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.remove(filePath);
          logger.info('Removed old zip file', { file });
        }
      }
    } catch (error) {
      logger.error('Cleanup failed:', error);
      throw error;
    }
  }
}