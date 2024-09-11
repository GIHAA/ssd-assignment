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
const validateBudget = require('../middleware/budgetRequestMiddleware');

router.post("/reqBudget", protect ,validateBudget, reqBudget);
router.put("/editbudget/:id",protect ,validateBudget, editbudget);

router.get("/getBudgets", protect ,  getBudgets);
router.delete("/deletebudget/:id", protect ,  deletebudget);
router.get("/getbudget/:id", protect ,getbudget);
module.exports = router;

