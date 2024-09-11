const Joi = require('joi');

// Schema for vehicle payload validation (without custom messages)
const vehicleSchema = Joi.object({
  plateNo: Joi.string().required(),
  vModel: Joi.string().required(),
  fuelType: Joi.string().required(),
  insuranceExpirationDate: Joi.string().required(),
});

module.exports = { vehicleSchema };
