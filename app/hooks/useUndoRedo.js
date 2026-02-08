import { useState, useCallback } from 'react';

// Custom hook for undo/redo functionality
export const useUndoRedo = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const updateState = useCallback((newState) => {
    // Don't update if the state hasn't actually changed
    if (JSON.stringify(newState) === JSON.stringify(currentState)) {
      return;
    }

    // Remove any history after current index (when making new changes after undo)
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add new state to history
    newHistory.push(newState);
    
    // Limit history to 50 items to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setCurrentIndex(newHistory.length - 1);
    }
    
    setHistory(newHistory);
  }, [currentState, history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return currentState;
  }, [currentIndex, history, currentState]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
    return currentState;
  }, [currentIndex, history, currentState]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const reset = useCallback((newInitialState) => {
    setHistory([newInitialState]);
    setCurrentIndex(0);
  }, []);

  return {
    currentState,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  };
};

export default useUndoRedo;
