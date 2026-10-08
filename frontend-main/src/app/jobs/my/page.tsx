"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks";
import { jobsService, getErrorMessage } from "@/services";
import { formatSalary, timeAgo, EMPLOYMENT_TYPE_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Faol",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  closed: {
    label: "Yopilgan",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
  },
  draft: {
    label: "Qoralama",
    className: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  archived: {
    label: "Arxiv",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

export default function MyJobsPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/jobs/my");
      return;
    }
    if (user?.activeRole !== "employer" && user?.role !== "admin") {
      router.replace("/jobs");
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await jobsService.getMyJobs();
        setJobs(res.jobs);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, isAuthenticated, user, router]);

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === "active" ? "closed" : "active";
    if (
      newStatus === "closed" &&
      !confirm("Vakansiyani yopmoqchimisiz? Nomzodlar ariza topshira olmaydi.")
    ) {
      return;
    }
    setUpdating(job._id);
    try {
      const updated = await jobsService.updateJobStatus(job._id, newStatus);
      setJobs((list) => list.map((j) => (j._id === job._id ? updated : j)));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Mening e&apos;lonlarim
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {jobs.length} ta vakansiya
          </p>
        </div>
        <Link href="/jobs/create">
          <Button className="rounded-xl">+ Yangi</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && !loading && (
        <div className="rim rounded-3xl glass p-6 text-center text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="rim rounded-3xl glass p-12 text-center">
          <div className="text-4xl">📢</div>
          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
            Hozircha vakansiya yo&apos;q
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Birinchi e&apos;loningizni yarating
          </p>
          <Link href="/jobs/create">
            <Button className="mt-4 rounded-xl">Vakansiya yaratish</Button>
          </Link>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES.draft;
            const isActive = job.status === "active";
            return (
              <div
                key={job._id}
                className={cn(
                  "rim rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10",
                  !isActive && "opacity-80"
                )}
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          statusStyle.className
                        )}
                      >
                        {statusStyle.label}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">
                        {timeAgo(job.createdAt)}
                      </span>
                    </div>
                    <Link href={`/jobs/${job._id}`}>
                      <h3 className="mt-1.5 truncate text-lg font-bold text-slate-900 transition hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400">
                        {job.title}
                      </h3>
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-white/10">
                        {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                      </span>
                      {job.location?.city && (
                        <span className="rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                          📍 {job.location.city}
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                        Arizalar:
                      </span>
                      <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-sm font-bold text-white dark:bg-emerald-500">
                        {job.applicationsCount || 0}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/jobs/${job._id}/edit`}>
                        <Button variant="outline" size="sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
                          </svg>
                          Tahrirlash
                        </Button>
                      </Link>

                      <Button
                        variant={isActive ? "outline" : "primary"}
                        size="sm"
                        loading={updating === job._id}
                        onClick={() => handleToggleStatus(job)}
                      >
                        {isActive ? "Yopish" : "Faollashtirish"}
                      </Button>

                      <Link href={`/jobs/${job._id}/applications`}>
                        <Button size="sm">Arizalar</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
