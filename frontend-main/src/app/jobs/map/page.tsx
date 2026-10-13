"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { jobsService, getErrorMessage } from "@/services";
import type { Job } from "@/types";
import type { MapFlyTarget } from "@/components/map/MapView";

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

// ═══════════════════════════════════════════════════════
// Shaharlar — tezkor flyTo uchun
// ═══════════════════════════════════════════════════════
const CITIES = [
  { name: "Toshkent",  lat: 41.2995, lng: 69.2401, zoom: 12 },
  { name: "Samarqand", lat: 39.6270, lng: 66.9750, zoom: 12 },
  { name: "Buxoro",    lat: 39.7681, lng: 64.4217, zoom: 12 },
  { name: "Namangan",  lat: 40.9983, lng: 71.6726, zoom: 12 },
  { name: "Andijon",   lat: 40.7821, lng: 72.3442, zoom: 12 },
] as const;

export default function JobsMapPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<MapFlyTarget | null>(null);

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

  const handleCityClick = (cityName: string | null) => {
    setActiveCity(cityName);

    if (cityName === null) {
      // "Barchasi" — fitBounds rejimi (flyTarget = null bo'lsa,
      // FitBoundsToJobs avtomatik ishga tushadi chunki jobs prop o'zgaradi emas)
      // Qayta fitBounds qilish uchun vaqtinchalik "reset" tokeni ishlatamiz
      setFlyTarget(null);
      return;
    }

    const c = CITIES.find((x) => x.name === cityName);
    if (!c) return;

    setFlyTarget({
      lat: c.lat,
      lng: c.lng,
      zoom: c.zoom,
      token: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-slate-950">
      {/* ═════════════ HEADER (xarita ustida suzuvchi) ═════════════ */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] flex flex-col gap-2 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent p-4 pb-12">
        <div className="flex items-center justify-between gap-3">
          <div className="pointer-events-auto">
            <h1 className="text-lg font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Xaritada ishlar
            </h1>
            <p className="text-xs text-zinc-300">
              {loading
                ? "Yuklanmoqda..."
                : `${jobs.length} ta vakansiya`}
            </p>
          </div>
          <Link
            href="/jobs"
            className="pointer-events-auto rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
          >
            ← Ro&apos;yxat
          </Link>
        </div>

        {/* ═════════════ SHAHAR PILL TUGMALARI ═════════════ */}
        {!loading && !error && jobs.length > 0 && (
          <div className="pointer-events-auto -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCityClick(null)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeCity === null
                  ? "bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
                  : "border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              }`}
            >
              📍 Barchasi
            </button>
            {CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleCityClick(c.name)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeCity === c.name
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
                    : "border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═════════════ MAP AREA ═════════════ */}
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

        {!loading && !error && jobs.length > 0 && (
          <MapView jobs={jobs} flyTarget={flyTarget} />
        )}
      </div>
    </div>
  );
}
