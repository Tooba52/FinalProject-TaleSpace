import axios from "axios";
import { ACCESS_TOKEN } from "./constants";
import { REFRESH_TOKEN } from "./constants";
import { logout } from "./components/utils"; // Utility function to log the user out (clear tokens)

// Create an Axios instance with the base API URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error) 
);

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is related to expired token (401 Unauthorized)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      // Attempt to refresh the token
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          );

          // Save the new access token in localStorage
          const newAccessToken = response.data.access;
          localStorage.setItem(ACCESS_TOKEN, newAccessToken);

          // Retry the original request with the new access token
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log the user out
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        // If no refresh token, log the user out
        logout();
      }
    }

    // If error is not related to expired token or retry failed, reject promise
    return Promise.reject(error);
  }
);

export default api;
