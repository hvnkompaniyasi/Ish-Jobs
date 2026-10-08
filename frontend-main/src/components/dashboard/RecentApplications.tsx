"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, timeAgo, initials } from "@/lib/utils";
import type { RecentApplication, User } from "@/types";

interface Props {
  applications: RecentApplication[];
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Yangi",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  reviewing: {
    label: "Ko'rilmoqda",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  },
  shortlisted: {
    label: "Tanlangan",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  },
  interview: {
    label: "Suhbat",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
  },
  accepted: {
    label: "Qabul",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  rejected: {
    label: "Rad etilgan",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
  },
  withdrawn: {
    label: "Olib tashlangan",
    className: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

export function RecentApplications({ applications }: Props) {
  const router = useRouter();

  return (
    <div className="rim rounded-3xl glass p-5 sm:p-6 animate-fade-in-up">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-md shadow-violet-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              Oxirgi arizalar
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Eng so&apos;nggi 5 ta
            </p>
          </div>
        </div>
        <Link
          href="/jobs/my"
          className="shrink-0 rounded-xl border border-slate-200/60 bg-white/60 px-3 py-1.5 text-xs font-bold text-slate-700 backdrop-blur-xl transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-emerald-400"
        >
          Barchasi →
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-4xl">📬</div>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-zinc-400">
            Hozircha ariza yo&apos;q
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((a, i) => {
            const applicant = typeof a.applicant === "object" ? (a.applicant as User) : null;
            const job = typeof a.job === "object" ? a.job : null;
            const resume = typeof a.resume === "object" ? a.resume : null;
            const statusStyle = STATUS_MAP[a.status] || STATUS_MAP.pending;

            return (
              <div
                key={a._id}
                className="group rounded-2xl border border-slate-200/60 bg-white/40 p-3 backdrop-blur-xl transition hover:border-emerald-500/40 hover:bg-white/60 animate-fade-in-up dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-black text-white shadow-md shadow-emerald-500/30 ring-2 ring-white/40 dark:ring-white/10">
                    {applicant?.avatarUrl ? (
                      <img
                        src={applicant.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(applicant?.firstName, applicant?.lastName)
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {applicant?.firstName} {applicant?.lastName}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          statusStyle.className
                        )}
                      >
                        {statusStyle.label}
                      </span>
                    </div>
                    {job && (
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-zinc-400">
                        → {job.title}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mt-3 flex gap-2">
                  {resume && (
                    <button
                      onClick={() => router.push(`/resumes/${resume._id}`)}
                      className="flex-1 rounded-lg border border-slate-200/60 bg-white/60 py-1.5 text-[11px] font-bold text-slate-700 backdrop-blur-xl transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-emerald-400"
                    >
                      📄 Rezyume ↗
                    </button>
                  )}
                  {job && (
                    <button
                      onClick={() => router.push(`/jobs/${job._id}/applications`)}
                      className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[11px] font-bold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-500"
                    >
                      ✏️ Statusni o&apos;zgartirish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
