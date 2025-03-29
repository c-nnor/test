import axios from "axios";

const api = axios.create({
  baseURL: "", // Empty baseURL since we're using relative URLs with the Nginx proxy
  timeout: 5000, // Increased timeout
});

// Set up request interceptor to include the JWT token in all API requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
