import api from "./api";

export const addComment = async (postId, content) => {
  const response = await api.post(`/comments/${postId}`, { content });
  return response.data;
};

export const getCommentsForPost = async (postId) => {
  const response = await api.get(`/comments/${postId}`);
  return response.data;
};

export const updateComment = async (postId, commentId, content) => {
  const response = await api.put(`/comments/${postId}/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (postId, commentId) => {
  await api.delete(`/comments/${postId}/${commentId}`);
};
