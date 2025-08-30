import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/auth";

const api = axios.create({
  baseURL: API_URL,
});

export const register_or_login = async (email, password) => {
  try {
    const response = await api.post("/login_or_register", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Something went wrong');
  }
};