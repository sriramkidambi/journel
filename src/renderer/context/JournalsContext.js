import {
  useState,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';

export const availableThemes = {
  light: { primary: '#ddd', secondary: '#fff' },
  blue: { primary: '#a4d5ff', secondary: '#fff' },
  purple: { primary: '#d014e1', secondary: '#fff' },
  yellow: { primary: '#ff9634', secondary: '#fff' },
  green: { primary: '#22ff00', secondary: '#fff' },
};

export const JournalsContext = createContext();
export const PilesContext = JournalsContext;

export const JournalsContextProvider = ({ children }) => {
  const location = useLocation();
  const [currentJournal, setCurrentJournal] = useState(null);
  const [journals, setJournals] = useState([]);

  // Initialize config file
  useEffect(() => {
    getConfig();
  }, [location]);

  // Set the current journal based on the url
  useEffect(() => {
    if (!location.pathname) return;
    if (
      !location.pathname.startsWith('/journal/') &&
      !location.pathname.startsWith('/pile/')
    ) {
      return;
    }

    const currentJournalName = location.pathname.split(/[/\\]/).pop();

    changeCurrentJournal(currentJournalName);
  }, [location.pathname]);

  const getConfig = async () => {
    const result = await window.electron.config.getPath();
    if (!result.success) {
      console.error('Failed to get config path:', result.error);
      setJournals([]);
      return;
    }
    const configFilePath = result.data;

    // Setup new journals.json if it doesn't exist,
    // or read in the existing
    const existsResult = await window.electron.file.exists(configFilePath);
    if (!existsResult.success || !existsResult.data) {
      const writeResult = await window.electron.file.write(configFilePath, JSON.stringify([]));
      if (!writeResult.success) {
        console.error('Failed to create config:', writeResult.error);
        return;
      }
      setJournals([]);
    } else {
      const readResult = await window.electron.file.read(configFilePath);
      if (!readResult.success) {
        console.error('Failed to read config:', readResult.error);
        return;
      }
      try {
        const jsonData = JSON.parse(readResult.data);
        setJournals(jsonData);
      } catch (e) {
        console.error('Failed to parse config:', e);
        setJournals([]);
      }
    }
  };

  const getCurrentJournalPath = async (appendPath = '') => {
    if (!currentJournal) return;
    const journal = journals.find((item) => item.name === currentJournal.name);
    const result = await window.electron.path.join(journal.path, appendPath);
    return result.success ? result.data : null;
  };

  const writeConfig = async (nextJournals) => {
    if (!nextJournals) return;
    const result = await window.electron.config.getPath();
    if (!result.success) return;
    const configFilePath = result.data;
    
    const writeResult = await window.electron.file.write(
      configFilePath,
      JSON.stringify(nextJournals)
    );
    if (!writeResult.success) {
      console.error('Error writing to config:', writeResult.error);
    }
  };

  const createJournal = async (name = '', selectedPath = null) => {
    if (name === '' && selectedPath == null) return;

    let journalPath = selectedPath;

    if (journals.find((item) => item.name === name)) {
      return;
    }

    // If selected directory is not empty, create a new directory
    const isEmptyResult = await window.electron.file.isDirEmpty(selectedPath);
    if (!isEmptyResult.success) {
      console.error('Failed to check if directory is empty:', isEmptyResult.error);
      return;
    }
    
    if (!isEmptyResult.data) {
      const joinResult = await window.electron.path.join(selectedPath, name);
      if (!joinResult.success) return;
      journalPath = joinResult.data;
      const mkdirResult = await window.electron.file.mkdir(journalPath);
      if (!mkdirResult.success) {
        console.error('Failed to create journal directory:', mkdirResult.error);
        return;
      }
    }

    const nextJournals = [{ name, path: journalPath }, ...journals];
    setJournals(nextJournals);
    writeConfig(nextJournals);

    return name;
  };

  const changeCurrentJournal = (name) => {
    if (!journals || journals.length === 0) return;
    const journal = journals.find((item) => item.name === name);
    setCurrentJournal(journal);
  };

  // This does not delete the actual folder
  // User can do that if they actually want to.
  const deleteJournal = (name) => {
    if (!journals || journals.length === 0) return;
    const nextJournals = journals.filter((item) => item.name !== name);
    setJournals(nextJournals);
    writeConfig(nextJournals);
  };

  // Update current journal
  const updateCurrentJournal = (newJournal) => {
    const nextJournals = journals.map((journal) => {
      if (journal.path === currentJournal.path) {
        return newJournal;
      }
      return journal;
    });
    writeConfig(nextJournals);
    setCurrentJournal(newJournal);
  };

  // THEMES
  const currentTheme = useMemo(() => {
    return currentJournal?.theme ?? 'light';
  }, [currentJournal]);

  const setTheme = useCallback(
    (theme = 'light') => {
      const valid = Object.keys(availableThemes);
      if (!valid.includes(theme)) return;
      const nextJournal = { ...currentJournal, theme };
      updateCurrentJournal(nextJournal);
    },
    [currentJournal],
  );

  const journalsContextValue = {
    journals,
    getCurrentJournalPath,
    createJournal,
    currentJournal,
    deleteJournal,
    currentTheme,
    setTheme,
    updateCurrentJournal,
    journalsList: journals,
  };

  return (
    <JournalsContext.Provider value={journalsContextValue}>
      {children}
    </JournalsContext.Provider>
  );
};

export const PilesContextProvider = JournalsContextProvider;
export const useJournalsContext = () => useContext(JournalsContext);
export const usePilesContext = useJournalsContext;
