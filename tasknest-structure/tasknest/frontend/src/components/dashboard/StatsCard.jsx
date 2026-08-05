import React from 'react';
import { motion } from 'framer-motion';
import './StatsCard.css';

const StatsCard = ({ icon, title, value, color = 'primary' }) => {
  return (
    <motion.div 
      className={`stats-card stats-${color}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <span className="stats-value">{value}</span>
        <span className="stats-title">{title}</span>
      </div>
    </motion.div>
  );
};

export default StatsCard;