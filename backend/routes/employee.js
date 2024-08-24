const express = require("express");
const router = express.Router();

const {
  addEmployee,
  getEmployeeById,
  deleteEmployee,
  getEmployee,
  updateEmployee,
} = require("../controller/Employee.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect , addEmployee);
router.get("/:id", protect , getEmployeeById);
router.delete("/:id", protect , deleteEmployee);
router.get("/", protect , getEmployee);
router.put("/:id", protect , updateEmployee);

module.exports = router;
