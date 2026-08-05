import api from './api';

export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  const response = await api.get(`/tasks?${params.toString()}`);
  return response.data;
};

export const getTask = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`);
};

export const duplicateTask = async (id) => {
  const response = await api.post(`/tasks/${id}/duplicate`);
  return response.data;
};

export const archiveTask = async (id) => {
  const response = await api.post(`/tasks/${id}/archive`);
  return response.data;
};

export const reorderTasks = async (taskIds) => {
  const response = await api.post('/tasks/reorder', { task_ids: taskIds });
  return response.data;
};

export const getRecentActivities = async () => {
  const response = await api.get('/tasks/activities');
  return response.data;
};