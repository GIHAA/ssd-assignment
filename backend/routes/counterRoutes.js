const express = require("express");
const router = express.Router();
const { addCount, getCount } = require("../controller/counterController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addCount);

module.exports = router;
