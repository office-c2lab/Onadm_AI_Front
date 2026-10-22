import { useEffect, useState } from 'react';

export default function useEntryAnimation(signature, duration) {
  const [entry, setEntry] = useState({ signature, version: 0, active: true });
  if (entry.signature !== signature) {
    setEntry({ signature, version: entry.version + 1, active: true });
  }
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEntry(current => ({ ...current, active: false }));
    }, duration);
    return () => window.clearTimeout(timeoutId);
  }, [signature, duration]);
  return { version: entry.version, active: entry.active };
}
