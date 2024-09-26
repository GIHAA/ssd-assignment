// src/axiosConfig.js
import axios from "axios";
import {getCSRFToken} from "./auth/csrfService"

axios.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
