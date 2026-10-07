/**
 * 24 soat ichida bir marta ko'rilganini saqlaydi (localStorage).
 */

const PREFIX = "ishjobs_viewed_job_";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 soat

/**
 * @returns true — agar bu YANGI ko'rish bo'lsa (o'tgan 24 soatda ko'rilmagan)
 */
export function shouldCountView(jobId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = PREFIX + jobId;
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const ts = parseInt(raw, 10);
    if (isNaN(ts)) return true;
    return Date.now() - ts > TTL_MS;
  } catch {
    return true;
  }
}

export function markViewed(jobId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + jobId, String(Date.now()));
  } catch {
    // ignore
  }
}
