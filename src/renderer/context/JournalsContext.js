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
    const configFilePath = window.electron.getConfigPath();

    // Setup new journals.json if it doesn't exist,
    // or read in the existing
    if (!window.electron.existsSync(configFilePath)) {
      window.electron.writeFile(configFilePath, JSON.stringify([]), (err) => {
        if (err) return;
        setJournals([]);
      });
    } else {
      await window.electron.readFile(configFilePath, (err, data) => {
        if (err) return;
        const jsonData = JSON.parse(data);
        setJournals(jsonData);
      });
    }
  };

  const getCurrentJournalPath = (appendPath = '') => {
    if (!currentJournal) return;
    const journal = journals.find((item) => item.name === currentJournal.name);
    const resolvedPath = window.electron.joinPath(journal.path, appendPath);
    return resolvedPath;
  };

  const writeConfig = async (nextJournals) => {
    if (!nextJournals) return;
    const configFilePath = window.electron.getConfigPath();
    window.electron.writeFile(
      configFilePath,
      JSON.stringify(nextJournals),
      (err) => {
        if (err) {
          console.error('Error writing to config');
          return;
        }
      },
    );
  };

  const createJournal = (name = '', selectedPath = null) => {
    if (name === '' && selectedPath == null) return;

    let journalPath = selectedPath;

    if (journals.find((item) => item.name === name)) {
      return;
    }

    // If selected directory is not empty, create a new directory
    if (!window.electron.isDirEmpty(selectedPath)) {
      journalPath = window.electron.joinPath(selectedPath, name);
      window.electron.mkdir(journalPath);
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
    getCurrentJournalPath,
    createJournal,
    currentJournal,
    deleteJournal,
    updateCurrentJournal,
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
