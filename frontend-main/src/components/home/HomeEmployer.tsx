"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { resumesService, getErrorMessage } from "@/services";
import { timeAgo, formatSalary, initials } from "@/lib/utils";
import type { Resume, User } from "@/types";

export function HomeEmployer() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await resumesService.getPublicResumes({
          page: 1,
          limit: 8,
        });
        setResumes(data.resumes);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Employer uchun keyin /resumes sahifasiga yo'naltiramiz
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    router.push(`/resumes?${params.toString()}`);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* HERO */}
      <section className="relative">
        <div className="rim relative overflow-hidden rounded-[2rem] glass p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/25 to-violet-400/5 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <h1 className="mt-5 text-center text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Eng yaxshi{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                nomzodlarni toping
              </span>
            </h1>

            <p className="mt-4 text-center text-sm text-slate-600 sm:text-base dark:text-zinc-400">
              Minglab rezyumelar. Ko&apos;nikmalar, tajriba va maosh bo&apos;yicha filtrlab, eng mos nomzodni toping.
            </p>

            <form onSubmit={handleSearch} className="mt-6">
              <div className="rim flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/70 p-1.5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/50">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Lavozim, ko'nikma, kalit so'z..."
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
          </div>
        </div>
      </section>

      {/* RESUMES LIST */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 backdrop-blur-sm dark:text-indigo-400">
              👥 Nomzodlar
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              So&apos;nggi rezyumelar
            </h2>
          </div>
          <Link
            href="/resumes"
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

        {!loading && !error && resumes.length === 0 && (
          <div className="rim rounded-3xl glass p-12 text-center">
            <div className="text-5xl">📄</div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Hozircha rezyumelar yo&apos;q
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Nomzodlar rezyume yaratgach, bu yerda ko&apos;rinadi
            </p>
          </div>
        )}

        {!loading && !error && resumes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r, i) => {
              const owner =
                typeof r.user === "object" ? (r.user as User) : null;
              return (
                <Link
                  key={r._id}
                  href={`/resumes/${r._id}`}
                  className="rim group relative flex flex-col overflow-hidden rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/15 animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Avatar + name */}
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
                        {r.title}
                      </h3>
                      {owner && (
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-zinc-400">
                          {owner.firstName} {owner.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* About */}
                  {r.about && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                      {r.about}
                    </p>
                  )}

                  {/* Skills */}
                  {r.skills && r.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.skills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-white/10"
                        >
                          {s}
                        </span>
                      ))}
                      {r.skills.length > 3 && (
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          +{r.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-200/60 pt-3.5 mt-4 dark:border-white/5">
                    <span className="text-sm font-bold text-slate-900 dark:text-indigo-400">
                      {formatSalary(r.expectedSalary)}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {timeAgo(r.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="rim relative overflow-hidden rounded-[2rem] glass-emerald p-8 sm:p-12">
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Nomzod izlayapsizmi?
            </h2>
            <p className="mt-2 max-w-lg text-sm text-emerald-50">
              Vakansiya joylang va eng yaxshi nomzodlarni o&apos;zingizga jalb qiling.
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
