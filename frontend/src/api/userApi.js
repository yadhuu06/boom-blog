// userService.js
import api from "./api";

export const getAllUsers = async (skip = 0, limit = 10) => {
  const response = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, updates) => {
  const response = await api.put(`/users/${id}`, updates);
  return response.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};

export const toggleUserActive = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/toggle-active`);
  return response.data;
};
