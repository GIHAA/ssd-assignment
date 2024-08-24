const express = require("express");
const router = express.Router();

const {
  reqstock,
  getStocks,
  deletestock,
  editstock,
  getstock,
} = require("../controller/eventStockRequestController");
const { protect } = require("../middleware/authMiddleware");

router.post("/reqstock", protect, reqstock);
router.get("/getStocks", protect, getStocks);
router.delete("/deletestock/:id", protect, deletestock);
router.put("/editstock/:id", protect, editstock);
router.get("/getstock/:id", protect, getstock);

module.exports = router;
