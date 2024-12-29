// frontend/src/hooks/useWebContainer.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

interface FileSystemTree {
  [key: string]: {
    file?: {
      contents: string | Uint8Array;
    };
    directory?: FileSystemTree;
  };
}

interface CommandOptions {
  cmd: string;
  args?: string[];
  cwd?: string;
}

export const useWebContainer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<WebContainer | null>(null);

  // Initialize WebContainer
  useEffect(() => {
    const initContainer = async () => {
      try {
        if (!containerRef.current) {
          containerRef.current = await WebContainer.boot();
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to initialize WebContainer');
        setLoading(false);
      }
    };

    initContainer();
  }, []);

  // Mount file system
  const mountFiles = useCallback(async (tree: FileSystemTree) => {
    try {
      if (!containerRef.current) throw new Error('WebContainer not initialized');
      const createFileSystem = async (tree: FileSystemTree, path: string = '/') => {
        for (const [name, node] of Object.entries(tree)) {
          const fullPath = `${path}${name}`;
          if (node.file) {
            await containerRef.current!.fs.writeFile(fullPath, node.file.contents);
          } else if (node.directory) {
            await containerRef.current!.fs.mkdir(fullPath, { recursive: true });
            await createFileSystem(node.directory, `${fullPath}/`);
          }
        }
      };
      await createFileSystem(tree);
    } catch (err) {
      setError('Failed to mount files');
      throw err;
    }
  }, []);

  // Write file
  const writeFile = useCallback(async (path: string, contents: string) => {
    try {
      if (!containerRef.current) throw new Error('WebContainer not initialized');
      await containerRef.current.fs.writeFile(path, contents);
    } catch (err) {
      setError('Failed to write file');
      throw err;
    }
  }, []);

  // Read file
  const readFile = useCallback(async (path: string): Promise<string> => {
    try {
      if (!containerRef.current) throw new Error('WebContainer not initialized');
      const file = await containerRef.current.fs.readFile(path);
      return new TextDecoder().decode(file);
    } catch (err) {
      setError('Failed to read file');
      throw err;
    }
  }, []);

  // Execute command
  const executeCommand = useCallback(async (options: CommandOptions) => {
    try {
      if (!containerRef.current) throw new Error('WebContainer not initialized');
      
      const process = await containerRef.current.spawn(options.cmd, options.args || [], { // Added default empty array
        cwd: options.cwd,
      });

      const output: string[] = [];
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output.push(data);
          },
        })
      );

      const exitCode = await process.exit;
      return {
        exitCode,
        output: output.join('\n'),
      };
    } catch (err) {
      setError('Failed to execute command');
      throw err;
    }
  }, []);

  // Start development server
  const startDevServer = useCallback(async (command: string = 'npm run dev') => {
    try {
      if (!containerRef.current) throw new Error('WebContainer not initialized');
      
      const [cmd, ...args] = command.split(' ');
      const process = await containerRef.current.spawn(cmd, args);
      
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        })
      );

      // Wait for the server to be ready
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Added delay as a workaround
      
      return process;
    } catch (err) {
      setError('Failed to start development server');
      throw err;
    }
  }, []);

  // Install dependencies
  const installDependencies = useCallback(async () => {
    try {
      if (!containerRef.current) throw new Error('WebContainer not initialized');
      
      const installProcess = await executeCommand({
        cmd: 'npm',
        args: ['install'],
      });

      return installProcess;
    } catch (err) {
      setError('Failed to install dependencies');
      throw err;
    }
  }, [executeCommand]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        // Cleanup WebContainer resources
        containerRef.current.teardown();
      }
    };
  }, []);

  return {
    mountFiles,
    writeFile,
    readFile,
    executeCommand,
    startDevServer,
    installDependencies,
    loading,
    error,
    isReady: !loading && !error,
  };
};