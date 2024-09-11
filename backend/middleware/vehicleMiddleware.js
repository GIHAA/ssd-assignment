const { vehicleSchema } = require('../validations/vehicleValidation');

const validateVehicle = (req, res, next) => {
  const { error } = vehicleSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = validateVehicle;
