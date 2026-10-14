"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800">
      <Spinner className="h-5 w-5 text-emerald-500" />
    </div>
  ),
});

function TelegramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const fetchedJobId = useRef<string | null>(null);

  useEffect(() => {
    const jobId = params.id as string;
    if (!jobId) return;
    if (fetchedJobId.current === jobId) return;
    fetchedJobId.current = jobId;

    const load = async () => {
      setLoading(true);
      try {
        const isUnique = shouldCountView(jobId);
        if (isUnique) markViewed(jobId);
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
          }),
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

  const telegramContact = job.company?.telegramContact ?? null;
  const telegramUrl = telegramContact
    ? `https://t.me/${telegramContact.replace(/^@/, "").trim()}?text=${encodeURIComponent(
        `Assalomu alaykum! IshJobs orqali "${job.title}" vakansiyasini ko'rdim. Suhbatga yozilmoqchiman.`,
      )}`
    : null;

  const coords = job.locationPoint?.coordinates;
  const hasCoords =
    Array.isArray(coords) && coords.length === 2 &&
    typeof coords[0] === "number" && typeof coords[1] === "number";

  return (
    <div className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
      >
        ← Barcha vakansiyalar
      </Link>

      {/* ═══════════ HEADER ═══════════ */}
      <div className="rim relative overflow-hidden rounded-3xl glass p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-400/10 to-transparent blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
          {/* Logo */}
          <div className="shrink-0">
            {job.company?.logo ? (
              <img
                src={job.company.logo}
                alt={companyName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/60 shadow-lg shadow-emerald-950/10 dark:ring-white/10 sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white/40 dark:ring-white/10 sm:h-20 sm:w-20 sm:text-3xl">
                {companyName[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {companyName}
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-zinc-900/90 px-3 py-1 text-[11px] font-semibold text-white dark:bg-white/10">
                {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
              </span>
              <span className="rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                {EXPERIENCE_LABELS[job.experienceLevel] ?? job.experienceLevel}
              </span>
              {job.location?.city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {job.location.city}
                  {job.location.isRemote && " · Remote"}
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-xl font-black text-emerald-600 sm:text-2xl dark:text-emerald-400">
                {job.salaryFormatted || formatSalary(job.salary)}
              </p>
              <span className="text-xs text-slate-500 dark:text-zinc-500">
                {job.viewsCount || 0} ko'rishlar · {job.applicationsCount || 0} ariza
              </span>
            </div>
          </div>

          {/* Desktop quick actions */}
          <div className="hidden lg:flex lg:shrink-0 lg:flex-col lg:gap-2">
            {!isOwnJob && (
              <Button
                size="lg"
                onClick={handleApply}
                disabled={alreadyApplied}
                className="rounded-xl min-w-[180px]"
              >
                {alreadyApplied ? "✓ Ariza yuborilgan" : "Ariza topshirish"}
              </Button>
            )}
            {isOwnJob && (
              <Link href={`/jobs/${job._id}/applications`}>
                <Button size="lg" className="rounded-xl w-full">
                  Arizalarni ko'rish
                </Button>
              </Link>
            )}
            {telegramUrl && !isOwnJob && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-400 min-w-[180px]"
              >
                <TelegramIcon className="h-4 w-4" />
                Telegram
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-5 text-sm sm:grid-cols-4 dark:border-white/5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Ko'rishlar</p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{job.viewsCount || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Arizalar</p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{job.applicationsCount || 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">E'lon sanasi</p>
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

      {/* ═══════════ 2 USTUN ═══════════ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Chap ustun */}
        <div className="space-y-6 min-w-0">
          <section className="rim rounded-3xl glass p-6">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Ish tavsifi
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
              {job.description}
            </p>
          </section>

          {job.requirements && job.requirements.length > 0 && (
            <section className="rim rounded-3xl glass p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Talablar
              </h2>
              <ul className="mt-3 space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      ✓
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className="rim rounded-3xl glass p-6">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Vazifalar
              </h2>
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
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Ko'nikmalar
              </h2>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.skills.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white/10 dark:text-zinc-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* O'ng ustun (sidebar) */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          {/* 1-Click Telegram CTA */}
          {telegramUrl && !isOwnJob && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-[1.02]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                  1-Click tezkor bog'lanish
                </p>
                <p className="mt-0.5 text-sm font-bold">
                  Telegram orqali yozish
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <TelegramIcon className="h-5 w-5" />
              </div>
            </a>
          )}

          {/* Apply button (mobile + desktop) */}
          {!isOwnJob && (
            <Button
              onClick={handleApply}
              disabled={alreadyApplied}
              size="lg"
              className="w-full rounded-2xl lg:hidden"
            >
              {alreadyApplied ? "✓ Ariza yuborilgan" : "Ariza topshirish"}
            </Button>
          )}

          {/* MiniMap */}
          {hasCoords && (
            <div className="rim rounded-3xl glass overflow-hidden">
              <div className="border-b border-slate-200/60 px-5 py-3 dark:border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                  Ish joyi
                </h3>
                {job.location?.city && (
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {job.location.city}
                  </p>
                )}
              </div>
              <div className="p-3">
                <MiniMap
                  lat={coords[1]}
                  lng={coords[0]}
                  label={job.location?.city ?? companyName}
                  zoom={13}
                />
              </div>
            </div>
          )}

          {/* Company card */}
          <div className="rim rounded-3xl glass p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kompaniya haqida
            </h3>
            <div className="mt-4 flex items-center gap-3">
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt={companyName}
                  className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-100 dark:ring-white/10"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white/40 dark:ring-white/10">
                  {companyName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 dark:text-white">
                  {companyName}
                </p>
                {job.company?.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {job.company.website}
                  </a>
                )}
              </div>
            </div>

            {employer && (
              <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/5">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Mas'ul shaxs
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {fullName(employer)}
                </p>
              </div>
            )}

            {isOwnJob && (
              <Link href={`/jobs/${job._id}/applications`} className="mt-5 block">
                <Button className="w-full rounded-xl" size="lg">
                  Arizalarni ko'rish
                </Button>
              </Link>
            )}
          </div>
        </aside>
      </div>

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} job={job} />
    </div>
  );
}
