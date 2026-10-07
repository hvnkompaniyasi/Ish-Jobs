const Joi = require('joi');

const experienceItemSchema = Joi.object({
  company: Joi.string().trim().min(1).max(150).required(),
  position: Joi.string().trim().min(1).max(150).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().allow(null).default(null),
  current: Joi.boolean().default(false),
  description: Joi.string().trim().max(2000).allow('', null),
});

const educationItemSchema = Joi.object({
  institution: Joi.string().trim().min(1).max(200).required(),
  degree: Joi.string().trim().max(150).allow('', null),
  field: Joi.string().trim().max(150).allow('', null),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().allow(null).default(null),
});

const salarySchema = Joi.object({
  min: Joi.number().min(0).allow(null).default(null),
  max: Joi.number().min(0).allow(null).default(null),
  currency: Joi.string().default('UZS'),
}).default({});

const createResumeSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150).required(),
  about: Joi.string().trim().max(3000).allow('', null),
  audioUrl: Joi.string().uri().allow(null, ''),
  audioTranscript: Joi.string().allow(null, ''),
  skills: Joi.array().items(Joi.string().trim().max(50)).default([]),
  experience: Joi.array().items(experienceItemSchema).default([]),
  education: Joi.array().items(educationItemSchema).default([]),
  languages: Joi.array().items(Joi.string().trim()).default([]),
  expectedSalary: salarySchema,
  location: Joi.string().trim().max(150).allow(null, ''),
  isPublic: Joi.boolean().default(true),
  isPrimary: Joi.boolean().default(false),
});

const updateResumeSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150),
  about: Joi.string().trim().max(3000).allow('', null),
  audioUrl: Joi.string().uri().allow(null, ''),
  audioTranscript: Joi.string().allow(null, ''),
  skills: Joi.array().items(Joi.string().trim().max(50)),
  experience: Joi.array().items(experienceItemSchema),
  education: Joi.array().items(educationItemSchema),
  languages: Joi.array().items(Joi.string().trim()),
  expectedSalary: Joi.object({
    min: Joi.number().min(0).allow(null),
    max: Joi.number().min(0).allow(null),
    currency: Joi.string(),
  }),
  location: Joi.string().trim().max(150).allow(null, ''),
  isPublic: Joi.boolean(),
  isPrimary: Joi.boolean(),
}).min(1);

module.exports = { createResumeSchema, updateResumeSchema };
