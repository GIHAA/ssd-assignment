const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const logAudit = require("./logAudit");

// General protect middleware for all authenticated routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) throw new Error();
      await logAudit(req, "ACCESS_GRANTED", `User ID: ${req.user._id} accessed the resource.`);
      next();
    } catch (error) {
      await logAudit(req, "ACCESS_DENIED", "Invalid token or unauthorized access attempt.");
      res.status(401);
      throw new Error("Not authorized");
    }
  } else {
    await logAudit(req, "ACCESS_DENIED", "No token provided.");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// User role protection
const userProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "USER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not a USER");
  }
});

// Admin role protection
const adminProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "ADMIN") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an ADMIN");
  }
});

// Event manager role protection
const eventProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "EVENT_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an EVENT_MANAGER");
  }
});

// Inventory manager role protection
const inventoryProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "INVENTORY_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an INVENTORY_MANAGER");
  }
});

// Vehicle manager role protection
const vehicleProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "VEHICLE_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not a VEHICLE_MANAGER");
  }
});

// Animal manager role protection
const animalProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "ANIMAL_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an ANIMAL_MANAGER");
  }
});

// Financial manager role protection
const financialProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "FINANCIAL_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not a FINANCIAL_MANAGER");
  }
});

// Supplier manager role protection
const supplierProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role === "SUPPLIER_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not a SUPPLIER_MANAGER");
  }
});

module.exports = {
  protect,
  userProtect,
  adminProtect,
  eventProtect,
  inventoryProtect,
  vehicleProtect,
  animalProtect,
  financialProtect,
  supplierProtect,
};
