import React from 'react';
import { motion } from 'framer-motion';
import './ProgressRing.css';

/**
 * A self-contained SVG donut ring.
 * - Fixed 200×200 viewBox, no overflow clipping issues.
 * - Text is positioned with SVG coordinates so it always stays centered.
 * - Wrapper div uses overflow:hidden so nothing bleeds into siblings.
 */
const ProgressRing = ({ percentage = 0, label = 'Completion' }) => {
  const r             = 80;
  const circumference = 2 * Math.PI * r;
  const pct           = Math.min(100, Math.max(0, percentage));
  const offset        = circumference - (pct / 100) * circumference;

  return (
    <div className="progress-ring-wrapper">
      <svg
        className="progress-ring-svg"
        viewBox="0 0 200 200"
        aria-label={`${label}: ${pct}%`}
        role="img"
      >
        {/* background track */}
        <circle
          className="progress-ring-track"
          cx="100"
          cy="100"
          r={r}
          fill="none"
          strokeWidth="14"
        />
        {/* animated fill */}
        <motion.circle
          className="progress-ring-fill"
          cx="100"
          cy="100"
          r={r}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 100px', rotate: '-90deg' }}
        />
        {/* centered text */}
        <text
          x="100"
          y="93"
          textAnchor="middle"
          dominantBaseline="middle"
          className="progress-ring-pct"
        >
          {pct}%
        </text>
        <text
          x="100"
          y="117"
          textAnchor="middle"
          dominantBaseline="middle"
          className="progress-ring-label"
        >
          {label}
        </text>
      </svg>
    </div>
  );
};

export default ProgressRing;
