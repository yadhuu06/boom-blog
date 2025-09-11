import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong";

    if (error.response) {
      
      message =
        error.response.data?.detail ||
        error.response.data?.message ||
        `Error ${error.response.status}: ${error.response.statusText}`;

      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else if (error.request) {
      
      message = "No response from server. Please try again.";
    } else {
      
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
