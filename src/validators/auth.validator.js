const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?\d{9,15}$/).required(),
  email: Joi.string().email().lowercase().trim().allow(null, '').optional(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('seeker', 'employer').default('seeker'),
  company: Joi.object({
    name: Joi.string().trim().max(100),
    website: Joi.string().uri().allow(null, ''),
  }),
});

const loginSchema = Joi.object({
  identifier: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const switchRoleSchema = Joi.object({
  role: Joi.string().valid('seeker', 'employer').required(),
});

/**
 * Hisobni o'chirish — parol tasdiqlanadi
 */
const deleteAccountSchema = Joi.object({
  password: Joi.string().required().messages({
    'any.required': 'Parolni kiritish shart',
    'string.empty': 'Parolni kiritish shart',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  switchRoleSchema,
  deleteAccountSchema,
};
