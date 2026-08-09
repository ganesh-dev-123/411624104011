import api from './api';

export const login = async (username, password) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  const response = await api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/auth/me', data);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
};
