import api from "./api";

export const createPost = async (formData) => {
  const response = await api.post("/posts", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getAllPosts = async (skip = 0, limit = 6) => {
  const response = await api.get(`/posts?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getAllPostsAdmin = async (skip = 0, limit = 10) => {
  const response = await api.get(`/admin/posts?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getPostById = async (id, token) => {
  const response = await api.get(`/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updatePost = async (id, formData, token) => {
  const response = await api.put(`/posts/${id}`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deletePost = async (id, token) => {
  await api.delete(`/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const togglePostActive = async (postId) => {
  const response = await api.put(`/admin/posts/${postId}/toggle-active`);
  return response.data;
};

export const toggleLike = async (id, token) => {
  const response = await api.post(`/posts/${id}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};