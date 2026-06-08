import { useState, useCallback } from 'react';

const MAX_HISTORY = 10;

export function useEditHistory(initialHtml: string = '') {
  const [past, setPast] = useState<string[]>([]);
  const [present, setPresent] = useState<string>(initialHtml);
  const [future, setFuture] = useState<string[]>([]);

  const push = useCallback((newHtml: string) => {
    setPast(prev => [...prev, present].slice(-MAX_HISTORY));
    setPresent(newHtml);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    setPast(prev => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture(futurePrev => [present, ...futurePrev]);
      setPresent(previous);
      return prev.slice(0, -1);
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setPast(pastPrev => [...pastPrev, present].slice(-MAX_HISTORY));
      setPresent(next);
      return prev.slice(1);
    });
  }, [present]);

  const reset = useCallback((newHtml: string) => {
    setPast([]);
    setPresent(newHtml);
    setFuture([]);
  }, []);

  return {
    html: present,
    push,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: past.length
  };
}