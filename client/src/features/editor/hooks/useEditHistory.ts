import { useState, useCallback } from 'react';

const MAX_HISTORY = 10;

export function useEditHistory(initialHtml: string = '') {
  const [past, setPast] = useState<string[]>([]);
  const [present, setPresent] = useState<string>(initialHtml);
  const [future, setFuture] = useState<string[]>([]);

  const push = useCallback((newHtml: string) => {
    setPast((prev) => [...prev, present].slice(-MAX_HISTORY));
    setPresent(newHtml);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture((prev) => [present, ...prev]);
    setPresent(previous);
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast((prev) => [...prev, present]);
    setPresent(next);
  }, [future, present]);

  return {
    html: present,
    push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: past.length,
  };
}