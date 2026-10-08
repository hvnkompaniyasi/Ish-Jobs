"use client";

import { useEffect, useState } from "react";
import { ResumeCard } from "@/components/resumes/ResumeCard";
import { ResumeFilters, type ResumeFilterValues } from "@/components/resumes/ResumeFilters";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { resumesService, getErrorMessage } from "@/services";
import type { Resume } from "@/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ResumeFilterValues>({
    search: "",
    location: "",
    skill: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await resumesService.getPublicResumes({
            search: filters.search || undefined,
            location: filters.location || undefined,
            skill: filters.skill || undefined,
            page,
            limit: 12,
          });
          setResumes(res.resumes);
          setPagination(res.pagination);
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setLoading(false);
        }
      })();
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, page]);

  const handleFiltersChange = (f: ResumeFilterValues) => {
    setFilters(f);
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 backdrop-blur-sm dark:text-indigo-400">
          👥 Nomzodlar
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Mutaxassislar
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          {pagination ? `${pagination.total} ta rezyume topildi` : "Yuklanmoqda..."}
        </p>
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className="w-full"
        >
          {showFilters ? "Filtrlarni yopish" : "Filtrlarni ko'rsatish"}
        </Button>
      </div>

      {/* Layout */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ResumeFilters values={filters} onChange={handleFiltersChange} />
          </div>
        </aside>

        {/* Filters (mobile) */}
        {showFilters && (
          <div className="lg:hidden">
            <ResumeFilters values={filters} onChange={handleFiltersChange} />
          </div>
        )}

        {/* List */}
        <div>

          {loading && (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {error && !loading && (
            <div className="rim rounded-3xl glass p-6 text-center">
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          )}

          {!loading && !error && resumes.length === 0 && (
            <div className="rim rounded-3xl glass p-12 text-center">
              <div className="text-4xl">🔍</div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                Rezyume topilmadi
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Filtrlarni o&apos;zgartirib, qayta urinib ko&apos;ring
              </p>
            </div>
          )}

          {!loading && !error && resumes.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {resumes.map((r, i) => (
                  <div
                    key={r._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <ResumeCard resume={r} />
                  </div>
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    ← Oldingi
                  </Button>
                  <span className="px-3 text-sm font-medium text-slate-600 dark:text-zinc-400">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Keyingi →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
