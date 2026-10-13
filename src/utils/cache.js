/**
 * In-Memory Cache — Node.js jarayoni ichida.
 * Single-instance (Render Free/Starter) uchun ideal.
 */

const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

const PREFIXES = {
  JOBS_LIST: 'jobs:list:',
  JOBS_MAP: 'jobs:map',
  JOB_DETAIL: 'jobs:detail:',
};

function buildJobsListKey(filters, pagination) {
  return PREFIXES.JOBS_LIST + JSON.stringify(filters || {}) + ':' + JSON.stringify(pagination || {});
}

function invalidateJobCache(jobId) {
  const keys = cache.keys();
  let n = 0;
  for (const k of keys) {
    if (
      k.startsWith(PREFIXES.JOBS_LIST) ||
      k === PREFIXES.JOBS_MAP ||
      (jobId && k === PREFIXES.JOB_DETAIL + jobId)
    ) {
      cache.del(k);
      n++;
    }
  }
  return n;
}

module.exports = { cache, PREFIXES, buildJobsListKey, invalidateJobCache };
