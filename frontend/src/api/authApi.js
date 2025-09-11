
import api from "./api";

export const register_or_login = async (email, password) => {
  const response = await api.post("/auth/login_or_register", { email, password });
  return response.data;
};
