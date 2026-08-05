import React from 'react';
import { motion } from 'framer-motion';
import './ProgressRing.css';

const ProgressRing = ({ percentage, label }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          className="progress-ring-bg"
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="12"
        />
        <motion.circle
          className="progress-ring-circle"
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <text x="100" y="95" className="progress-ring-text">
          {percentage}%
        </text>
        <text x="100" y="115" className="progress-ring-label">
          {label}
        </text>
      </svg>
    </div>
  );
};

export default ProgressRing;