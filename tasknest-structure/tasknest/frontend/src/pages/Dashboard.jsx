import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import ProgressRing from '../components/dashboard/ProgressRing';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickAddTask from '../components/tasks/QuickAddTask';
import TaskList from '../components/tasks/TaskList';
import { FaCheckCircle, FaClock, FaCalendar, FaStar } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark, isKid } = useTheme();
  const { tasks, loading } = useTasks();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    if (tasks) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const pending = tasks.filter(t => t.status === 'PENDING').length;
      const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'COMPLETED').length;
      
      setStats({
        total,
        completed,
        pending,
        overdue,
        completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }
  }, [tasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 17) return 'Good Afternoon ☀️';
    if (hour < 21) return 'Good Evening 🌆';
    return 'Good Night 🌙';
  };

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className={`dashboard ${isKid ? 'dashboard-kid' : ''}`}>
        <div className="dashboard-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>{getGreeting()}, {user?.full_name || user?.username || 'Guest'}! 👋</h1>
            <p className="dashboard-date">{getDate()}</p>
            <p className="dashboard-time">{new Date().toLocaleTimeString()}</p>
          </motion.div>
        </div>

        <div className="dashboard-stats">
          <StatsCard
            icon={<FaCheckCircle />}
            title="Completed"
            value={stats.completed}
            color="success"
          />
          <StatsCard
            icon={<FaClock />}
            title="Pending"
            value={stats.pending}
            color="warning"
          />
          <StatsCard
            icon={<FaCalendar />}
            title="Overdue"
            value={stats.overdue}
            color="danger"
          />
          <StatsCard
            icon={<FaStar />}
            title="Total Tasks"
            value={stats.total}
            color="primary"
          />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-progress">
            <ProgressRing
              percentage={stats.completionPercentage}
              label="Completion"
            />
          </div>
          <div className="dashboard-recent">
            <RecentActivity />
          </div>
        </div>

        <div className="dashboard-quick-add">
          <QuickAddTask />
        </div>

        <div className="dashboard-tasks">
          <h2>Today's Tasks</h2>
          <TaskList tasks={tasks.slice(0, 5)} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;