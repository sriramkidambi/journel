import { useState, useCallback, useEffect } from 'react';

export function useElectronStore(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    window.electron.settings.get(key).then((result) => {
      if (result.success && result.data !== undefined) {
        setStoredValue(result.data);
      }
    });
  }, [key]);

  const setValue = useCallback(
    (value) => {
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
      window.electron.settings.set(key, newValue);
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
