import { ipcMain, app, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import pileHelper from '../utils/journalHelper';
import matter from 'gray-matter';
import type { IpcResult } from '../preload';

// Path validation utility
const ALLOWED_BASE_PATHS = [
  app.getPath('home'),
  app.getPath('userData'),
  app.getPath('temp'),
];

function isPathAllowed(targetPath: string): boolean {
  // Normalize and resolve the path
  const resolvedPath = path.resolve(targetPath);
  
  // Check if path is within allowed base paths
  return ALLOWED_BASE_PATHS.some(basePath => {
    const resolvedBase = path.resolve(basePath);
    return resolvedPath.startsWith(resolvedBase + path.sep) || 
           resolvedPath === resolvedBase;
  });
}

function createResult<T>(success: boolean, data?: T, error?: string): IpcResult<T> {
  return { success, data, error };
}

// File:exists handler
ipcMain.handle('file:exists', async (event, filePath: string): Promise<IpcResult<boolean>> => {
  try {
    if (!isPathAllowed(filePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    const exists = fs.existsSync(filePath);
    return createResult(true, exists);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// File:read-dir handler
ipcMain.handle('file:read-dir', async (event, dirPath: string): Promise<IpcResult<string[]>> => {
  try {
    if (!isPathAllowed(dirPath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    const files = await fs.promises.readdir(dirPath);
    return createResult(true, files);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// File:read handler
ipcMain.handle('file:read', async (event, filePath: string): Promise<IpcResult<string>> => {
  try {
    if (!isPathAllowed(filePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return createResult(true, content);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// File:write handler
ipcMain.handle('file:write', async (event, filePath: string, data: string): Promise<IpcResult<void>> => {
  try {
    if (!isPathAllowed(filePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    await fs.promises.writeFile(filePath, data, 'utf-8');
    return createResult(true);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// File:delete handler
ipcMain.handle('file:delete', async (event, filePath: string): Promise<IpcResult<void>> => {
  try {
    if (!isPathAllowed(filePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    await fs.promises.unlink(filePath);
    return createResult(true);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// File:mkdir handler
ipcMain.handle('file:mkdir', async (event, dirPath: string): Promise<IpcResult<void>> => {
  try {
    if (!isPathAllowed(dirPath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    await fs.promises.mkdir(dirPath, { recursive: true });
    return createResult(true);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// File:is-dir-empty handler
ipcMain.handle('file:is-dir-empty', async (event, dirPath: string): Promise<IpcResult<boolean>> => {
  try {
    if (!isPathAllowed(dirPath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    const files = await fs.promises.readdir(dirPath);
    return createResult(true, files.length === 0);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// Path:join handler
ipcMain.handle('path:join', async (event, segments: string[]): Promise<IpcResult<string>> => {
  try {
    const joined = path.join(...segments);
    return createResult(true, joined);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// Path:separator handler
ipcMain.handle('path:separator', async (): Promise<IpcResult<string>> => {
  return createResult(true, path.sep);
});

// Dialog:open-directory handler
ipcMain.handle('dialog:open-directory', async (): Promise<IpcResult<string | null>> => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return createResult(true, null);
    }
    
    return createResult(true, result.filePaths[0]);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// Dialog:open-file handler
ipcMain.handle('dialog:open-file', async (event, options?: {
  properties?: ('openFile' | 'multiSelections')[];
  filters?: { name: string; extensions: string[] }[];
}): Promise<IpcResult<string[]>> => {
  try {
    const result = await dialog.showOpenDialog({
      properties: options?.properties || ['openFile', 'multiSelections'],
      filters: options?.filters || [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] },
        { name: 'Movies', extensions: ['mp4', 'mov'] },
      ],
    });
    
    if (result.canceled) {
      return createResult(true, []);
    }
    
    return createResult(true, result.filePaths);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// Shell:open-folder handler
ipcMain.handle('shell:open-folder', async (event, folderPath: string): Promise<IpcResult<void>> => {
  try {
    if (!folderPath.startsWith('/')) {
      return createResult(false, undefined, 'Invalid folder path');
    }
    await shell.openPath(folderPath);
    return createResult(true);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// Config:get-path handler
ipcMain.handle('config:get-path', async (): Promise<IpcResult<string>> => {
  try {
    const userHomeDirectoryPath = app.getPath('home');
    const journalsDir = path.join(userHomeDirectoryPath, 'Journals');
    const journalsConfig = path.join(journalsDir, 'journals.json');
    const legacyPilesConfig = path.join(
      userHomeDirectoryPath,
      'Piles',
      'piles.json'
    );

    if (!fs.existsSync(journalsDir)) {
      fs.mkdirSync(journalsDir, { recursive: true });
    }

    if (!fs.existsSync(journalsConfig) && fs.existsSync(legacyPilesConfig)) {
      fs.copyFileSync(legacyPilesConfig, journalsConfig);
    }

    return createResult(true, journalsConfig);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// Legacy IPC handlers (for backward compatibility)
import { shell } from 'electron';

ipcMain.handle('update-file', async (event, { path: filePath, content }: { path: string; content: string }): Promise<IpcResult<void>> => {
  try {
    if (!isPathAllowed(filePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    pileHelper.updateFile(filePath, content);
    return createResult(true);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

ipcMain.handle('change-folder', async (event, newPath: string): Promise<IpcResult<void>> => {
  try {
    if (!isPathAllowed(newPath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    pileHelper.changeWatchFolder(newPath);
    return createResult(true);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

ipcMain.handle('matter-parse', async (event, fileContent: string): Promise<IpcResult<{ content: string; data: Record<string, unknown> } | null>> => {
  try {
    const post = matter(fileContent);
    return createResult(true, { content: post.content, data: post.data as Record<string, unknown> });
  } catch (error) {
    return createResult(true, null);
  }
});

ipcMain.handle('matter-stringify', async (event, { content, data }: { content: string; data: Record<string, unknown> }): Promise<IpcResult<string>> => {
  try {
    const stringifiedContent = matter.stringify(content, data);
    return createResult(true, stringifiedContent);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

ipcMain.handle('get-files', async (event, dirPath: string): Promise<IpcResult<string[]>> => {
  try {
    if (!isPathAllowed(dirPath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    const files = await pileHelper.getFilesInFolder(dirPath);
    return createResult(true, files);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

ipcMain.handle('get-file', async (event, filePath: string): Promise<IpcResult<string | null>> => {
  try {
    if (!isPathAllowed(filePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    const content = await pileHelper.getFile(filePath).catch(() => null);
    return createResult(true, content);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

ipcMain.handle('save-file', async (event, { fileData, fileExtension, storePath }: { fileData: string; fileExtension: string; storePath: string }): Promise<IpcResult<string>> => {
  try {
    if (!isPathAllowed(storePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    
    const currentDate = new Date();
    const year = String(currentDate.getFullYear()).slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
    const fileName = `${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}.${fileExtension}`;
    const fullStorePath = path.join(
      storePath,
      String(currentDate.getFullYear()),
      currentDate.toLocaleString('default', { month: 'short' }),
      'media'
    );
    const newFilePath = path.join(fullStorePath, fileName);

    // Convert Data URL to Buffer
    const dataUrlParts = fileData.split(';base64,');
    if (dataUrlParts.length !== 2) {
      return createResult(false, undefined, 'Invalid data URL format');
    }
    const fileBuffer = Buffer.from(dataUrlParts[1], 'base64');

    await fs.promises.mkdir(fullStorePath, { recursive: true });
    await fs.promises.writeFile(newFilePath, fileBuffer);
    return createResult(true, newFilePath);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

ipcMain.handle('open-file', async (event, data: { storePath: string }): Promise<IpcResult<string[]>> => {
  try {
    const storePath = data.storePath;
    if (!isPathAllowed(storePath)) {
      return createResult(false, undefined, 'Path not allowed');
    }
    
    const selected = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] },
        { name: 'Movies', extensions: ['mp4', 'mov'] },
      ],
    });

    const selectedFiles = selected.filePaths || [];
    const attachments: string[] = [];

    if (selected.canceled) {
      return createResult(true, attachments);
    }

    for (const [index, filePath] of selectedFiles.entries()) {
      const currentDate = new Date();
      const year = String(currentDate.getFullYear()).slice(-2);
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      const selectedFileName = filePath.split(/[/\\]/).pop();

      if (!selectedFileName) continue;

      const extension = selectedFileName.split('.').pop();
      const fileName = `${year}${month}${day}-${hours}${minutes}${seconds}-${index}.${extension}`;
      const fullStorePath = path.join(
        storePath,
        String(currentDate.getFullYear()),
        currentDate.toLocaleString('default', { month: 'short' }),
        'media'
      );
      const newFilePath = path.join(fullStorePath, fileName);

      try {
        await fs.promises.mkdir(fullStorePath, { recursive: true });
        await fs.promises.copyFile(filePath, newFilePath);
        attachments.push(newFilePath);
      } catch (err) {
        console.error('Failed to copy file:', err);
      }
    }

    return createResult(true, attachments);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

// Legacy sync handlers (for backward compatibility)
ipcMain.on('get-config-file-path', (event) => {
  const userHomeDirectoryPath = app.getPath('home');
  const journalsDir = path.join(userHomeDirectoryPath, 'Journals');
  const journalsConfig = path.join(journalsDir, 'journals.json');
  const legacyPilesConfig = path.join(
    userHomeDirectoryPath,
    'Piles',
    'piles.json'
  );

  if (!fs.existsSync(journalsDir)) {
    fs.mkdirSync(journalsDir, { recursive: true });
  }

  if (!fs.existsSync(journalsConfig) && fs.existsSync(legacyPilesConfig)) {
    fs.copyFileSync(legacyPilesConfig, journalsConfig);
  }

  event.returnValue = journalsConfig;
});

ipcMain.on('open-file-dialog', async (event) => {
  const directory = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!directory.canceled) {
    event.sender.send('selected-directory', directory.filePaths[0]);
  }
});
