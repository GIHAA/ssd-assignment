import asynchandler from "express-async-handler";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_API}api/booking/`;

const user = JSON.parse(localStorage.getItem("user"));

const getAllBookings = asynchandler(async () => {
  const response = await axios.get(API_URL + user._id, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
});

const getUserBookings = asynchandler(async (userData) => {
  const response = await axios.post(API_URL + "user", userData, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
});

const addBooking = asynchandler(async (userData) => {
  const response = await axios.post(API_URL, userData, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });

  return response.data;
});

const updateBooking = asynchandler(async (userData) => {
  const response = await axios.put(API_URL, userData, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });

  return response.data;
});

const deleteBooking = asynchandler(async (userData) => {
  const response = await axios.delete(API_URL + userData.id, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
});

const bookingServices = {
  getAllBookings,
  getUserBookings,
  addBooking,
  updateBooking,
  deleteBooking,
};

export default bookingServices;
