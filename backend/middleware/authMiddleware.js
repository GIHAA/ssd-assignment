const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const logAudit = require("../middleware/logAudit");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findOne({ _id: decoded.id }).select("-password");

      if (!req.user) throw new Error();

      // Log successful authorization
      await logAudit(req, "ACCESS_GRANTED", `User ID: ${req.user._id} User Roole: ${req.user.role}}accessed the resource.`);

      next();
    } catch (error) {
      console.log(error);

      // Log failed authorization attempt
      await logAudit(req, "ACCESS_DENIED", "Invalid token or unauthorized access attempt.");

      res.status(401);
      throw new Error("Not authorized");
    }
  } else {
    // Log missing token attempt
    await logAudit(req, "ACCESS_DENIED", "No token provided.");

    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
const userProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "USER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not a USER");
  }
});

const adminProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "ADMIN") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an ADMIN");
  }
});

const eventProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "EVENT_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not a EVENT_MANAGER");
  }
});

const iventoryProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "INVENTORY_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an EVENT_MANAGER");
  }
});

const vehicleProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "VEHICLE_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an VEHICLE_MANAGER");
  }
});

const animalProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "ANIMAL_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an ANIMAL_MANAGER");
  }
});

const finacialProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "FINANCIAL_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an FINANCIAL_MANAGER");
  }
});

const supplierProtect = asyncHandler(async (req, res, next) => {
  if (req.user.role == "SUPPLIER_MANAGER") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized, not an SUPPLIER_MANAGER");
  }
});

module.exports = {
  protect,
  userProtect,
  adminProtect,
  eventProtect,
  iventoryProtect,
  vehicleProtect,
  animalProtect,
  finacialProtect,
  supplierProtect,
};
