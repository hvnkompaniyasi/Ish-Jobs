"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { applicationsService, getErrorMessage } from "@/services";
import { formatSalary, timeAgo, EMPLOYMENT_TYPE_LABELS } from "@/lib/utils";
import type { Application, Job } from "@/types";

export default function MyApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsService.getMyApplications();
      setApps(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleWithdraw = async (id: string) => {
    if (!confirm("Arizani olib tashlashni tasdiqlaysizmi?")) return;
    setWithdrawing(id);
    try {
      const updated = await applicationsService.withdraw(id);
      setApps((list) => list.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Mening arizalarim
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          {apps.length} ta ariza
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {error && !loading && (
        <div className="rim rounded-3xl glass p-6 text-center">
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          <Button variant="outline" onClick={load} className="mt-3">
            Qayta urinish
          </Button>
        </div>
      )}

      {!loading && !error && apps.length === 0 && (
        <div className="rim rounded-3xl glass p-12 text-center">
          <div className="text-4xl">📭</div>
          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
            Hozircha ariza yo&apos;q
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Vakansiyalarni ko&apos;rib, ariza topshiring
          </p>
          <Link href="/jobs">
            <Button className="mt-4 rounded-xl">Vakansiyalarni ko&apos;rish</Button>
          </Link>
        </div>
      )}

      {!loading && !error && apps.length > 0 && (
        <div className="space-y-3">
          {apps.map((a) => {
            const job = typeof a.job === "object" ? (a.job as Job) : null;
            if (!job) return null;
            const canWithdraw = !["accepted", "rejected", "withdrawn"].includes(
              a.status
            );

            return (
              <div
                key={a._id}
                className="rim rounded-3xl glass p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ApplicationStatusBadge status={a.status} />
                      <span className="text-xs text-slate-400 dark:text-zinc-500">
                        {timeAgo(a.createdAt)}
                      </span>
                    </div>
                    <Link href={`/jobs/${job._id}`} className="mt-2 block">
                      <h3 className="truncate text-lg font-bold text-slate-900 transition hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">
                      {job.company?.name}
                      {job.location?.city && ` • 📍 ${job.location.city}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-zinc-900/90 px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-white/10">
                        {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                      </span>
                      <span className="rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                  </div>

                  {canWithdraw && (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={withdrawing === a._id}
                      onClick={() => handleWithdraw(a._id)}
                    >
                      Olib tashlash
                    </Button>
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
