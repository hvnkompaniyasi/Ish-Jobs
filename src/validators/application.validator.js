/**
 * Application endpointlari uchun Joi validatsiya sxemalari.
 */

const Joi = require('joi');

// ============ CREATE (seeker) ============
const createApplicationSchema = Joi.object({
  job: Joi.string().hex().length(24).required().messages({
    'any.required': 'Vakansiya ID kerak',
    'string.length': 'Vakansiya ID formati notogri',
  }),
  resume: Joi.string().hex().length(24).required().messages({
    'any.required': 'Rezyume ID kerak',
    'string.length': 'Rezyume ID formati notogri',
  }),
  coverLetter: Joi.string().trim().max(3000).allow('', null),
});

// ============ UPDATE STATUS (employer) ============
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('reviewing', 'shortlisted', 'interview', 'accepted', 'rejected')
    .required()
    .messages({
      'any.only': 'Status notogri',
      'any.required': 'Status kiritilishi shart',
    }),
  employerNote: Joi.string().trim().max(1000).allow('', null),
});

// ============ LIST QUERY ============
const listApplicationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid(
    'pending',
    'reviewing',
    'shortlisted',
    'interview',
    'accepted',
    'rejected',
    'withdrawn'
  ),
  jobId: Joi.string().hex().length(24),
  sortBy: Joi.string().valid('createdAt', 'matchScore').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createApplicationSchema,
  updateStatusSchema,
  listApplicationsQuerySchema,
};
