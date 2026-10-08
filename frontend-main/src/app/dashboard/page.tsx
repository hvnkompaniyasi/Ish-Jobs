"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { HiringFunnel } from "@/components/dashboard/HiringFunnel";
import { ApplicationsChart } from "@/components/dashboard/ApplicationsChart";
import { TopJobsList } from "@/components/dashboard/TopJobsList";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks";
import { dashboardService, getErrorMessage } from "@/services";
import { cn } from "@/lib/utils";
import type { DashboardData, DashboardPeriod } from "@/types";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "7d", label: "7 kun" },
  { value: "30d", label: "30 kun" },
  { value: "all", label: "Barchasi" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, hydrated, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("30d");

  // Auth guard
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/dashboard");
      return;
    }
    if (user?.activeRole !== "employer" && user?.role !== "admin") {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, user, router]);

  // Ma'lumot yuklash
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.activeRole !== "employer" && user?.role !== "admin") return;

    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await dashboardService.getEmployerDashboard(period);
        setData(res);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [period, isAuthenticated, user]);

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-sm dark:text-emerald-400">
            📊 Analitika
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Boshqaruv paneli
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Vakansiyalar va arizalar bo&apos;yicha umumiy ko&apos;rsatkichlar
          </p>
        </div>

        {/* Period filter */}
        <div className="flex shrink-0 gap-1.5 rounded-2xl border border-white/60 bg-white/40 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200",
                period === p.value
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 dark:bg-emerald-500"
                  : "text-slate-600 hover:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/5"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rim rounded-3xl glass p-6 text-center">
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          <Button
            variant="outline"
            onClick={() => setPeriod(period)}
            className="mt-3"
          >
            Qayta urinish
          </Button>
        </div>
      )}

      {/* Dashboard */}
      {!loading && !error && data && (
        <>
          {/* Stats Cards */}
          <StatsCards stats={data.stats} />

          {/* Funnel + Chart */}
          <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
            <HiringFunnel funnel={data.funnel} />
            <ApplicationsChart data={data.applicationsByDay} />
          </div>

          {/* Top jobs + Recent apps */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TopJobsList jobs={data.topJobs} />
            <RecentApplications applications={data.recentApplications} />
          </div>
        </>
      )}
    </div>
  );
}
