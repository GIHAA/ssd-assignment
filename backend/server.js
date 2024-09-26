// server.js
const express = require("express");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const { csrfProtection, getCsrfToken } = require("./middleware/csrfProtection"); 
const { errorHandler } = require("./middleware/errorMiddleware");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

// Import route handlers
const eventregister = require("./routes/registerEventRoutes");
const eventRoutes = require("./routes/eventRoutes");
const efeedbackRoutes = require("./routes/eventFeedbackRoutes");
const vetRoutes = require("./routes/vetRoutes");
const healthRoutes = require("./routes/healthRoutes");
const breedRoutes = require("./routes/breedRoutes");
const statusRoutes = require("./routes/statusRoutes");
const budgetReqRoutes = require("./routes/budgetRequestRoutes");
const eventStockRequestRoutes = require("./routes/eventStockRequestRoutes");
const eventAmountRoutes = require("./routes/eventAmountRoutes");
const auditRoutes = require("./routes/auditRoutes");


connectDB();

const app = express();
const port = process.env.PORT || 8080;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});


app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3001", 
    credentials: true, 
  })
);
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 


app.get("/csrf-token", getCsrfToken);


app.use(csrfProtection);


app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.error("CSRF token mismatch:", err.message);
    res.status(403).json({ message: "Invalid CSRF token" });
  } else {
    next(err);
  }
});

// Define routes
app.use("/qr/", require("./routes/qrRoutes.js"));
app.use("/api/users", require("./routes/userRoutes.js"));
app.use("/api/booking/", require("./routes/bookingRoutes.js"));
app.use("/api/sendEmail/", require("./routes/sendEmailRoutes.js"));
app.use("/api/userspets", require("./routes/usersPetsRoutes"));
app.use("/api/feedback", require("./routes/feedBackRoutes"));
app.use("/api/vehicle/", require("./routes/vehicleRoutes.js"));
app.use("/api/transport/", require("./routes/transportRoutes.js"));
app.use("/api/availability/", require("./routes/availabilityRoutes.js"));
app.use("/api/VehReqPayment/", require("./routes/vehicleBudgetRoutes"));
app.use("/api/eventregister", eventregister);
app.use("/api/event", eventRoutes);
app.use("/api/eventfeedback", efeedbackRoutes);
app.use("/api/vet", vetRoutes);
app.use("/api/petbreed", breedRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/petstatus", statusRoutes);
app.use("/api/counter", require("./routes/counterRoutes"));
app.use("/api/suppliers/", require("./routes/suppliersRoutes"));
app.use("/api/inventory", require("./routes/inventoryItemRoutes"));
app.use("/api/inventory", require("./routes/stockRequestRoutes"));
app.use("/api/inventory", require("./routes/stockReleaseRoutes"));
app.use("/api/eventbudget", budgetReqRoutes);
app.use("/api/eventstock", eventStockRequestRoutes);
app.use("/api/eventamount", eventAmountRoutes);
app.use("/api/stockBudget", require("./routes/stockBudgetRequestRoute"));
app.use("/api/payment/", require("./routes/addPaymentRoutes.js"));
app.use("/api/transaction", require("./routes/transactionRoutes.js"));
app.use("/api/organization", require("./routes/organizationRoutes.js"));
app.use("/api/cusDonation", require("./routes/cusDonationRoutes.js"));
app.use("/api/audits", auditRoutes);

// Global error handler for other types of errors
app.use(errorHandler);

// Start the server
app.listen(port, () => console.log(`Server started on port ${port}`));
