"use client";

import { useEffect, useState, useCallback } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { SearchBar } from "@/components/jobs/SearchBar";
import { JobFilters } from "@/components/jobs/JobFilters";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { jobsService, getErrorMessage } from "@/services";
import type { Job, JobFilters as Filters, Pagination } from "@/types";

const DEFAULT_FILTERS: Filters = {
  page: 1,
  limit: 10,
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(async (f: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobsService.getJobs(f);
      setJobs(res.jobs);
      setPagination(res.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, [filters, fetchJobs]);

  const handleSearch = (search: string) => {
    setFilters((f) => ({ ...f, search, page: 1 }));
  };

  const goToPage = (page: number) => {
    setFilters((f) => ({ ...f, page }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Vakansiyalar
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          {pagination
            ? `${pagination.total} ta vakansiya topildi`
            : "Yuklanmoqda..."}
        </p>
      </div>

      {/* Search */}
      <SearchBar initialValue={filters.search || ""} onSearch={handleSearch} />

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
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <JobFilters filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {showFilters && (
          <div className="lg:hidden">
            <JobFilters filters={filters} onChange={setFilters} />
          </div>
        )}

        <div>
          {loading && (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {error && !loading && (
            <div className="rim rounded-3xl glass p-6 text-center">
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchJobs(filters)}
                className="mt-3"
              >
                Qayta urinish
              </Button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="rim rounded-3xl glass p-12 text-center">
              <div className="text-4xl">🔍</div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                Vakansiya topilmadi
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Filtrlarni o&apos;zgartirib, qayta urinib ko&apos;ring
              </p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
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
