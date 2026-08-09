import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import ModeIcon from '../components/common/ModeIcon';
import ModeText from '../components/common/ModeText';
import {
  FaCheckCircle, FaClock, FaFire, FaTrophy,
  FaChartBar, FaBolt, FaCalendarCheck, FaStar,
  FaListUl, FaSync,
} from 'react-icons/fa';
import './Statistics.css';

/* ─── tiny sub-components ──────────────────────────────────────────────────── */

const StatBlock = ({ icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    className={`stat-block stat-block--${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <div className="stat-block-icon">{icon}</div>
    <div className="stat-block-body">
      <AnimatePresence mode="wait">
        <motion.span
          key={String(value)}
          className="stat-block-value"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="stat-block-label">{label}</span>
      {sub && <span className="stat-block-sub">{sub}</span>}
    </div>
  </motion.div>
);

/* Animated bar chart — each bar has a tooltip on hover */
const BarChart = ({ data, title }) => {
  const [tooltip, setTooltip] = useState(null);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bar-chart-container">
      <div className="bar-chart" role="img" aria-label={title}>
        {data.map((item, i) => (
          <div
            key={item.label}
            className="bar-item"
            onMouseEnter={() => setTooltip(i)}
            onMouseLeave={() => setTooltip(null)}
          >
            {tooltip === i && (
              <div className="bar-tooltip">{item.value} task{item.value !== 1 ? 's' : ''}</div>
            )}
            <div className="bar-track">
              <motion.div
                className="bar-fill bar-primary"
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxVal) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
              />
            </div>
            <span className="bar-label">{item.label}</span>
            <span className="bar-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* SVG donut – no external lib */
const DonutChart = ({ percentage = 0, color = '#4f46e5', size = 130 }) => {
  const r   = 48;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, percentage));

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="donut-svg">
      <circle cx="60" cy="60" r={r} fill="none"
        stroke="var(--color-bg-tertiary,#e5e7eb)" strokeWidth="12" />
      <motion.circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        style={{ transformOrigin: '60px 60px', rotate: '-90deg' }}
      />
      <text x="60" y="56" textAnchor="middle" dominantBaseline="middle"
        className="donut-pct">{pct}%</text>
      <text x="60" y="74" textAnchor="middle" dominantBaseline="middle"
        className="donut-label">done</text>
    </svg>
  );
};

/* Horizontal priority bars */
const PriorityBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="priority-row">
      <span className="priority-row-label">{label}</span>
      <div className="priority-row-track">
        <motion.div
          className="priority-row-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <span className="priority-row-count">{value}</span>
    </div>
  );
};

/* ─── main page ─────────────────────────────────────────────────────────────── */

const Statistics = () => {
  const { tasks, stats: localStats } = useTasks();
  const { isKid } = useTheme();

  /* server-side stats (streaks, productivity score, etc.) */
  const [serverStats, setServerStats] = useState(null);
  const [loadingServer, setLoadingServer] = useState(true);
  const [serverError, setServerError]     = useState(false);

  const fetchServerStats = useCallback(async () => {
    try {
      setServerError(false);
      const res = await api.get('/stats/');
      setServerStats(res.data);
    } catch {
      setServerError(true);
    } finally {
      setLoadingServer(false);
    }
  }, []);

  /* re-fetch from server whenever tasks change (add / edit / delete triggers re-render) */
  useEffect(() => {
    fetchServerStats();
  }, [fetchServerStats, tasks.length]);   // tasks.length is the cheapest dep that changes on any mutation

  /* ── merge: prefer server data for streak/score, local for charts ─────── */
  const display = {
    total:            localStats.total,
    completed:        localStats.completed,
    pending:          localStats.pending,
    inProgress:       localStats.inProgress,
    cancelled:        localStats.cancelled,
    overdue:          localStats.overdue,
    completionPct:    localStats.completionPct,
    priorityBreakdown:localStats.priorityBreakdown,
    weeklyData:       localStats.weeklyData,
    /* server-only fields */
    currentStreak:    serverStats?.current_streak    ?? 0,
    longestStreak:    serverStats?.longest_streak    ?? 0,
    bestDay:          serverStats?.most_productive_day ?? 'N/A',
    productivityScore:serverStats?.productivity_score  ?? 0,
    avgCompletionTime:serverStats?.avg_completion_time ?? 0,
  };

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <Layout>
      <div className={`statistics-page ${isKid ? 'statistics-page-kid' : ''}`}>

        {/* header */}
        <div className="stats-header">
          <div>
            <h1>{isKid ? 'My Progress! 📊' : 'Statistics'}</h1>
            <p className="stats-subtitle">{isKid ? 'See how awesome you\'re doing!' : 'Your productivity insights — live from the database'}</p>
          </div>
          <button
            className="stats-refresh-btn"
            onClick={fetchServerStats}
            title="Refresh stats"
            aria-label="Refresh statistics"
          >
            <ModeIcon name="refresh" className={loadingServer ? 'spin' : ''} />
          </button>
        </div>

        {serverError && (
          <div className="stats-notice">
            {isKid ? 'Oops! Could not load stats. Showing what we have!' : 'Could not reach the server. Showing data computed from your loaded tasks.'}{' '}
            <button onClick={fetchServerStats}>{isKid ? 'Try Again' : 'Retry'}</button>
          </div>
        )}

        {/* ── 8 metric cards ─────────────────────────────────────────────── */}
        <div className="stat-blocks-grid">
          <StatBlock icon={<ModeIcon name="completed" />} label={<ModeText name="stats-completed" />} value={display.completed}   color="green"  delay={0}    />
          <StatBlock icon={<ModeIcon name="pending" />} label={<ModeText name="stats-pending" />} value={display.pending}     color="yellow" delay={0.04} />
          <StatBlock icon={<ModeIcon name="overdue" />} label={<ModeText name="stats-overdue" />} value={display.overdue}     color="red"    delay={0.08} />
          <StatBlock icon={<ModeIcon name="status-in-progress" />} label={<ModeText name="stats-in-progress" />} value={display.inProgress}  color="blue"   delay={0.12} />
          <StatBlock icon={<ModeIcon name="streak" />} label={<ModeText name="stats-streak" />} value={`${display.currentStreak}d`}  sub="current" color="purple" delay={0.16} />
          <StatBlock icon={<ModeIcon name="trophy" />} label={<ModeText name="stats-best-streak" />} value={`${display.longestStreak}d`}  sub="all-time" color="orange" delay={0.20} />
          <StatBlock icon={<ModeIcon name="calendar-check" />} label={isKid ? 'Best Day!' : 'Best Day'}  value={display.bestDay}     color="teal"   delay={0.24} />
          <StatBlock icon={<ModeIcon name="productivity" />} label={<ModeText name="stats-productivity" />} value={`${display.productivityScore}%`} sub="score" color="indigo" delay={0.28} />
        </div>

        {/* ── charts row ─────────────────────────────────────────────────── */}
        <div className="stats-charts-row">

          {/* overall completion donut */}
          <motion.div className="stats-card stats-card--center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            <h3 className="stats-card-title">Overall Completion</h3>
            <DonutChart percentage={display.completionPct} color="#4f46e5" />
            <p className="donut-legend">
              <span className="legend-dot" style={{ background: '#4f46e5' }} />
              {display.completed} of {display.total} tasks done
            </p>
          </motion.div>

          {/* priority breakdown */}
          <motion.div className="stats-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
          >
            <h3 className="stats-card-title">Priority Breakdown</h3>
            <div className="priority-breakdown">
              <PriorityBar label="Critical" value={display.priorityBreakdown.CRITICAL} total={display.total} color="#ef4444" />
              <PriorityBar label="High"     value={display.priorityBreakdown.HIGH}     total={display.total} color="#f59e0b" />
              <PriorityBar label="Medium"   value={display.priorityBreakdown.MEDIUM}   total={display.total} color="#3b82f6" />
              <PriorityBar label="Low"      value={display.priorityBreakdown.LOW}      total={display.total} color="#10b981" />
            </div>
          </motion.div>

          {/* weekly creation bar chart */}
          <motion.div className="stats-card stats-card--wide"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26 }}
          >
            <h3 className="stats-card-title">
              Tasks Created — Last 7 Days
              <span className="live-badge">LIVE</span>
            </h3>
            <BarChart data={display.weeklyData} title="Tasks created per day last 7 days" />
          </motion.div>

        </div>

        {/* avg completion time (only if meaningful) */}
        {display.avgCompletionTime > 0 && (
          <motion.div className="stats-card stats-card--full"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="stats-card-title">Average Completion Time</h3>
            <p className="avg-time-value">
              {display.avgCompletionTime < 1
                ? `${Math.round(display.avgCompletionTime * 60)} minutes`
                : `${display.avgCompletionTime.toFixed(1)} hours`}
            </p>
            <p className="avg-time-sub">from task creation to completion</p>
          </motion.div>
        )}

      </div>
    </Layout>
  );
};

export default Statistics;
