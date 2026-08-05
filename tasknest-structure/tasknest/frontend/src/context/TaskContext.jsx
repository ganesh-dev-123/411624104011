import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, duplicateTask, archiveTask, reorderTasks } from '../services/tasks';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    category: '',
    dateRange: ''
  });
  const { token } = useAuth();

  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, filters]);

  const addTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks([newTask, ...tasks]);
      toast.success('Task created successfully! 🎉');
      return newTask;
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    }
  };

  const editTask = async (taskId, taskData) => {
    try {
      const updatedTask = await updateTask(taskId, taskData);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      toast.success('Task updated successfully!');
      return updatedTask;
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
  };

  const removeTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task');
      throw error;
    }
  };

  const duplicateTaskHandler = async (taskId) => {
    try {
      const newTask = await duplicateTask(taskId);
      setTasks([newTask, ...tasks]);
      toast.success('Task duplicated!');
      return newTask;
    } catch (error) {
      toast.error('Failed to duplicate task');
      throw error;
    }
  };

  const archiveTaskHandler = async (taskId) => {
    try {
      const archivedTask = await archiveTask(taskId);
      setTasks(tasks.map(task => task.id === taskId ? archivedTask : task));
      toast.success('Task archived!');
      return archivedTask;
    } catch (error) {
      toast.error('Failed to archive task');
      throw error;
    }
  };

  const reorderTasksHandler = async (taskIds) => {
    try {
      await reorderTasks(taskIds);
      // Update local order
      const reorderedTasks = taskIds.map(id => tasks.find(task => task.id === id)).filter(Boolean);
      setTasks(reorderedTasks);
    } catch (error) {
      toast.error('Failed to reorder tasks');
      throw error;
    }
  };

  const value = {
    tasks,
    loading,
    filters,
    setFilters,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    duplicateTask: duplicateTaskHandler,
    archiveTask: archiveTaskHandler,
    reorderTasks: reorderTasksHandler,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};