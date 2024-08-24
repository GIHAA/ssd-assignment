const express = require("express");
const router = express.Router();
const {
  reqBudget,
  getBudgets,
  deletebudget,
  editbudget,
  getbudget,
} = require("../controller/budgetRequestController");
const { protect } = require("../middleware/authMiddleware");

router.post("/reqBudget", protect , reqBudget);
router.get("/getBudgets", protect ,  getBudgets);
router.delete("/deletebudget/:id", protect ,  deletebudget);
router.put("/editbudget/:id",protect , editbudget);
router.get("/getbudget/:id", protect ,getbudget);
module.exports = router;
