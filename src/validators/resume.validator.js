/**
 * Resume endpointlari uchun Joi validatsiya sxemalari.
 */

const Joi = require('joi');

// ============ SUB-SXEMALAR ============
const experienceItemSchema = Joi.object({
  company: Joi.string().trim().max(150).required().messages({
    'any.required': 'Kompaniya nomi kerak',
  }),
  position: Joi.string().trim().max(150).required().messages({
    'any.required': 'Lavozim kerak',
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Boshlanish sanasi kerak',
  }),
  endDate: Joi.date().iso().allow(null),
  current: Joi.boolean().default(false),
  description: Joi.string().trim().max(2000).allow('', null),
});

const educationItemSchema = Joi.object({
  institution: Joi.string().trim().max(200).required().messages({
    'any.required': 'Muassasa nomi kerak',
  }),
  degree: Joi.string().trim().max(100).allow('', null),
  field: Joi.string().trim().max(150).allow('', null),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Boshlanish sanasi kerak',
  }),
  endDate: Joi.date().iso().allow(null),
});

const salarySchema = Joi.object({
  min: Joi.number().min(0).allow(null),
  max: Joi.number().min(0).allow(null),
  currency: Joi.string().valid('UZS', 'USD', 'EUR', 'RUB').default('UZS'),
});

// ============ CREATE ============
const createResumeSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Sarlavha kiritilishi shart',
    'any.required': 'Sarlavha kiritilishi shart',
  }),
  about: Joi.string().trim().max(3000).allow('', null),
  skills: Joi.array().items(Joi.string().trim().max(50)).default([]),
  experience: Joi.array().items(experienceItemSchema).default([]),
  education: Joi.array().items(educationItemSchema).default([]),
  languages: Joi.array().items(Joi.string().trim().max(50)).default([]),
  expectedSalary: salarySchema.default({}),
  location: Joi.string().trim().max(150).allow('', null),
  isPublic: Joi.boolean().default(true),
  isPrimary: Joi.boolean().default(false),
});

// ============ UPDATE ============
const updateResumeSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150),
  about: Joi.string().trim().max(3000).allow('', null),
  skills: Joi.array().items(Joi.string().trim().max(50)),
  experience: Joi.array().items(experienceItemSchema),
  education: Joi.array().items(educationItemSchema),
  languages: Joi.array().items(Joi.string().trim().max(50)),
  expectedSalary: salarySchema,
  location: Joi.string().trim().max(150).allow('', null),
  isPublic: Joi.boolean(),
  isPrimary: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Kamida bitta maydon ozgartirilishi kerak',
});

// ============ LIST QUERY ============
const listResumesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(200).allow(''),
  skills: Joi.string().trim().max(500).allow(''), // "Node.js,MongoDB" ko'rinishida
  location: Joi.string().trim().max(150),
  minExperience: Joi.number().min(0),
  sortBy: Joi.string().valid('createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createResumeSchema,
  updateResumeSchema,
  listResumesQuerySchema,
};
