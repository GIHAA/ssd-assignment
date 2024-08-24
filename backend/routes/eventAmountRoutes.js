const express = require("express");
const router = express.Router();
const {
  addeamount,
  geteamounts,
  deleteeamount,
  geteamount,
  editeamount,
} = require("../controller/eventAmountController");
const { protect } = require("../middleware/authMiddleware");

router.post("/addeamount", protect , addeamount);
router.get("/geteamounts", protect , geteamounts);
router.delete("/deleteeamount/:id", protect , deleteeamount);
router.put("/editeamount/:id", protect , editeamount);
router.get("/geteamount/:id", protect , geteamount);
module.exports = router;
