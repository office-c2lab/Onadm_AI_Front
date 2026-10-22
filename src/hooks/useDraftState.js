import { useCallback, useState } from 'react';

// Reset a local draft when its source changes, before children render stale values.
// The source must have a stable identity (query data or a memoized object).
export default function useDraftState(source, deriveValue) {
  const [snapshot, setSnapshot] = useState(() => ({ source, value: deriveValue(source) }));
  const setValue = useCallback(update => {
    setSnapshot(current => ({
      ...current,
      value: typeof update === 'function' ? update(current.value) : update,
    }));
  }, []);

  if (snapshot.source !== source) {
    const value = deriveValue(source, snapshot.value);
    setSnapshot({ source, value });
    return [value, setValue];
  }
  return [snapshot.value, setValue];
}
