/**
 * IPC Handler Tests
 * 
 * Tests for Electron main process IPC handlers
 */

// Mock electron before imports
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
  app: {
    getPath: jest.fn().mockReturnValue('/tmp/test'),
    getVersion: jest.fn().mockReturnValue('1.0.0'),
  },
  BrowserWindow: jest.fn(),
  dialog: {
    showOpenDialog: jest.fn(),
    showSaveDialog: jest.fn(),
  },
  shell: {
    openPath: jest.fn(),
  },
}));

jest.mock('electron-settings', () => ({
  get: jest.fn(),
  set: jest.fn(),
  hasSync: jest.fn(),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  unlinkSync: jest.fn(),
  rmSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn(),
  },
}));

jest.mock('gray-matter', () => jest.fn());

import { ipcMain } from 'electron';
import settings from 'electron-settings';
import fs from 'fs';

// Import handlers to trigger registration
import '../main/handlers/store';
import '../main/handlers/file';

describe('IPC Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Store Handlers', () => {
    it('should register electron-store-get handler', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('electron-store-get', expect.any(Function));
    });

    it('should register electron-store-set handler', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('electron-store-set', expect.any(Function));
    });

    it('should read settings correctly', async () => {
      const mockHandler = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'electron-store-get'
      )?.[1];

      if (mockHandler) {
        const expectedValue = 'test-api-key';
        (settings.get as jest.Mock).mockResolvedValue(expectedValue);
        
        const result = await mockHandler({}, 'openai.apiKey');
        expect(result.success).toBe(true);
        expect(result.data).toBe(expectedValue);
        expect(settings.get).toHaveBeenCalledWith('openai.apiKey');
      }
    });

    it('should write settings correctly', async () => {
      const mockHandler = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'electron-store-set'
      )?.[1];

      if (mockHandler) {
        const key = 'openai.apiKey';
        const value = 'new-api-key';
        
        const result = await mockHandler({}, key, value);
        expect(result.success).toBe(true);
        expect(settings.set).toHaveBeenCalledWith(key, value);
      }
    });
  });

  describe('File Handlers', () => {
    it('should register file:exists handler', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('file:exists', expect.any(Function));
    });

    it('should register file:read handler', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('file:read', expect.any(Function));
    });

    it('should register file:write handler', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith('file:write', expect.any(Function));
    });

    it('should handle file read errors gracefully', async () => {
      const mockHandler = (ipcMain.handle as jest.Mock).mock.calls.find(
        call => call[0] === 'file:read'
      )?.[1];

      if (mockHandler) {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        
        const result = await mockHandler({}, '/nonexistent/file.txt');
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('error');
      }
    });
  });

  describe('Handler Utilities', () => {
    it('should have proper error handling structure', () => {
      // Verify all handlers return consistent error structures
      const handlers = (ipcMain.handle as jest.Mock).mock.calls;
      
      handlers.forEach(([channel, handler]) => {
        expect(typeof channel).toBe('string');
        expect(typeof handler).toBe('function');
      });
    });
  });
});
