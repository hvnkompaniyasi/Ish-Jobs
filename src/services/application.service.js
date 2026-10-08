const mongoose = require('mongoose');
const { Application, Job, Resume } = require('../models');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

async function createApplication(data, user) {
  const { jobId, resumeId, coverLetter } = data;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Vakansiya ID notogri');
  }
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, 'Rezyume ID notogri');
  }

  const [job, resume] = await Promise.all([
    Job.findById(jobId),
    Resume.findById(resumeId),
  ]);

  if (!job) throw new ApiError(404, 'Vakansiya topilmadi');
  if (job.status !== 'active') throw new ApiError(400, 'Bu vakansiya faol emas');
  if (!resume) throw new ApiError(404, 'Rezyume topilmadi');

  if (resume.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Faqat oz rezyumeingiz bilan ariza topshirishingiz mumkin');
  }

  const existing = await Application.findOne({ applicant: user._id, job: jobId });
  if (existing) throw new ApiError(409, 'Siz bu vakansiyaga allaqachon ariza topshirgansiz');

  const application = await Application.create({
    applicant: user._id,
    job: jobId,
    resume: resumeId,
    coverLetter: coverLetter || null,
    status: 'pending',
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  // Employer'ga notification
  try {
    await notificationService.createNotification({
      recipient: job.employer,
      type: 'application_received',
      title: 'Yangi ariza keldi!',
      message: `${user.firstName} ${user.lastName} "${job.title}" vakansiyasiga ariza topshirdi`,
      sender: user._id,
      link: `/jobs/${job._id}/applications`,
      meta: { jobId: job._id, applicationId: application._id },
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  return application.populate([
    { path: 'job', select: 'title company location employmentType experienceLevel salary status' },
    { path: 'resume', select: 'title' },
  ]);
}

async function getMyApplications(user) {
  const applications = await Application.find({ applicant: user._id })
    .sort({ createdAt: -1 })
    .populate('job', 'title company location employmentType experienceLevel salary status createdAt')
    .populate('resume', 'title');
  return applications;
}

async function getApplicationsForJob(jobId, user) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Vakansiya ID notogri');
  }

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Vakansiya topilmadi');

  if (job.employer.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Bu vakansiyaga kelgan arizalarni korish huquqi yoq');
  }

  const applications = await Application.find({ job: jobId })
    .sort({ createdAt: -1 })
    .populate('applicant', 'firstName lastName phone email avatar')
    .populate('resume');

  return { job, applications };
}

async function updateApplicationStatus(id, status, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Ariza ID notogri');
  }

  const allowed = ['reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status faqat: ${allowed.join(', ')}`);
  }

  const application = await Application.findById(id).populate('job');
  if (!application) throw new ApiError(404, 'Ariza topilmadi');

  const job = application.job;
  if (job.employer.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Bu arizani ozgartirish huquqi yoq');
  }

  application.status = status;
  if (!application.viewedAt) application.viewedAt = new Date();
  application.respondedAt = new Date();
  await application.save();

  return application.populate('applicant', 'firstName lastName phone email avatar');
}

async function withdrawApplication(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Ariza ID notogri');
  }

  const application = await Application.findById(id);
  if (!application) throw new ApiError(404, 'Ariza topilmadi');

  if (application.applicant.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Faqat oz arizangizni olib tashlashingiz mumkin');
  }

  if (['accepted', 'rejected'].includes(application.status)) {
    throw new ApiError(400, 'Yakunlangan arizani olib tashlab bolmaydi');
  }

  application.status = 'withdrawn';
  await application.save();

  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

  return application;
}

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  withdrawApplication,
};
