import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useMemo, useRef,
} from 'react';
import {
  getTasks, createTask, updateTask, deleteTask,
  duplicateTask, archiveTask, reorderTasks,
  getRecentActivities,
} from '../services/tasks';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const TaskContext = createContext();

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};

/* ── helpers ──────────────────────────────────────────────────────────────── */

/** Compute all dashboard stats directly from the task array. */
function computeStats(tasks) {
  const now = Date.now();
  const total       = tasks.length;
  const completed   = tasks.filter(t => t.status === 'COMPLETED').length;
  const pending     = tasks.filter(t => t.status === 'PENDING').length;
  const inProgress  = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const cancelled   = tasks.filter(t => t.status === 'CANCELLED').length;
  const overdue     = tasks.filter(
    t => t.due_date && new Date(t.due_date).getTime() < now && t.status !== 'COMPLETED'
  ).length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  /* weekly creation counts — last 7 days keyed by "YYYY-MM-DD" local date */
  const weeklyCreation = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weeklyCreation[d.toLocaleDateString('en-CA')] = 0; // "en-CA" → YYYY-MM-DD
  }
  tasks.forEach(t => {
    if (!t.created_at) return;
    const key = new Date(t.created_at).toLocaleDateString('en-CA');
    if (key in weeklyCreation) weeklyCreation[key]++;
  });

  const weeklyData = Object.entries(weeklyCreation).map(([date, value]) => ({
    date,
    label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    value,
  }));

  /* priority breakdown */
  const priorityBreakdown = {
    CRITICAL: tasks.filter(t => t.priority === 'CRITICAL').length,
    HIGH:     tasks.filter(t => t.priority === 'HIGH').length,
    MEDIUM:   tasks.filter(t => t.priority === 'MEDIUM').length,
    LOW:      tasks.filter(t => t.priority === 'LOW').length,
  };

  return {
    total, completed, pending, inProgress, cancelled,
    overdue, completionPct, weeklyData, priorityBreakdown,
  };
}

/* ── provider ─────────────────────────────────────────────────────────────── */

export const TaskProvider = ({ children }) => {
  const { token } = useAuth();
  const { isKid } = useTheme();

  const [tasks,      setTasks]      = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [filters,    setFilters]    = useState({
    search: '', priority: '', status: '', category: '', dateRange: '',
  });

  /* activityRefreshKey increments after every mutation so RecentActivity
     re-fetches without needing a prop-drilling callback chain */
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const bumpActivity = useCallback(() => setActivityRefreshKey(k => k + 1), []);

  /* ── data fetching ───────────────────────────────────────────────────── */

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTasks(filters);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  const refreshActivities = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getRecentActivities();
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }, [token]);

  useEffect(() => { fetchTasks(); },      [fetchTasks]);
  useEffect(() => { refreshActivities(); }, [refreshActivities]);

  /* ── computed stats (memoised — only recalculates when tasks change) ── */

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  /* ── mutation helpers ────────────────────────────────────────────────── */

  const addTask = useCallback(async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      toast.success(isKid ? 'Yay! New task added! 🎉' : 'Task created successfully');
      bumpActivity();
      return newTask;
    } catch (err) {
      toast.error(isKid ? 'Oops! Could not add task' : 'Failed to create task');
      throw err;
    }
  }, [bumpActivity, isKid]);

  const editTask = useCallback(async (taskId, taskData) => {
    try {
      const updated = await updateTask(taskId, taskData);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      
      // Check if task was just completed
      const wasCompleted = taskData.status === 'COMPLETED';
      if (wasCompleted) {
        toast.success(isKid ? 'Awesome! Task completed! ⭐' : 'Task completed successfully');
      } else {
        toast.success(isKid ? 'Great! Task updated! ✨' : 'Task updated successfully');
      }
      
      bumpActivity();
      return updated;
    } catch (err) {
      toast.error(isKid ? 'Oops! Could not update task' : 'Failed to update task');
      throw err;
    }
  }, [bumpActivity, isKid]);

  const removeTask = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success(isKid ? 'Task removed! 🗑️' : 'Task deleted successfully');
      bumpActivity();
    } catch (err) {
      toast.error(isKid ? 'Oops! Could not delete task' : 'Failed to delete task');
      throw err;
    }
  }, [bumpActivity, isKid]);

  const duplicateTaskHandler = useCallback(async (taskId) => {
    try {
      const newTask = await duplicateTask(taskId);
      setTasks(prev => [newTask, ...prev]);
      toast.success(isKid ? 'Task copied! 📋' : 'Task duplicated successfully');
      bumpActivity();
      return newTask;
    } catch (err) {
      toast.error(isKid ? 'Oops! Could not copy task' : 'Failed to duplicate task');
      throw err;
    }
  }, [bumpActivity, isKid]);

  const archiveTaskHandler = useCallback(async (taskId) => {
    try {
      const archived = await archiveTask(taskId);
      setTasks(prev => prev.map(t => (t.id === taskId ? archived : t)));
      toast.success(isKid ? 'Task archived! 📦' : 'Task archived successfully');
      bumpActivity();
      return archived;
    } catch (err) {
      toast.error(isKid ? 'Oops! Could not archive task' : 'Failed to archive task');
      throw err;
    }
  }, [bumpActivity, isKid]);

  const reorderTasksHandler = useCallback(async (taskIds) => {
    try {
      await reorderTasks(taskIds);
      const reordered = taskIds
        .map(id => tasks.find(t => t.id === id))
        .filter(Boolean);
      setTasks(reordered);
    } catch (err) {
      toast.error('Failed to reorder tasks');
      throw err;
    }
  }, [tasks]);

  /* ── context value ───────────────────────────────────────────────────── */

  const value = useMemo(() => ({
    tasks,
    activities,
    loading,
    filters,
    stats,             // computed from tasks — always fresh
    activityRefreshKey,
    setFilters,
    fetchTasks,
    refreshActivities,
    addTask,
    editTask,
    removeTask,
    duplicateTask:  duplicateTaskHandler,
    archiveTask:    archiveTaskHandler,
    reorderTasks:   reorderTasksHandler,
  }), [
    tasks, activities, loading, filters, stats,
    activityRefreshKey, setFilters, fetchTasks, refreshActivities,
    addTask, editTask, removeTask,
    duplicateTaskHandler, archiveTaskHandler, reorderTasksHandler,
  ]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
