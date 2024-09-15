const asyncHandler = require("express-async-handler");
const Booking = require("../models/bookingModel");

const addBooking = asyncHandler(async (req, res) => {
  const {
    cus_id,
    contactNumbers,
    description,
    startDate,
    endDate,
    petCount,
    mini,
    bid,
    cus_name,
    price,
  } = req.body;

  const booking = await Booking.create({
    bid,
    cus_id,
    cus_name,
    contactNumbers,
    description,
    petCount,
    startDate,
    endDate,
    mini,
    price,
  });

  if (booking) {
    // Log audit for booking creation
    await logAudit(req, "ADD_BOOKING", `Booking created for customer ${cus_name}.`);
    res.status(201).json(booking);
  } else {
    res.status(400).json({ message: "Booking not created" });
  }
});


const readBookingOpen = asyncHandler(async (req, res) => {
  const booking = await Booking.find({});
  await logAudit(req, "READ_BOOKING", `Booking viewed for customer ID ${id}.`);
  res.json(booking);
});

const readBooking = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const booking = await Booking.find({ cus_id: id });
  res.json(booking);
});

const updateBooking = asyncHandler(async (req, res) => {
  const { id, description, startDate, endDate, status } = req.body;
  const booking = await Booking.findByIdAndUpdate(id, {
    description,
    startDate,
    endDate,
    status,
  });

  if (booking) {
    // Log audit for booking update
    await logAudit(req, "UPDATE_BOOKING", `Booking ${id} updated with status ${status}.`);
    res.status(201).json(booking);
  } else {
    res.status(400).json({ message: "Booking not updated" });
  }
});


const deleteBooking = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const booking = await Booking.findByIdAndDelete(id);

  if (booking) {
    // Log audit for booking deletion
    await logAudit(req, "DELETE_BOOKING", `Booking ${id} deleted.`);
    res.status(200).json(booking);
  } else {
    res.status(400).json({ message: "Booking not deleted" });
  }
});


module.exports = {
  addBooking,
  readBooking,
  updateBooking,
  deleteBooking,
  readBookingOpen,
};
