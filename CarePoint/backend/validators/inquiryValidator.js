const Joi = require("joi");

exports.inquirySchema = Joi.object({
  patientName: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  department: Joi.string().required(),
  message: Joi.string().required()
});
