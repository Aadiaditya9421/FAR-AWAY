// src/hooks/useQuizTimer.js
import { useEffect, useRef } from 'react';

/**
 * Runs a countdown from the initial value.
 * Calls onTick every second and onExpire when it reaches 0.
 */
export default function useQuizTimer(isRunning, onTick, onExpire) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        onTick(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return { stop };
}
