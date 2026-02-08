import { useState } from "react";

export const useHistory = (initialState) => {
    const [history, setHistory] = useState([initialState]);
    const [index, setIndex] = useState(0);
  
    const undo = () => {
      if (index > 0) {
        return history[index - 1]; // Return the previous state without updating state here
      }
      return history[index];
    };
  
    const redo = () => {
      if (index < history.length - 1) {
        return history[index + 1]; // Return the next state without updating state here
      }
      return history[index];
    };
  
    const updateHistory = (newState) => {
      setHistory((prev) => [...prev.slice(0, index + 1), newState]); // Add new state to history
      setIndex((prev) => prev + 1); // Update the index
    };
  
    return { history, undo, redo, updateHistory };
  };