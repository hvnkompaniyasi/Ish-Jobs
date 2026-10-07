"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/components/jobs/JobCard";
import { Spinner } from "@/components/ui/Spinner";
import { jobsService, getErrorMessage } from "@/services";
import type { Job } from "@/types";

const CATEGORIES = [
  { value: "", label: "Barchasi", emoji: "✨" },
  { value: "IT", label: "Dasturlash", emoji: "💻" },
  { value: "Design", label: "Dizayn", emoji: "🎨" },
  { value: "Marketing", label: "Marketing", emoji: "📈" },
];

export default function HomePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await jobsService.getJobs({ page: 1, limit: 7 });
        setJobs(res.jobs);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (activeCategory) params.set("category", activeCategory);
    router.push(`/jobs?${params.toString()}`);
  };

  const featuredJob = jobs[0];
  const otherJobs = jobs.slice(1, 7);

  return (
    <div className="space-y-12 pb-12">
      {/* ═══════════ HERO — IXCHAM ═══════════ */}
      <section className="relative">
        <div className="rim relative overflow-hidden rounded-[2rem] glass p-6 sm:p-10">
          {/* Inner glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-400/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-500/15 to-transparent blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            {/* Title — markazlashtirilgan, katta */}
            <h1 className="text-center text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Orzuingizdagi{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-400">
                ishni toping
              </span>
            </h1>

            {/* Search — ixcham */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="rim flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 p-1.5 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/40">
                <div className="relative flex-1">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Lavozim, kalit so'z..."
                    className="w-full rounded-xl border-0 bg-transparent py-3 pl-10 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>
                <Button
                  type="submit"
                  size="md"
                  className="shrink-0 rounded-xl"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span className="hidden sm:inline">Qidirish</span>
                </Button>
              </div>
            </form>

            {/* Categories — ixcham pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
              {CATEGORIES.map((c) => {
                const active = activeCategory === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setActiveCategory(c.value)}
                    className={
                      active
                        ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 dark:bg-emerald-500"
                        : "inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/60 px-3.5 py-1.5 text-xs font-bold text-slate-700 backdrop-blur-xl transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
                    }
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED + JOBS ═══════════ */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-sm dark:text-emerald-400">
              🔥 Yangi
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              So&apos;nggi vakansiyalar
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Eng so&apos;nggi ish e&apos;lonlari
            </p>
          </div>
          <Link
            href="/jobs"
            className="shrink-0 rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-bold text-slate-700 backdrop-blur-xl transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
          >
            Barchasi →
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-200/60 bg-rose-50/60 p-6 text-center text-sm text-rose-700 backdrop-blur-xl dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rim rounded-3xl glass p-12 text-center">
            <div className="text-5xl">📭</div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Hozircha vakansiyalar yo&apos;q
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Tez orada yangi e&apos;lonlar paydo bo&apos;ladi
            </p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="space-y-4">
            {featuredJob && (
              <div className="animate-fade-in-up">
                <JobCard job={featuredJob} featured />
              </div>
            )}

            {otherJobs.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherJobs.map((job, i) => (
                  <div
                    key={job._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="rim rounded-[2rem] glass p-8 sm:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-sm dark:text-emerald-400">
            ⚡ Oddiy jarayon
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Ish topish bunchalik oson
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { step: "01", title: "Ro'yxatdan o'ting", desc: "Telefon raqam bilan 30 sekundda", emoji: "📱" },
            { step: "02", title: "Rezyume tuzing", desc: "Tajriba va ko'nikmalaringizni kiriting", emoji: "📄" },
            { step: "03", title: "Ariza topshiring", desc: "Bir bosishda vakansiyaga yuboring", emoji: "🚀" },
          ].map((item) => (
            <div
              key={item.step}
              className="rim group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span className="text-3xl font-black text-emerald-500/20 dark:text-emerald-500/15">
                {item.step}
              </span>
              <div className="mt-3 text-3xl">{item.emoji}</div>
              <h3 className="mt-3 text-lg font-black text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA — Glass Emerald ═══════════ */}
      <section className="rim relative overflow-hidden rounded-[2rem] glass-emerald p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Ish beruvchimisiz?
            </h2>
            <p className="mt-2 max-w-lg text-sm text-emerald-50">
              Eng yaxshi nomzodlarni toping. Vakansiyani 2 daqiqada joylang
              va arizalarni real vaqtda kuzatib boring.
            </p>
          </div>
          <Link href="/jobs/create" className="shrink-0">
            <button className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-emerald-700 shadow-2xl shadow-black/10 transition hover:scale-105">
              Vakansiya joylash →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
