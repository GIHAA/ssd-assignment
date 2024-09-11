const { budgetSchema } = require('../validations/budgetRequestValidation');

const validateBudget = (req, res, next) => {
  const { error } = budgetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateBudget;