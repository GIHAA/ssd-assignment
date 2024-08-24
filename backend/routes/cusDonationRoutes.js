const express = require("express");
const router = express.Router();
const {
  addcusDonation,
  readcusDonation,
  updatecusDonation,
  deletecusDonation,
  readcusAllDonation,
} = require("../controller/cusDonationController");

const { addUserValidation } = require("../middleware/cusDonaMiddleware");
const {
  protect,
  userProtect,
  adminProtect,
} = require("../middleware/authMiddleware");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addUserValidation, addcusDonation);
router.get("/", protect, readcusAllDonation);
router.get("/:id", protect, readcusDonation);
router.put("/:id", protect, addUserValidation, updatecusDonation);
router.delete("/:id", protect, deletecusDonation);
protect, (module.exports = router);
