import { ipcMain } from 'electron';
import { getKey, setKey, deleteKey } from '../utils/store';

ipcMain.handle('get-ai-key', async (_, provider = 'openai') => {
  return getKey(provider);
});

ipcMain.handle('set-ai-key', async (_, secretKey, provider = 'openai') => {
  return setKey(secretKey, provider);
});

ipcMain.handle('delete-ai-key', async (_, provider = 'openai') => {
  return deleteKey(provider);
});
