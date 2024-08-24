const express = require("express");
const router = express.Router();
const {
  addPayment,
  readPayment,
  updatePayment,
  deletePayment,
  readAllPayment,
} = require("../controller/paymentController");

const {
  protect,
} = require("../middleware/authMiddleware");
const { paymentValidation } = require("../middleware/cusDonaMiddleware");

router.post("/", protect, paymentValidation, addPayment);
router.get("/:id", protect, readPayment);
router.get("/", protect, readAllPayment);
router.put("/:id", protect, paymentValidation, updatePayment);
router.delete("/:id", protect, deletePayment);

module.exports = router;
