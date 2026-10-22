import { useState } from 'react';

export default function usePersistentSidebar(storageKey) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return window.localStorage.getItem(storageKey) !== 'false';
    } catch {
      return true;
    }
  });
  const setOpen = nextOpen => {
    setIsOpen(nextOpen);
    try {
      window.localStorage.setItem(storageKey, String(nextOpen));
    } catch {
      // Private/restricted storage must not prevent navigation.
    }
  };
  return [isOpen, setOpen];
}
