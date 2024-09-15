const asyncHandler = require("express-async-handler");
const Audit = require("../models/auditModel");

// Create new audit record
const createAudit = asyncHandler(async (req, res) => {
  const { action, user, description, ipAddress } = req.body;

  const audit = await Audit.create({
    action,
    user,
    description,
    ipAddress: ipAddress || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
  });

  if (audit) {
    res.status(201).json(audit);
  } else {
    res.status(400);
    throw new Error("Invalid audit data");
  }
});

// Get all audit records
const getAudits = asyncHandler(async (req, res) => {
  const audits = await Audit.find({});

  if (audits) {
    res.status(200).json(audits);
  } else {
    res.status(404);
    throw new Error("Audits not found");
  }
});

// Get single audit log by ID
const getAuditLogById = asyncHandler(async (req, res) => {
  const auditLog = await Audit.findById(req.params.id).populate("user"); 
  if (auditLog) {
    res.json(auditLog);
  } else {
    res.status(404);
    throw new Error("Audit log not found");
  }
});


// Update audit by ID
const updateAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (audit) {
    audit.action = req.body.action || audit.action;
    audit.description = req.body.description || audit.description;
    audit.ipAddress = req.body.ipAddress || audit.ipAddress;

    const updatedAudit = await audit.save();
    res.status(200).json(updatedAudit);
  } else {
    res.status(404);
    throw new Error("Audit not found");
  }
});

// Delete audit by ID
const deleteAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);

  if (audit) {
    await audit.remove();
    res.status(200).json({ message: "Audit record removed" });
  } else {
    res.status(404);
    throw new Error("Audit not found");
  }
});

module.exports = {
  createAudit,
  getAudits,
  getAuditLogById,
  updateAudit,
  deleteAudit,
};
