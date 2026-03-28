import { ipcMain } from 'electron';
import pileLinks from '../utils/journalLinks';
import { getLinkPreview, getLinkContent } from '../utils/linkPreview';

ipcMain.handle('links-get', (event, journalPath, url) => {
  const data = pileLinks.get(journalPath, url);
  return data;
});

ipcMain.handle('links-set', (event, journalPath, url, data) => {
  const status = pileLinks.set(journalPath, url, data);
  return status;
});

ipcMain.handle('get-link-preview', async (event, url) => {
  try {
    return await getLinkPreview(url);
  } catch {
    return null;
  }
});

ipcMain.handle('get-link-content', async (event, url) => {
  try {
    return await getLinkContent(url);
  } catch {
    return null;
  }
});
