import api from './api';

export const getAllUsers = async (skip = 0, limit = 10) => {
  const response = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const toggleUserActive = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/toggle-active`);
  return response.data;
};

export const getAllPosts = async (skip = 0, limit = 10) => {
  const response = await api.get(`/admin/posts?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const togglePostActive = async (postId) => {
  const response = await api.put(`/admin/posts/${postId}/toggle-active`);
  return response.data;
};
