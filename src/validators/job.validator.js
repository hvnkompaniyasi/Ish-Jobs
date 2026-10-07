/**
 * Job endpointlari uchun validatsiya sxemalari (Joi).
 */

const Joi = require('joi');

const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'contract',
  'internship',
  'remote',
];

const EXPERIENCE_LEVELS = ['intern', 'junior', 'middle', 'senior', 'lead'];

const STATUSES = ['draft', 'active', 'closed', 'archived'];

// ============ CREATE ============
const createJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Sarlavha kiritilishi shart',
    'string.min': 'Sarlavha kamida 3 belgi',
    'any.required': 'Sarlavha kiritilishi shart',
  }),
  description: Joi.string().trim().min(20).max(10000).required().messages({
    'string.min': 'Tavsif kamida 20 belgi',
    'any.required': 'Tavsif kiritilishi shart',
  }),
  requirements: Joi.array().items(Joi.string().trim().max(500)).default([]),
  responsibilities: Joi.array()
    .items(Joi.string().trim().max(500))
    .default([]),
  category: Joi.string().trim().default('other'),
  skills: Joi.array().items(Joi.string().trim()).default([]),
  employmentType: Joi.string()
    .valid(...EMPLOYMENT_TYPES)
    .default('full-time')
    .messages({
      'any.only': `Ish turi faqat: ${EMPLOYMENT_TYPES.join(', ')}`,
    }),
  experienceLevel: Joi.string()
    .valid(...EXPERIENCE_LEVELS)
    .default('middle')
    .messages({
      'any.only': `Tajriba darajasi faqat: ${EXPERIENCE_LEVELS.join(', ')}`,
    }),
  salary: Joi.object({
    min: Joi.number().min(0).allow(null).default(null),
    max: Joi.number().min(0).allow(null).default(null),
    currency: Joi.string().default('UZS'),
    isNegotiable: Joi.boolean().default(false),
  }).default({}),
  location: Joi.object({
    city: Joi.string().trim().allow(null, '').default(null),
    country: Joi.string().trim().default('UZ'),
    isRemote: Joi.boolean().default(false),
  }).default({}),
  company: Joi.object({
    name: Joi.string().trim().max(100),
    logo: Joi.string().uri().allow(null, ''),
    website: Joi.string().uri().allow(null, ''),
  }).default({}),
  deadline: Joi.date().iso().allow(null).default(null),
  status: Joi.string()
    .valid(...STATUSES)
    .default('active'),
});

// ============ UPDATE ============
const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150),
  description: Joi.string().trim().min(20).max(10000),
  requirements: Joi.array().items(Joi.string().trim().max(500)),
  responsibilities: Joi.array().items(Joi.string().trim().max(500)),
  category: Joi.string().trim(),
  skills: Joi.array().items(Joi.string().trim()),
  employmentType: Joi.string().valid(...EMPLOYMENT_TYPES),
  experienceLevel: Joi.string().valid(...EXPERIENCE_LEVELS),
  salary: Joi.object({
    min: Joi.number().min(0).allow(null),
    max: Joi.number().min(0).allow(null),
    currency: Joi.string(),
    isNegotiable: Joi.boolean(),
  }),
  location: Joi.object({
    city: Joi.string().trim().allow(null, ''),
    country: Joi.string().trim(),
    isRemote: Joi.boolean(),
  }),
  company: Joi.object({
    name: Joi.string().trim().max(100),
    logo: Joi.string().uri().allow(null, ''),
    website: Joi.string().uri().allow(null, ''),
  }),
  deadline: Joi.date().iso().allow(null),
  status: Joi.string().valid(...STATUSES),
}).min(1);

// ============ QUERY ============
const jobQuerySchema = Joi.object({
  search: Joi.string().trim().allow(''),
  category: Joi.string().trim().allow(''),
  employmentType: Joi.string().valid(...EMPLOYMENT_TYPES, ''),
  experienceLevel: Joi.string().valid(...EXPERIENCE_LEVELS, ''),
  city: Joi.string().trim().allow(''),
  isRemote: Joi.boolean(),
  minSalary: Joi.number().min(0),
  maxSalary: Joi.number().min(0),
  status: Joi.string().valid(...STATUSES),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
};
