/**
 * Auth endpointlari uchun validatsiya sxemalari (Joi).
 */

const Joi = require('joi');

// ============ REGISTER ============
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Ism kiritilishi shart',
    'string.min': 'Ism kamida 2 belgi',
    'any.required': 'Ism kiritilishi shart',
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Familiya kiritilishi shart',
    'any.required': 'Familiya kiritilishi shart',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Email formati notogri',
    'any.required': 'Email kiritilishi shart',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Parol kamida 8 belgi',
    'any.required': 'Parol kiritilishi shart',
  }),
  phone: Joi.string()
    .pattern(/^\+?\d{9,15}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Telefon raqam formati notogri',
    }),
  role: Joi.string().valid('seeker', 'employer').default('seeker').messages({
    'any.only': 'Rol faqat: seeker yoki employer',
  }),
  company: Joi.object({
    name: Joi.string().trim().max(100),
    website: Joi.string().uri().allow(null, ''),
  }).when('role', {
    is: 'employer',
    then: Joi.object({ name: Joi.string().trim().max(100).required() }),
  }),
});

// ============ LOGIN ============
const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Email formati notogri',
    'any.required': 'Email kiritilishi shart',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Parol kiritilishi shart',
  }),
});

// ============ REFRESH ============
const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token kiritilishi shart',
  }),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
