"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";
import type { ApplicationByDay } from "@/types";

// Recharts komponentlarini SSR'siz yuklash (hydration xatosini oldini oladi)
const Chart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const {
        ResponsiveContainer,
        AreaChart,
        Area,
        XAxis,
        YAxis,
        Tooltip,
        CartesianGrid,
      } = mod;

      return function ChartInner({ data }: { data: ApplicationByDay[] }) {
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
                }}
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
              />

              <Tooltip
                cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "rgba(24, 24, 27, 0.95)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#a1a1aa", fontSize: "11px", marginBottom: "4px" }}
                formatter={((value: any) => [`${value} ta ariza`, ""]) as any}
                labelFormatter={((label: any) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("uz-UZ", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                }) as any}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colorCount)"
                dot={false}
                activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[260px] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    ),
  }
);

interface Props {
  data: ApplicationByDay[];
}

export function ApplicationsChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rim rounded-3xl glass p-5 sm:p-6 animate-fade-in-up">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3v18h18M7 15l4-4 4 4 5-6" />
            </svg>
          </span>
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              Arizalar dinamikasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Jami: <span className="font-bold text-emerald-600 dark:text-emerald-400">{total}</span> ta ariza
            </p>
          </div>
        </div>
      </div>

      {mounted ? (
        <Chart data={data} />
      ) : (
        <div className="flex h-[260px] items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
