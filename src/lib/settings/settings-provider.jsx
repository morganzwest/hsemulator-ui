'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '../../lib/settings/store';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  function set(key, value) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <SettingsContext.Provider value={{ settings, set }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
