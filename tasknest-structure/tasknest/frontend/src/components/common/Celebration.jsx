import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import './Celebration.css';

/* Celebration messages for Kids Mode */
const CELEBRATION_MESSAGES = [
  'Awesome! Task completed! ⭐',
  'Great job! 🎉',
  'You did it! 🌟',
  'Super work! 💪',
  'One step closer to your goal! 🎯',
  'Fantastic! ✨',
  'Amazing! 🚀',
  'Well done! 👏',
];

/**
 * Celebration - Shows a fun celebration animation in Kids Mode
 * Only renders in Kids Mode
 */
const Celebration = ({ show, onClose, message = null }) => {
  const { isKid } = useTheme();
  const [randomMessage, setRandomMessage] = useState('');

  // All hooks must be called unconditionally before any conditional return
  useEffect(() => {
    // Only execute effect logic in Kids Mode when show is true
    if (!isKid || !show) return;
    
    setRandomMessage(message || CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]);
    
    // Auto-close after 2.5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [show, message, onClose, isKid]);

  // Don't render in Professional Mode
  if (!isKid) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="celebration-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="celebration-content"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: 'spring',
              damping: 15,
              stiffness: 300 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stars animation */}
            <div className="celebration-stars">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="star"
                  initial={{ 
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 0
                  }}
                  animate={{
                    scale: [0, 1, 0.8, 1],
                    x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50, 0],
                    y: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50, 0],
                    opacity: [0, 1, 1, 1],
                    rotate: [0, 360, 720, 1080]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            {/* Main emoji */}
            <motion.div
              className="celebration-emoji"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              🎉
            </motion.div>

            {/* Message */}
            <motion.p
              className="celebration-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              {randomMessage}
            </motion.p>

            {/* Confetti */}
            <div className="celebration-confetti">
              {['🎊', '🎈', '✨', '💫', '🌟'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="confetti"
                  initial={{ 
                    scale: 0,
                    opacity: 0,
                    y: -50
                  }}
                  animate={{
                    scale: [0, 1, 0.5, 0],
                    opacity: [0, 1, 1, 0],
                    y: [-50, 100, 200, 300],
                    x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50],
                    rotate: [0, 360, 720]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.15,
                    ease: 'easeOut'
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Celebration;
