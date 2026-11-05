import { useCallback, useEffect, useState } from 'react';

/**
 * Inline two-tap confirm for destructive actions (replaces window.confirm).
 * First tap "arms" the key (button label switches to a confirm label);
 * a second tap on the same key within `timeoutMs` runs the action.
 */
export function useArmedAction(timeoutMs = 3000) {
  const [armedKey, setArmedKey] = useState('');

  useEffect(() => {
    if (!armedKey) return undefined;
    const timer = setTimeout(() => setArmedKey(''), timeoutMs);
    return () => clearTimeout(timer);
  }, [armedKey, timeoutMs]);

  const isArmed = useCallback((key) => armedKey === key, [armedKey]);

  const runArmed = useCallback(
    (key, action) => {
      if (armedKey !== key) {
        setArmedKey(key);
        return;
      }
      setArmedKey('');
      action();
    },
    [armedKey]
  );

  return { isArmed, runArmed };
}
