import { useEffect, useRef } from 'react';

export function useVisibilitySync(callback: () => void) {
  const triggered = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && !triggered.current) {
        triggered.current = true;
        callback();
      }
    };

    document.addEventListener('visibilitychange', handler);
    handler();
    return () => document.removeEventListener('visibilitychange', handler);
  }, [callback]);
}
