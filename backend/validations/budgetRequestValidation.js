const Joi = require('joi');

// Schema for budget request
const budgetSchema = Joi.object({
  eid: Joi.string().required(),
  budgetid: Joi.string().required(),
  eventName: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        amount: Joi.number().required(),
      })
    )
    .required(),
  description: Joi.string().required(),
  total: Joi.number().required(),
  status: Joi.string().required(),
});

module.exports = { budgetSchema };
