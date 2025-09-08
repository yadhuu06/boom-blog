import api from "./api";

export const createComment = async (postId, content) => {
  const response = await api.post(`/comments/${postId}`, { content });
  return response.data;
};

export const getCommentsForPost = async (postId, skip = 0, limit = 5) => {
  const response = await api.get(`/comments/${postId}?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getAllCommentsAdmin = async (skip = 0, limit = 10) => {
  const response = await api.get(`/admin/comments?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await api.put(`/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  await api.delete(`/comments/${commentId}`);
};

export const toggleCommentApprove = async (commentId) => {
  const response = await api.put(`/comments/${commentId}/approve`);
  return response.data;
};