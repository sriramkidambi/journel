import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useJournalsContext } from './JournalsContext';

export const TagsContext = createContext();

export const TagsContextProvider = ({ children }) => {
  const { currentJournal, getCurrentJournalPath } = useJournalsContext();
  const [tags, setTags] = useState(new Map());

  useEffect(() => {
    if (currentJournal) {
      loadTags(getCurrentJournalPath());
    }
  }, [currentJournal]);

  const loadTags = useCallback(async (journalPath) => {
    const newTags = await window.electron.ipc.invoke('tags-load', journalPath);
    const newMap = new Map(newTags);
    setTags(newMap);
  }, []);

  const refreshTags = useCallback(async () => {
    const newTags = await window.electron.ipc.invoke('tags-get');
    const newMap = new Map(newTags);
    setTags(newMap);
  }, []);

  const syncTags = useCallback(async (filePath) => {
    window.electron.ipc.invoke('tags-sync', filePath).then((tags) => {
      setTags(tags);
    });
  }, []);

  const addTag = useCallback(async (tag, filePath) => {
    window.electron.ipc.invoke('tags-add', { tag, filePath }).then((tags) => {
      setTags(tags);
    });
  }, []);

  const removeTag = useCallback(async (tag, filePath) => {
    window.electron.ipc
      .invoke('tags-remove', { tag, filePath })
      .then((tags) => {
        setTags(tags);
      });
  }, []);

  const tagsContextValue = { tags, refreshTags, addTag, removeTag };

  return (
    <TagsContext.Provider value={tagsContextValue}>
      {children}
    </TagsContext.Provider>
  );
};

export const useTagsContext = () => useContext(TagsContext);
