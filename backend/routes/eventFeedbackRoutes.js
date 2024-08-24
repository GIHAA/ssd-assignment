const express = require("express");
const router = express.Router();
const {
  addFeedback,
  getEFeedbacks,
  deleteFeedback,
} = require("../controller/eventFeedbackController");
const { protect } = require("../middleware/authMiddleware");

router.post("/addFeedback", protect , addFeedback);
router.get("/getEFeedbacks", protect , getEFeedbacks);
router.delete("/deletefeedback/:id", protect , deleteFeedback);

module.exports = router;
