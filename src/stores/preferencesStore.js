import { create } from 'zustand';

const DARK_MODE_STORAGE_KEY = 'ondam-dark-mode-enabled';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
};

const usePreferencesStore = create(set => ({
  isDarkModeEnabled: getInitialDarkMode(),
  setDarkModeEnabled: isEnabled => {
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isEnabled));
    set({ isDarkModeEnabled: isEnabled });
  },
}));

export default usePreferencesStore;
