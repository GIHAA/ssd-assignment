const express = require("express");
const { csrfProtection, getCsrfToken } = require("../middleware/csrfProtection");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  viewUsers,
  deleteAdmin,
  updateAdmin,
  forgotUser,
} = require("../controller/userController");
const {
  protect,
  userProtect,
  adminProtect,
} = require("../middleware/authMiddleware");

// Route to get the CSRF token - accessible without CSRF protection
router.get("/csrf-token", getCsrfToken);

// Apply CSRF protection directly to routes that require it
router.get("/", csrfProtection, viewUsers);
router.post("/", csrfProtection, registerUser);
router.post("/login", csrfProtection, loginUser); // Make sure loginUser handles CSRF properly
router.post("/update", csrfProtection, protect, userProtect, updateUser);
router.post("/forgot", csrfProtection, forgotUser);
router.delete("/", protect, userProtect, deleteUser);

// Admin-specific routes with protection
router.put("/:id", protect, adminProtect, updateAdmin);
router.delete("/:id", protect, adminProtect, deleteAdmin);

module.exports = router;
