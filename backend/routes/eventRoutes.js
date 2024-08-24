const express = require("express");
const router = express.Router();
const {
  addEvent,
  getEvents,
  getEvent,
  deleteEvent,
  editEvent,
} = require("../controller/eventController");
const { protect } = require("../middleware/authMiddleware");

router.post("/addEvent", protect, addEvent);
router.get("/getEvents", protect , getEvents);
router.put("/editEvent/:id", protect , editEvent);
router.get("/getEvent/:eventId", protect , getEvent);
router.delete("/deleteEvent/:id", protect , deleteEvent);

module.exports = router;
