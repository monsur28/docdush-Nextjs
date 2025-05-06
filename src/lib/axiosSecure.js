import axios from "axios";

const axiosSecure = axios.create();

// Add a request interceptor to attach the token to every request
axiosSecure.interceptors.request.use(
  (config) => {
    // Get token from localStorage with the correct key "jwtToken"
    const token = localStorage.getItem("jwtToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
axiosSecure.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the error is due to an expired token (401), you might want to redirect to login
    if (error.response?.status === 401) {
      // You can add logic here to redirect to login or refresh the token
    }
    return Promise.reject(error);
  }
);

export default axiosSecure;
