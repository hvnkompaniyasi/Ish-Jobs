/**
 * Barcha Mongoose modellarini markazlashtirilgan holda eksport.
 *
 * Misol:
 *   const { User, Resume, Job, Application } = require('../models');
 */

const User = require('./User.model');
const Resume = require('./Resume.model');
const Job = require('./Job.model');
const Application = require('./Application.model');

module.exports = {
  User,
  Resume,
  Job,
  Application,
};
