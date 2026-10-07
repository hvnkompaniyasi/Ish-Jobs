"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ApplyModal } from "@/components/applications/ApplyModal";
import { jobsService, applicationsService, getErrorMessage } from "@/services";
import { useAuth } from "@/hooks";
import { shouldCountView, markViewed } from "@/lib/viewTracker";
import {
  formatSalary,
  formatDate,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LABELS,
  fullName,
} from "@/lib/utils";
import type { Job } from "@/types";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // StrictMode + bir xil sahifani qayta render qilishga qarshi
  const fetchedJobId = useRef<string | null>(null);

  useEffect(() => {
    const jobId = params.id as string;
    if (!jobId) return;

    // Agar allaqachon shu job yuklangan bo'lsa — qayta so'rov yubormaymiz
    if (fetchedJobId.current === jobId) return;
    fetchedJobId.current = jobId;

    const load = async () => {
      setLoading(true);
      try {
        // 1) Avval markViewed — sync, race condition yo'q
        const isUnique = shouldCountView(jobId);
        if (isUnique) markViewed(jobId);

        // 2) Keyin so'rov
        const data = await jobsService.getJob(jobId, isUnique);
        setJob(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  // Already applied?
  useEffect(() => {
    if (!isAuthenticated || !job) return;
    if (user?.activeRole !== "seeker") return;
    (async () => {
      try {
        const apps = await applicationsService.getMyApplications();
        setAlreadyApplied(
          apps.some((a) => {
            const j = typeof a.job === "object" ? a.job._id : a.job;
            return j === job._id && a.status !== "withdrawn";
          })
        );
      } catch {
        // ignore
      }
    })();
  }, [isAuthenticated, user, job]);

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/jobs/${params.id}`);
      return;
    }
    if (user?.activeRole !== "seeker") {
      alert("Faqat ish qidiruvchilar ariza topshirishlari mumkin");
      return;
    }
    setApplyOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rim rounded-3xl glass p-8 text-center">
        <p className="text-rose-700 dark:text-rose-400">
          {error || "Vakansiya topilmadi"}
        </p>
        <Link href="/jobs">
          <Button variant="outline" className="mt-4">
            ← Orqaga
          </Button>
        </Link>
      </div>
    );
  }

  const employer = typeof job.employer === "object" ? job.employer : null;
  const companyName = job.company?.name || "Kompaniya";
  const isOwnJob = employer && user && employer._id === user._id;

  return (
    <div className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
      >
        ← Barcha vakansiyalar
      </Link>

      <div className="rim relative overflow-hidden rounded-3xl glass p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/15 to-transparent blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {companyName}
            </span>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-zinc-900/90 px-3 py-1 text-[11px] font-semibold text-white dark:bg-white/10">
                {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
              </span>
              <span className="rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                {EXPERIENCE_LABELS[job.experienceLevel]}
              </span>
              {job.location?.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {job.location.city}
                  {job.location.isRemote && " (Remote)"}
                </span>
              )}
            </div>

            <p className="mt-5 text-lg font-black text-slate-900 dark:text-emerald-400">
              {job.salaryFormatted || formatSalary(job.salary)}
            </p>
          </div>

          <div className="flex gap-2">
            {!isOwnJob && (
              <Button size="lg" onClick={handleApply} disabled={alreadyApplied} className="rounded-xl">
                {alreadyApplied ? "✓ Ariza yuborilgan" : "Ariza topshirish"}
              </Button>
            )}
            {isOwnJob && (
              <Link href={`/jobs/${job._id}/applications`}>
                <Button size="lg" className="rounded-xl">
                  Arizalarni ko&apos;rish
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-5 text-sm sm:grid-cols-4 dark:border-white/5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Ko&apos;rishlar</p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{job.viewsCount || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Arizalar</p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{job.applicationsCount || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">E&apos;lon sanasi</p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{formatDate(job.createdAt)}</p>
          </div>
          {job.deadline && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Muddat</p>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{formatDate(job.deadline)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rim rounded-3xl glass p-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ish tavsifi</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-zinc-300">{job.description}</p>
          </section>

          {job.requirements && job.requirements.length > 0 && (
            <section className="rim rounded-3xl glass p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Talablar</h2>
              <ul className="mt-3 space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className="rim rounded-3xl glass p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Vazifalar</h2>
              <ul className="mt-3 space-y-2.5">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-zinc-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.skills && job.skills.length > 0 && (
            <section className="rim rounded-3xl glass p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ko&apos;nikmalar</h2>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.skills.map((s, i) => (
                  <span key={i} className="rounded-full bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white/10 dark:text-zinc-200">{s}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rim rounded-3xl glass p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kompaniya haqida</h3>
            <div className="mt-4 flex items-center gap-3">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={companyName} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-100 dark:ring-white/10" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white/40 dark:ring-white/10">
                  {companyName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 dark:text-white">{companyName}</p>
                {job.company?.website && (
                  <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="truncate text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                    {job.company.website}
                  </a>
                )}
              </div>
            </div>

            {employer && (
              <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/5">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Mas&apos;ul shaxs</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{fullName(employer)}</p>
              </div>
            )}

            {!isOwnJob && (
              <Button onClick={handleApply} className="mt-5 w-full rounded-xl" size="lg" disabled={alreadyApplied}>
                {alreadyApplied ? "✓ Ariza yuborilgan" : "Ariza topshirish"}
              </Button>
            )}
          </div>
        </aside>
      </div>

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} job={job} />
    </div>
  );
}
