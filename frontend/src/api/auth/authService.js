
import axios from "../axiosConfig"; 

const API_URL = `${process.env.REACT_APP_BACKEND_API}api/users/`;

// Register user
export const register = async (userData) => {
  const response = await axios.post(API_URL, userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
export const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData, {
    withCredentials: true, 
  });
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data)); 
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  logout,
  login,
};

export default authService;
