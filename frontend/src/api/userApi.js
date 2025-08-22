import axios from "axios";

const API_URL = "http://127.0.0.1:8000/users";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createUser = async (user) => {
  const response = await api.post("/", user);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/");
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const updateUser = async (id, updates) => {
  const response = await api.put(`/${id}`, updates);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};
