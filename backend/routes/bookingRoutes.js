const express = require("express");
const router = express.Router();
const {
  readBooking,
  addBooking,
  updateBooking,
  deleteBooking,
  readUserBooking,
  readBookingOpen,
} = require("../controller/bookingController");
const {
  protect,
  userProtect,
  adminProtect,
} = require("../middleware/authMiddleware");

router.post("/", protect, addBooking);
router.get("/:id", protect , readBooking);
router.get("/", protect, readBookingOpen);
router.put("/", protect , updateBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
