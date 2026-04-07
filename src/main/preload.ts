// Secure preload script - exposes minimal API surface via contextBridge
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Type definitions for IPC channels
type IpcChannels = 
  | 'file:exists'
  | 'file:read-dir'
  | 'file:read'
  | 'file:write'
  | 'file:delete'
  | 'file:mkdir'
  | 'file:is-dir-empty'
  | 'path:join'
  | 'path:separator'
  | 'dialog:open-directory'
  | 'dialog:open-file'
  | 'shell:open-folder'
  | 'config:get-path'
  | 'electron-store-get'
  | 'electron-store-set'
  | 'matter-parse'
  | 'matter-stringify'
  | 'get-files'
  | 'get-file'
  | 'save-file'
  | 'open-file'
  | 'update-file'
  | 'change-folder'
  | 'ipc-example';

// IPC result type following best practices
export interface IpcResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const electronHandler = {
  // Platform info (safe to expose)
  platform: {
    isMac: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
  },

  // File operations via IPC (validated in main process)
  file: {
    exists: (filePath: string): Promise<IpcResult<boolean>> =>
      ipcRenderer.invoke('file:exists', filePath),
    
    readDir: (dirPath: string): Promise<IpcResult<string[]>> =>
      ipcRenderer.invoke('file:read-dir', dirPath),
    
    read: (filePath: string): Promise<IpcResult<string>> =>
      ipcRenderer.invoke('file:read', filePath),
    
    write: (filePath: string, data: string): Promise<IpcResult<void>> =>
      ipcRenderer.invoke('file:write', filePath, data),
    
    delete: (filePath: string): Promise<IpcResult<void>> =>
      ipcRenderer.invoke('file:delete', filePath),
    
    mkdir: (dirPath: string): Promise<IpcResult<void>> =>
      ipcRenderer.invoke('file:mkdir', dirPath),
    
    isDirEmpty: (dirPath: string): Promise<IpcResult<boolean>> =>
      ipcRenderer.invoke('file:is-dir-empty', dirPath),
  },

  // Path operations (safe - no file system access)
  path: {
    join: (...segments: string[]): Promise<IpcResult<string>> =>
      ipcRenderer.invoke('path:join', segments),
    separator: (): Promise<IpcResult<string>> =>
      ipcRenderer.invoke('path:separator'),
  },

  // Dialog operations
  dialog: {
    openDirectory: (): Promise<IpcResult<string | null>> =>
      ipcRenderer.invoke('dialog:open-directory'),
    
    openFile: (options?: { 
      properties?: ('openFile' | 'multiSelections')[];
      filters?: { name: string; extensions: string[] }[];
    }): Promise<IpcResult<string[]>> =>
      ipcRenderer.invoke('dialog:open-file', options),
  },

  // Shell operations
  shell: {
    openFolder: (folderPath: string): Promise<IpcResult<void>> =>
      ipcRenderer.invoke('shell:open-folder', folderPath),
  },

  // Config operations
  config: {
    getPath: (): Promise<IpcResult<string>> =>
      ipcRenderer.invoke('config:get-path'),
  },

  // Settings operations (electron-store)
  settings: {
    get: (key: string): Promise<IpcResult<unknown>> =>
      ipcRenderer.invoke('electron-store-get', key),
    
    set: (key: string, value: unknown): Promise<IpcResult<void>> =>
      ipcRenderer.invoke('electron-store-set', key, value),
  },

  // Matter operations (frontmatter)
  matter: {
    parse: (content: string): Promise<IpcResult<{ content: string; data: Record<string, unknown> }>> =>
      ipcRenderer.invoke('matter-parse', content),
    
    stringify: (content: string, data: Record<string, unknown>): Promise<IpcResult<string>> =>
      ipcRenderer.invoke('matter-stringify', { content, data }),
  },

  // Journal/Pile file operations
  journals: {
    getFiles: (dirPath: string): Promise<IpcResult<string[]>> =>
      ipcRenderer.invoke('get-files', dirPath),
    
    getFile: (filePath: string): Promise<IpcResult<string | null>> =>
      ipcRenderer.invoke('get-file', filePath),
    
    saveFile: (payload: {
      fileData: string;
      fileExtension: string;
      storePath: string;
    }): Promise<IpcResult<string>> =>
      ipcRenderer.invoke('save-file', payload),
    
    openFile: (payload: { storePath: string }): Promise<IpcResult<string[]>> =>
      ipcRenderer.invoke('open-file', payload),
    
    updateFile: (filePath: string, content: string): Promise<IpcResult<void>> =>
      ipcRenderer.invoke('update-file', { path: filePath, content }),
    
    changeFolder: (folderPath: string): Promise<IpcResult<void>> =>
      ipcRenderer.invoke('change-folder', folderPath),
  },

  // IPC communication (legacy support)
  ipc: {
    sendMessage: (channel: string, ...args: unknown[]) => {
      ipcRenderer.send(channel, ...args);
    },
    
    on: (channel: string, func: (...args: unknown[]) => void) => {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);
      
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    
    once: (channel: string, func: (...args: unknown[]) => void) => {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
    
    removeListener: (channel: string, func: (...args: unknown[]) => void) => {
      ipcRenderer.removeListener(channel, func);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
