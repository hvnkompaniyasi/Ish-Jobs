/**
 * Barcha Mongoose modellarini markazlashtirilgan holda eksport.
 */

const User = require('./User.model');
const Resume = require('./Resume.model');
const Job = require('./Job.model');
const Application = require('./Application.model');
const Notification = require('./Notification.model');

module.exports = {
  User,
  Resume,
  Job,
  Application,
  Notification,
};
