const express = require("express");
const router = express.Router();
const {
  createAudit,
  getAudits,
  getAuditById,
  updateAudit,
  deleteAudit,
} = require("../controller/auditController");

// Create a new audit record
router.post("/", createAudit);

// Get all audit records
router.get("/", getAudits);

// Get a single audit record by ID
router.get("/:id", getAuditById);

// Update an audit record by ID
router.put("/:id", updateAudit);

// Delete an audit record by ID
router.delete("/:id", deleteAudit);

module.exports = router;
