const express = require("express");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
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
  facebook,
  facebookCallback,
  google,
  googleCallback,
} = require("../controller/userController");
const {
  protect,
  userProtect,
  adminProtect,
} = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.get('/google' , google)
router.get('/google/callback' , googleCallback)
router.get('facebook' , facebook)
router.get('facebook/callback' , facebookCallback)
router.post("/forgot", forgotUser);
router.delete("/", protect, userProtect, deleteUser);


module.exports = router;
