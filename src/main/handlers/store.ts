import { ipcMain } from 'electron';
import settings from 'electron-settings';
import type { IpcResult } from '../preload';

function createResult<T>(success: boolean, data?: T, error?: string): IpcResult<T> {
  return { success, data, error };
}

ipcMain.handle('electron-store-get', async (event, key: string): Promise<IpcResult<unknown>> => {
  try {
    const value = await settings.get(key);
    return createResult(true, value);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});

ipcMain.handle('electron-store-set', async (event, key: string, value: unknown): Promise<IpcResult<void>> => {
  try {
    await settings.set(key, value as any);
    return createResult(true);
  } catch (error) {
    return createResult(false, undefined, (error as Error).message);
  }
});
