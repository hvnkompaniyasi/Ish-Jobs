/**
 * Job endpointlari uchun Joi validatsiya sxemalari.
 */

const Joi = require('joi');

const salarySchema = Joi.object({
  min: Joi.number().min(0).allow(null),
  max: Joi.number().min(0).allow(null),
  currency: Joi.string().valid('UZS', 'USD', 'EUR', 'RUB').default('UZS'),
  isNegotiable: Joi.boolean().default(false),
});

const locationSchema = Joi.object({
  city: Joi.string().trim().max(100).allow(null, ''),
  country: Joi.string().trim().max(50).default('UZ'),
  isRemote: Joi.boolean().default(false),
});

const companySchema = Joi.object({
  name: Joi.string().trim().max(150),
  logo: Joi.string().uri().allow(null, ''),
  website: Joi.string().uri().allow(null, ''),
});

// ============ CREATE ============
const createJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Sarlavha kiritilishi shart',
    'any.required': 'Sarlavha kiritilishi shart',
  }),
  description: Joi.string().trim().min(20).max(10000).required().messages({
    'string.min': 'Tavsif kamida 20 belgi',
    'any.required': 'Tavsif kiritilishi shart',
  }),
  requirements: Joi.array().items(Joi.string().trim().max(500)).default([]),
  responsibilities: Joi.array().items(Joi.string().trim().max(500)).default([]),
  category: Joi.string().trim().max(100).default('other'),
  skills: Joi.array().items(Joi.string().trim().max(50)).default([]),
  employmentType: Joi.string()
    .valid('full-time', 'part-time', 'contract', 'internship', 'remote')
    .default('full-time'),
  experienceLevel: Joi.string()
    .valid('intern', 'junior', 'middle', 'senior', 'lead')
    .default('middle'),
  salary: salarySchema.default({}),
  location: locationSchema.default({}),
  company: companySchema,
  deadline: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'active', 'closed', 'archived').default('active'),
});

// ============ UPDATE ============
const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150),
  description: Joi.string().trim().min(20).max(10000),
  requirements: Joi.array().items(Joi.string().trim().max(500)),
  responsibilities: Joi.array().items(Joi.string().trim().max(500)),
  category: Joi.string().trim().max(100),
  skills: Joi.array().items(Joi.string().trim().max(50)),
  employmentType: Joi.string().valid(
    'full-time',
    'part-time',
    'contract',
    'internship',
    'remote'
  ),
  experienceLevel: Joi.string().valid('intern', 'junior', 'middle', 'senior', 'lead'),
  salary: salarySchema,
  location: locationSchema,
  company: companySchema,
  deadline: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'active', 'closed', 'archived'),
}).min(1).messages({
  'object.min': 'Kamida bitta maydon ozgartirilishi kerak',
});

// ============ LIST QUERY ============
const listJobsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).allow(''),
  category: Joi.string().trim().max(100),
  employmentType: Joi.string().valid(
    'full-time',
    'part-time',
    'contract',
    'internship',
    'remote'
  ),
  experienceLevel: Joi.string().valid('intern', 'junior', 'middle', 'senior', 'lead'),
  city: Joi.string().trim().max(100),
  isRemote: Joi.boolean(),
  minSalary: Joi.number().min(0),
  status: Joi.string().valid('draft', 'active', 'closed', 'archived').default('active'),
  sortBy: Joi.string().valid('createdAt', 'salary.min', 'viewsCount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createJobSchema,
  updateJobSchema,
  listJobsQuerySchema,
};
