import { ipcMain } from 'electron';
import pileTags from '../utils/journalTags';

ipcMain.handle('tags-load', (event, journalPath) => {
  const tags = pileTags.load(journalPath);
  return tags;
});

ipcMain.handle('tags-get', (event) => {
  const tags = pileTags.get();
  return tags;
});

ipcMain.handle('tags-sync', (event, filePath) => {
  pileTags.sync(filePath);
});

ipcMain.handle('tags-add', (event, { tag, filePath }) => {
  pileTags.add(tag, filePath);
});

ipcMain.handle('tags-remove', (event, { tag, filePath }) => {
  pileTags.remove(tag, filePath);
});
