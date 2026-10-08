import Link from "next/link";
import { formatSalary, timeAgo, initials } from "@/lib/utils";
import type { Resume, User } from "@/types";

export function ResumeCard({ resume }: { resume: Resume }) {
  const owner = typeof resume.user === "object" ? (resume.user as User) : null;

  return (
    <Link
      href={`/resumes/${resume._id}`}
      className="rim group relative flex flex-col overflow-hidden rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/15"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white shadow-lg shadow-indigo-500/30 ring-2 ring-white/40 dark:ring-white/10">
          {owner?.avatarUrl ? (
            <img
              src={owner.avatarUrl}
              alt={owner.firstName || "Nomzod"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials(owner?.firstName, owner?.lastName)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-400">
            {resume.title}
          </h3>
          {owner && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-zinc-400">
              {owner.firstName} {owner.lastName}
            </p>
          )}
        </div>
      </div>

      {/* About */}
      {resume.about && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          {resume.about}
        </p>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {resume.skills.slice(0, 4).map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-white/10"
            >
              {s}
            </span>
          ))}
          {resume.skills.length > 4 && (
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              +{resume.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Location + languages */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {resume.location && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
            📍 {resume.location}
          </span>
        )}
        {resume.experience && resume.experience.length > 0 && (
          <span className="rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
            💼 {resume.experience.length} tajriba
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-200/60 pt-3.5 mt-4 dark:border-white/5">
        <span className="text-sm font-bold text-slate-900 dark:text-indigo-400">
          {formatSalary(resume.expectedSalary)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            {timeAgo(resume.createdAt)}
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white transition group-hover:scale-105 group-hover:bg-indigo-500">
            Ko&apos;rish ↗
          </span>
        </div>
      </div>
    </Link>
  );
}
