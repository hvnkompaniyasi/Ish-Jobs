import Link from "next/link";
import {
  formatSalary,
  timeAgo,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LABELS,
} from "@/lib/utils";
import type { Job } from "@/types";
import { getCategoryEmoji, getCategoryShort } from "@/lib/categories";

export function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  const companyName =
    typeof job.company === "object" && job.company !== null
      ? job.company.name || "Kompaniya"
      : job.company || "Kompaniya";

  const location = job.location?.isRemote
    ? "Masofadan"
    : job.location?.city || "Joylashuv yo'q";

  const isNew =
    Date.now() - new Date(job.createdAt).getTime() < 24 * 60 * 60 * 1000;

  const categoryEmoji = getCategoryEmoji(job.category);
  const categoryShort = getCategoryShort(job.category);

  if (featured) {
    return (
      <Link
        href={`/jobs/${job._id}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-emerald-600 p-5 transition-colors duration-200 hover:bg-emerald-500"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-base font-bold text-white backdrop-blur-sm">
              {companyName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-xs font-semibold uppercase tracking-wider text-white/80">
                  {companyName}
                </span>
                {isNew && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Yangi
                  </span>
                )}
              </div>
              <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-white">
                {job.title}
              </h3>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors duration-200 group-hover:bg-emerald-50">
            Ariza
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-white">
            {job.salaryFormatted || formatSalary(job.salary)}
          </span>
          <span className="text-[11px] text-white/70">{timeAgo(job.createdAt)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/jobs/${job._id}`}
      className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-900"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {job.company?.logo ? (
          <img
            src={job.company.logo}
            alt={companyName}
            className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-zinc-800"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-bold text-zinc-300">
            {companyName[0]?.toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-medium text-zinc-400">
              {companyName}
            </span>
            {isNew && (
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-400">
                Yangi
              </span>
            )}
          </div>
          <h3 className="mt-0.5 line-clamp-2 text-[15px] font-medium leading-snug text-white">
            {job.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
        {job.description}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
          <span>{categoryEmoji}</span>
          <span>{categoryShort}</span>
        </span>
        <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
          {EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-800 pt-3">
        <span className="text-sm font-semibold text-emerald-400">
          {job.salaryFormatted || formatSalary(job.salary)}
        </span>
        <span className="text-[11px] text-zinc-500">{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  );
}
