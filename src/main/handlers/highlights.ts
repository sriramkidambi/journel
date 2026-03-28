import { ipcMain } from 'electron';
import pileHighlights from '../utils/journalHighlights';

ipcMain.handle('highlights-load', (event, journalPath) => {
  const highlights = pileHighlights.load(journalPath);
  return highlights;
});

ipcMain.handle('highlights-get', (event) => {
  const highlights = pileHighlights.get();
  return highlights;
});

ipcMain.handle('highlights-create', (event, highlight) => {
  pileHighlights.create(highlight);
});

ipcMain.handle('highlights-delete', (event, highlight) => {
  pileHighlights.delete(highlight);
});
