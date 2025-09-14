// src/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {

        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.access_token;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshErr) {
        console.log("axios refresh errror")
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }


    return Promise.reject(error);
  }
);

export default api;
