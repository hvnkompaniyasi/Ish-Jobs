import Link from "next/link";
import {
  formatSalary,
  timeAgo,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LABELS,
} from "@/lib/utils";
import type { Job } from "@/types";

export function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  const companyName = job.company?.name || "Kompaniya";
  const location = job.location?.isRemote
    ? "Masofadan"
    : job.location?.city || "Joylashuv yo'q";
  const isNew =
    Date.now() - new Date(job.createdAt).getTime() < 24 * 60 * 60 * 1000;

  const baseClasses =
    "group rim relative flex flex-col overflow-hidden rounded-3xl p-5";
  const interactiveClasses =
    "transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.99]";

  return (
    <Link
      href={`/jobs/${job._id}`}
      className={
        featured
          ? `${baseClasses} ${interactiveClasses} glass-emerald text-white hover:shadow-2xl hover:shadow-emerald-500/40`
          : `${baseClasses} ${interactiveClasses} glass hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/15`
      }
    >
      {/* Neon glow overlay on hover */}
      {!featured && (
        <span className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 opacity-0 transition-opacity duration-500 group-hover:from-emerald-500/10 group-hover:to-teal-500/5 group-hover:opacity-100" />
      )}

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt={companyName}
              className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-2 ring-white/40 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className={
                featured
                  ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-base font-black text-white backdrop-blur-sm ring-2 ring-white/30 transition-transform duration-300 group-hover:scale-105"
                  : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-base font-black text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white/40 transition-transform duration-300 group-hover:scale-105 dark:ring-white/10"
              }
            >
              {companyName[0]?.toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={
                  featured
                    ? "truncate text-xs font-bold text-emerald-50"
                    : "truncate text-xs font-bold text-emerald-600 dark:text-emerald-400"
                }
              >
                {companyName}
              </span>
              {isNew && (
                <span
                  className={
                    featured
                      ? "rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
                      : "rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  }
                >
                  Yangi
                </span>
              )}
              {job.location?.isRemote && (
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                  Remote
                </span>
              )}
            </div>
            <h3
              className={
                featured
                  ? "mt-1 line-clamp-2 text-lg font-black leading-snug text-white drop-shadow-sm"
                  : "mt-1 line-clamp-2 text-base font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400"
              }
            >
              {job.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        className={
          featured
            ? "mt-3 line-clamp-2 text-sm leading-relaxed text-emerald-50/90"
            : "mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400"
        }
      >
        {job.description}
      </p>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {featured ? (
          <>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {EXPERIENCE_LABELS[job.experienceLevel] || job.experienceLevel}
            </span>
          </>
        ) : (
          <>
            <span className="rounded-full bg-zinc-900/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm dark:bg-zinc-800/90">
              {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
            </span>
            <span className="rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm dark:bg-white/5 dark:text-zinc-300">
              {EXPERIENCE_LABELS[job.experienceLevel] || job.experienceLevel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-sm dark:bg-white/5 dark:text-zinc-300">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location}
            </span>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className={
          featured
            ? "mt-auto flex items-center justify-between gap-2 border-t border-white/20 pt-4 mt-5"
            : "mt-auto flex items-center justify-between gap-2 border-t border-slate-200/60 pt-4 mt-5 dark:border-white/5"
        }
      >
        <span
          className={
            featured
              ? "text-base font-black text-white drop-shadow-sm"
              : "text-sm font-black text-slate-900 dark:text-emerald-400"
          }
        >
          {job.salaryFormatted || formatSalary(job.salary)}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={
              featured
                ? "text-[11px] text-emerald-50/80"
                : "text-[11px] text-slate-400 dark:text-zinc-500"
            }
          >
            {timeAgo(job.createdAt)}
          </span>
          <span
            className={
              featured
                ? "inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-emerald-700 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl"
                : "inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-emerald-500/30 transition-all duration-200 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/40"
            }
          >
            Ariza
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
