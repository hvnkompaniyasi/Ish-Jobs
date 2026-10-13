/**
 * Views Batching — eventual consistency.
 * Xotirada bufer, har 20s'da bulkWrite.
 */

const FLUSH_INTERVAL_MS = 20_000;
const MAX_BUFFER_SIZE = 5_000;

const buffer = new Map();
let timer = null;
let Job = null;

function trackView(jobId) {
  if (!jobId) return;
  const key = String(jobId);
  buffer.set(key, (buffer.get(key) || 0) + 1);
  if (buffer.size >= MAX_BUFFER_SIZE) flush();
}

async function flush() {
  if (buffer.size === 0 || !Job) return;

  const ops = [];
  for (const [id, delta] of buffer) {
    ops.push({ updateOne: { filter: { _id: id }, update: { $inc: { viewsCount: delta } } } });
  }
  buffer.clear();

  try {
    await Job.bulkWrite(ops, { ordered: false });
  } catch (e) {
    console.error('[viewsBatch] bulkWrite error:', e.message);
  }
}

function start(jobModel) {
  Job = jobModel;
  if (timer) return;
  timer = setInterval(flush, FLUSH_INTERVAL_MS);
  timer.unref?.();
  console.log('[viewsBatch] started — flush har', FLUSH_INTERVAL_MS / 1000, 's');
}

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { trackView, flush, start, stop };
