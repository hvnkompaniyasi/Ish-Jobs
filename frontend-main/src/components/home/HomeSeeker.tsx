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

export function HomeSeeker() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await jobsService.getJobs({ page: 1, limit: 7 });
        setJobs(res.jobs);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
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
      {/* HERO */}
      <section className="relative">
        <div className="rim relative overflow-hidden rounded-[2rem] glass p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-400/5 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <h1 className="mt-5 text-center text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Orzuingizdagi{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                ishni toping
              </span>
            </h1>

            <form onSubmit={handleSearch} className="mt-6">
              <div className="rim flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/70 p-1.5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/50">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Lavozim, kalit so'z..."
                  className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
                />
                <Button type="submit" size="sm" className="shrink-0 rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span className="hidden sm:inline">Qidirish</span>
                </Button>
              </div>
            </form>

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
                        ? "rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white dark:bg-emerald-500"
                        : "rounded-full border border-white/60 bg-white/60 px-3.5 py-1.5 text-xs font-bold text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-300"
                    }
                  >
                    {c.emoji} {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-sm dark:text-emerald-400">
              🔥 Yangi
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              So&apos;nggi vakansiyalar
            </h2>
          </div>
          <Link
            href="/jobs"
            className="shrink-0 rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-bold text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-300"
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
          <div className="rim rounded-3xl glass p-6 text-center text-sm text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rim rounded-3xl glass p-12 text-center">
            <div className="text-5xl">📭</div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Hozircha vakansiyalar yo&apos;q
            </h3>
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

      {/* CTA */}
      <section className="rim relative overflow-hidden rounded-[2rem] glass-emerald p-8 sm:p-12">
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Ish beruvchimisiz?
            </h2>
            <p className="mt-2 max-w-lg text-sm text-emerald-50">
              Navbar&apos;dan employer rejimiga o&apos;tib, rezyumelarni ko&apos;ring.
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
