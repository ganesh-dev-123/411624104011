import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import ProgressRing from '../components/dashboard/ProgressRing';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickAddTask from '../components/tasks/QuickAddTask';
import TaskList from '../components/tasks/TaskList';
import ModeIcon from '../components/common/ModeIcon';
import ModeText from '../components/common/ModeText';
import Celebration from '../components/common/Celebration';
import useCelebration from '../hooks/useCelebration';
import './Dashboard.css';

/* ── live clock that ticks every second ─────────────────────────────────── */
function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ── greeting based on hour ─────────────────────────────────────────────── */
function getGreeting(hour) {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/* ── main component ──────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user }            = useAuth();
  const { isKid }           = useTheme();
  const { tasks, loading, stats, activityRefreshKey } = useTasks();
  const now                 = useLiveClock();
  
  const { 
    showCelebration, 
    celebrationMessage, 
    triggerCelebration, 
    closeCelebration 
  } = useCelebration();

  /* Today's tasks — everything created or due today */
  const todayStr = now.toLocaleDateString('en-CA');        // YYYY-MM-DD
  const todayTasks = tasks.filter(t => {
    const createdDay = t.created_at
      ? new Date(t.created_at).toLocaleDateString('en-CA')
      : null;
    const dueDay = t.due_date
      ? new Date(t.due_date).toLocaleDateString('en-CA')
      : null;
    return createdDay === todayStr || dueDay === todayStr;
  });

  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <Layout>
      <div className={`dashboard ${isKid ? 'dashboard-kid' : ''}`}>

        {/* ── header ─────────────────────────────────────────────────── */}
        <div className="dashboard-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1>
              <ModeText name={getGreeting(now.getHours())} />, {user?.full_name || user?.username || 'Guest'}! <ModeIcon name="welcome" />
            </h1>
            <p className="dashboard-date">{dateLabel}</p>
            <p className="dashboard-time">{timeLabel}</p>
          </motion.div>
        </div>

        {/* ── stats cards — fed from TaskContext.stats (recomputed on every mutation) */}
        <div className="dashboard-stats">
          <StatsCard
            icon={<ModeIcon name="completed" />}
            title={<ModeText name="stats-completed" />}
            value={stats.completed}
            color="success"
          />
          <StatsCard
            icon={<ModeIcon name="pending" />}
            title={<ModeText name="stats-pending" />}
            value={stats.pending}
            color="warning"
          />
          <StatsCard
            icon={<ModeIcon name="overdue" />}
            title={<ModeText name="stats-overdue" />}
            value={stats.overdue}
            color="danger"
          />
          <StatsCard
            icon={<ModeIcon name="total" />}
            title="Total Tasks"
            value={stats.total}
            color="primary"
          />
        </div>

        {/* ── progress ring + recent activity ────────────────────────── */}
        <div className="dashboard-grid">
          <div className="dashboard-progress">
            {/* key forces re-mount / re-animation when percentage changes */}
            <ProgressRing
              key={stats.completionPct}
              percentage={stats.completionPct}
              label={isKid ? 'Progress!' : 'Completion'}
            />
          </div>
          <div className="dashboard-recent">
            {/*
              activityRefreshKey bumps after every mutation in TaskContext
              so RecentActivity re-fetches automatically without prop drilling
            */}
            <RecentActivity refreshKey={activityRefreshKey} />
          </div>
        </div>

        {/* ── quick add ──────────────────────────────────────────────── */}
        <div className="dashboard-quick-add">
          <QuickAddTask />
        </div>

        {/* ── today's tasks ──────────────────────────────────────────── */}
        <div className="dashboard-tasks">
          <h2>
            {isKid ? "Today's Missions! 🎯" : "Today's Tasks"}
            {todayTasks.length > 0 && (
              <span className="today-badge">{todayTasks.length}</span>
            )}
          </h2>
          <TaskList
            tasks={todayTasks.length > 0 ? todayTasks.slice(0, 8) : tasks.slice(0, 5)}
            loading={loading}
          />
        </div>

      </div>
      
      {/* Celebration overlay for Kids Mode */}
      <Celebration 
        show={showCelebration} 
        onClose={closeCelebration}
        message={celebrationMessage}
      />
    </Layout>
  );
};

export default Dashboard;
