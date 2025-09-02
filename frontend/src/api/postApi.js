
import api from "./api";

// Create a new post with FormData
export const createPost = async (formData) => {
  const response = await api.post("/posts/", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Get all posts
export const getAllPosts = async () => {
  const response = await api.get("/posts/");
  return response.data;
};

// Get a post by ID (increments view count on backend)
export const getPostById = async (id, token) => {
  const response = await api.get(`/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update a post with FormData
export const updatePost = async (id, formData, token) => {
  const response = await api.put(`/posts/${id}`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Delete a post
export const deletePost = async (id, token) => {
  await api.delete(`/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Toggle like/unlike
export const toggleLike = async (id, token) => {
  const response = await api.post(`/posts/${id}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
