import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useTasks } from '../context/TaskContext';
import api from '../services/api';
import {
  FaCheckCircle, FaClock, FaFire, FaTrophy,
  FaChartBar, FaBolt, FaCalendarCheck, FaStar
} from 'react-icons/fa';
import './Statistics.css';

const StatBlock = ({ icon, label, value, sub, color, delay }) => (
  <motion.div
    className={`stat-block stat-block--${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="stat-block-icon">{icon}</div>
    <div className="stat-block-body">
      <span className="stat-block-value">{value}</span>
      <span className="stat-block-label">{label}</span>
      {sub && <span className="stat-block-sub">{sub}</span>}
    </div>
  </motion.div>
);

const BarChart = ({ data, maxValue, colorClass }) => (
  <div className="bar-chart">
    {data.map((item, i) => (
      <div key={i} className="bar-item">
        <div className="bar-track">
          <motion.div
            className={`bar-fill ${colorClass}`}
            initial={{ height: 0 }}
            animate={{ height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
          />
        </div>
        <span className="bar-label">{item.label}</span>
        <span className="bar-value">{item.value}</span>
      </div>
    ))}
  </div>
);

const DonutChart = ({ percentage, color, size = 120 }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="donut-chart">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-bg-tertiary, #e5e7eb)" strokeWidth="12" />
      <motion.circle
        cx="60" cy="60" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="60" textAnchor="middle" dy="0.35em" fontSize="20" fontWeight="700" fill="var(--color-text-primary)">
        {percentage}%
      </text>
    </svg>
  );
};

const Statistics = () => {
  const { tasks } = useTasks();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stats/');
        setStats(res.data);
      } catch (err) {
        // Fall back to computing from local tasks
        setError('Could not load stats from server. Showing local data.');
        computeLocalStats();
      } finally {
        setLoading(false);
      }
    };

    const computeLocalStats = () => {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const pending = tasks.filter(t => t.status === 'PENDING').length;
      const in_progress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const overdue = tasks.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'COMPLETED'
      ).length;
      setStats({
        total, completed, pending, in_progress, overdue,
        completion_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        productivity_score: total > 0 ? Math.round((completed / total) * 100) : 0,
        current_streak: 0,
        longest_streak: 0,
        most_productive_day: 'N/A',
        avg_completion_time: 0,
      });
    };

    if (tasks !== undefined) {
      fetchStats();
    }
  }, [tasks]);

  // Compute priority breakdown from local tasks
  const priorityData = [
    { label: 'Critical', value: tasks.filter(t => t.priority === 'CRITICAL').length, color: '#ef4444' },
    { label: 'High', value: tasks.filter(t => t.priority === 'HIGH').length, color: '#f59e0b' },
    { label: 'Medium', value: tasks.filter(t => t.priority === 'MEDIUM').length, color: '#3b82f6' },
    { label: 'Low', value: tasks.filter(t => t.priority === 'LOW').length, color: '#10b981' },
  ];

  // Weekly completion (last 7 days)
  const weeklyData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toDateString();
      const value = tasks.filter(t =>
        t.status === 'COMPLETED' &&
        t.completed_at &&
        new Date(t.completed_at).toDateString() === dateStr
      ).length;
      days.push({ label, value });
    }
    return days;
  })();

  const maxWeekly = Math.max(...weeklyData.map(d => d.value), 1);

  if (loading) {
    return (
      <Layout>
        <div className="statistics-page">
          <div className="stats-loading">
            <div className="spinner" />
            <p>Loading statistics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="statistics-page">
        <motion.div
          className="stats-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1>Statistics</h1>
            <p className="stats-subtitle">Your productivity insights at a glance</p>
          </div>
        </motion.div>

        {error && <div className="stats-notice">{error}</div>}

        {/* Key Metrics */}
        <div className="stat-blocks-grid">
          <StatBlock icon={<FaCheckCircle />} label="Completed" value={stats?.completed ?? 0} color="green" delay={0} />
          <StatBlock icon={<FaClock />} label="Pending" value={stats?.pending ?? 0} color="yellow" delay={0.05} />
          <StatBlock icon={<FaFire />} label="Overdue" value={stats?.overdue ?? 0} color="red" delay={0.1} />
          <StatBlock icon={<FaChartBar />} label="In Progress" value={stats?.in_progress ?? 0} color="blue" delay={0.15} />
          <StatBlock icon={<FaBolt />} label="Current Streak" value={`${stats?.current_streak ?? 0}d`} sub="days in a row" color="purple" delay={0.2} />
          <StatBlock icon={<FaTrophy />} label="Longest Streak" value={`${stats?.longest_streak ?? 0}d`} sub="personal best" color="orange" delay={0.25} />
          <StatBlock icon={<FaCalendarCheck />} label="Best Day" value={stats?.most_productive_day ?? 'N/A'} color="teal" delay={0.3} />
          <StatBlock icon={<FaStar />} label="Productivity" value={`${stats?.productivity_score ?? 0}%`} sub="score" color="indigo" delay={0.35} />
        </div>

        {/* Completion Rate + Charts Row */}
        <div className="stats-charts-row">
          {/* Completion Donut */}
          <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="stats-card-title">Overall Completion</h3>
            <div className="donut-wrapper">
              <DonutChart percentage={stats?.completion_percentage ?? 0} color="#4F46E5" />
            </div>
            <div className="donut-legend">
              <span className="legend-dot" style={{ background: '#4F46E5' }} />
              <span>{stats?.completed ?? 0} of {stats?.total ?? 0} tasks completed</span>
            </div>
          </motion.div>

          {/* Priority Breakdown */}
          <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <h3 className="stats-card-title">Priority Breakdown</h3>
            <div className="priority-breakdown">
              {priorityData.map((p) => (
                <div key={p.label} className="priority-row">
                  <span className="priority-row-label">{p.label}</span>
                  <div className="priority-row-track">
                    <motion.div
                      className="priority-row-fill"
                      style={{ background: p.color }}
                      initial={{ width: 0 }}
                      animate={{ width: tasks.length > 0 ? `${(p.value / tasks.length) * 100}%` : '0%' }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                  <span className="priority-row-count">{p.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div
            className="stats-card stats-card--wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="stats-card-title">Tasks Completed — Last 7 Days</h3>
            <BarChart data={weeklyData} maxValue={maxWeekly} colorClass="bar-primary" />
          </motion.div>
        </div>

        {/* Avg Completion Time */}
        {stats?.avg_completion_time > 0 && (
          <motion.div
            className="stats-card stats-card--full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <h3 className="stats-card-title">Average Completion Time</h3>
            <p className="avg-time-value">
              {stats.avg_completion_time < 1
                ? `${Math.round(stats.avg_completion_time * 60)} minutes`
                : `${stats.avg_completion_time.toFixed(1)} hours`}
            </p>
            <p className="avg-time-sub">from task creation to completion</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Statistics;
