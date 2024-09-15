const mongoose = require("mongoose");

const auditSchema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, // Keep ObjectId reference
      ref: "User",
      required: false,
    },
    userName: {
      type: String, // Add a field to store the user's name
      required: false,
    },
    description: {
      type: String,
    },
    status:{
      type:String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Audit", auditSchema);
