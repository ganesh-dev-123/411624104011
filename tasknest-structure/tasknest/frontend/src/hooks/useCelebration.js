import { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * useCelebration - Hook to manage celebration animations in Kids Mode
 */
const useCelebration = () => {
  const { isKid } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const triggerCelebration = useCallback((message = null) => {
    // Only trigger in Kids Mode
    if (!isKid) return;
    
    setCelebrationMessage(message);
    setShowCelebration(true);
  }, [isKid]);

  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return {
    showCelebration,
    celebrationMessage,
    triggerCelebration,
    closeCelebration,
    canCelebrate: isKid
  };
};

export default useCelebration;
