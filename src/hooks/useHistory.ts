import { useState, useCallback } from 'react';
import { HistoryState, TextElement, Annotation, PageMeta } from '../types/pdf';

export function useHistory(initialState: HistoryState) {
  const [history, setHistory] = useState<HistoryState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex] || initialState;

  const pushState = useCallback((newState: HistoryState) => {
    setHistory(prev => {
      const updated = prev.slice(0, currentIndex + 1);
      return [...updated, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const resetHistory = useCallback((state: HistoryState) => {
    setHistory([state]);
    setCurrentIndex(0);
  }, []);

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory
  };
}
