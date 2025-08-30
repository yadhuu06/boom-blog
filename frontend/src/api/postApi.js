import api from "./api";

export const createPost = async (post) => {
  const response = await api.post("/posts/", post);
  return response.data;
};

export const getAllPosts = async () => {
  const response = await api.get("/posts/");
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const updatePost = async (id, updates) => {
  const response = await api.put(`/posts/${id}`, updates);
  return response.data;
};

export const deletePost = async (id) => {
  await api.delete(`/posts/${id}`);
};

export const incrementView = async (id) => {
  const response = await api.post(`/posts/${id}/view`);
  return response.data;
};

export const toggleLike = async (id) => {
  const response = await api.post(`/posts/${id}/like`);
  return response.data;
};
