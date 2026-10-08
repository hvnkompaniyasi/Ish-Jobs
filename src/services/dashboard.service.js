/**
 * Dashboard biznes-logikasi — Employer uchun analitika.
 * MongoDB Aggregation orqali.
 */

const mongoose = require('mongoose');
const { Job, Application } = require('../models');

/**
 * Period uchun date chegarasini hisoblash.
 */
function getPeriodStart(period) {
  const now = new Date();
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null; // 'all'
}

/**
 * Employer Dashboard statistikasi.
 */
async function getEmployerDashboard(user, filters = {}) {
  const period = filters.period || '30d';
  const periodStart = getPeriodStart(period);

  // 1. Employer'ning barcha vakansiyalari
  const jobs = await Job.find({ employer: user._id })
    .select('_id title status viewsCount applicationsCount createdAt')
    .lean();

  const jobIds = jobs.map((j) => j._id);
  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.viewsCount || 0), 0);

  // Agar jobs yo'q bo'lsa — bo'sh natija
  if (jobIds.length === 0) {
    return emptyDashboard(activeJobs);
  }

  // 2. Application aggregation
  const appMatch = { job: { $in: jobIds } };
  if (periodStart) appMatch.createdAt = { $gte: periodStart };

  const [statusAgg, dailyAgg, topJobsAgg, recentApps] = await Promise.all([
    // Status taqsimoti
    Application.aggregate([
      { $match: appMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Kunlik arizalar (line chart)
    Application.aggregate([
      { $match: appMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),

    // Top vakansiyalar
    Application.aggregate([
      { $match: appMatch },
      { $group: { _id: '$job', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      { $project: { _id: 1, count: 1, title: '$job.title', status: '$job.status' } },
    ]),

    // Oxirgi 5 ariza
    Application.find(appMatch)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('applicant', 'firstName lastName avatarUrl phone')
      .populate('job', 'title')
      .populate('resume', 'title')
      .lean(),
  ]);

  // 3. Status distribution → object
  const statusDistribution = {
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
  };
  statusAgg.forEach((s) => {
    statusDistribution[s._id] = s.count;
  });

  // 4. Funnel hisoblash
  const totalApps = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
  const funnel = {
    views: totalViews,
    applications: totalApps,
    shortlisted:
      statusDistribution.shortlisted +
      statusDistribution.interview +
      statusDistribution.accepted,
    accepted: statusDistribution.accepted,
  };

  // 5. Konversiya foizlari
  const stats = {
    activeJobs,
    totalJobs: jobs.length,
    totalViews,
    totalApplications: totalApps,
    newApplications: statusDistribution.pending,
    accepted: statusDistribution.accepted,
    acceptanceRate: totalApps > 0
      ? Math.round((statusDistribution.accepted / totalApps) * 1000) / 10
      : 0,
  };

  // 6. Daily data — bo'sh kunlarni to'ldirish
  const applicationsByDay = fillDailyData(dailyAgg, period);

  return {
    stats,
    funnel,
    statusDistribution,
    applicationsByDay,
    topJobs: topJobsAgg.map((t) => ({
      jobId: t._id,
      title: t.title,
      status: t.status,
      applications: t.count,
    })),
    recentApplications: recentApps.map((a) => ({
      _id: a._id,
      applicant: a.applicant,
      job: a.job,
      resume: a.resume,
      status: a.status,
      createdAt: a.createdAt,
    })),
    period,
  };
}

/**
 * Bo'sh dashboard (jobs yo'q).
 */
function emptyDashboard(activeJobs) {
  return {
    stats: {
      activeJobs: 0,
      totalJobs: 0,
      totalViews: 0,
      totalApplications: 0,
      newApplications: 0,
      accepted: 0,
      acceptanceRate: 0,
    },
    funnel: { views: 0, applications: 0, shortlisted: 0, accepted: 0 },
    statusDistribution: {
      pending: 0, reviewing: 0, shortlisted: 0,
      interview: 0, accepted: 0, rejected: 0, withdrawn: 0,
    },
    applicationsByDay: [],
    topJobs: [],
    recentApplications: [],
    period: '30d',
  };
}

/**
 * Kunlik ma'lumotlarni to'ldirish (bo'sh kunlar 0).
 */
function fillDailyData(dailyAgg, period) {
  const map = new Map(dailyAgg.map((d) => [d._id, d.count]));
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 60;
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) || 0 });
  }

  return result;
}

module.exports = { getEmployerDashboard };
