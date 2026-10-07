const Joi = require('joi');

const createApplicationSchema = Joi.object({
  jobId: Joi.string().trim().required().messages({
    'any.required': 'Vakansiya ID kerak',
    'string.empty': 'Vakansiya ID kerak',
  }),
  resumeId: Joi.string().trim().required().messages({
    'any.required': 'Rezyume tanlanishi shart',
    'string.empty': 'Rezyume tanlanishi shart',
  }),
  coverLetter: Joi.string().trim().max(3000).allow('', null),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('reviewing', 'shortlisted', 'interview', 'accepted', 'rejected')
    .required()
    .messages({
      'any.only': 'Status notogri',
      'any.required': 'Status kerak',
    }),
});

module.exports = { createApplicationSchema, updateStatusSchema };
