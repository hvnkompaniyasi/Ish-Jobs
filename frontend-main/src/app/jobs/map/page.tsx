"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";
import { jobsService, getErrorMessage } from "@/services";
import type { Job } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900">
      <div className="text-center">
        <Spinner className="h-8 w-8 text-emerald-400" />
        <p className="mt-3 text-sm text-zinc-400">Xarita yuklanmoqda...</p>
      </div>
    </div>
  ),
});

export default function JobsMapPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await jobsService.getJobsForMap();
        setJobs(res);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-0 flex flex-col">
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-900/90 to-transparent p-4 pb-10">
        <div>
          <h1 className="text-lg font-black text-white drop-shadow">
            Xaritada ishlar
          </h1>
          <p className="text-xs text-zinc-300">
            {loading ? "Yuklanmoqda..." : `${jobs.length} ta vakansiya`}
          </p>
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="flex h-full w-full items-center justify-center bg-slate-900">
            <Spinner className="h-8 w-8 text-emerald-400" />
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center bg-slate-900 p-8">
            <div className="max-w-sm rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center backdrop-blur-xl">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="flex h-full items-center justify-center bg-slate-900 p-8">
            <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
              <div className="text-4xl">🗺️</div>
              <h3 className="mt-3 text-base font-bold text-white">
                Xaritada vakansiya yo&apos;q
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Koordinatalari kiritilgan vakansiyalar bu yerda ko&apos;rinadi
              </p>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && <MapView jobs={jobs} />}
      </div>
    </div>
  );
}
