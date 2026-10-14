"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { jobsService, getErrorMessage } from "@/services";
import type { Job } from "@/types";
import type { MapFlyTarget } from "@/components/map/MapView";
import { cn } from "@/lib/utils";
import { haversineKm, formatDistance, coordsToLatLng, type LatLng } from "@/lib/geo";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900">
      <Spinner className="h-8 w-8 text-emerald-400" />
    </div>
  ),
});

const CITIES = [
  { name: "Toshkent",  lat: 41.2995, lng: 69.2401, zoom: 12 },
  { name: "Samarqand", lat: 39.6270, lng: 66.9750, zoom: 12 },
  { name: "Buxoro",    lat: 39.7681, lng: 64.4217, zoom: 12 },
  { name: "Namangan",  lat: 40.9983, lng: 71.6726, zoom: 12 },
  { name: "Andijon",   lat: 40.7821, lng: 72.3442, zoom: 12 },
] as const;

const RADIUS_OPTIONS = [
  { label: "Barchasi", value: null },
  { label: "1 km",     value: 1 },
  { label: "3 km",     value: 3 },
  { label: "5 km",     value: 5 },
  { label: "10 km",    value: 10 },
] as const;

const CATEGORIES = [
  { label: "Barchasi", value: null },
  { label: "IT",       value: "it" },
  { label: "Savdo",    value: "sales" },
  { label: "Servis",   value: "service" },
  { label: "Ofis",     value: "office" },
] as const;

function formatSalaryShort(salary: Job["salary"] | undefined): string {
  if (!salary) return "Kelishilgan";
  if (typeof salary === "string") return salary;
  const s = salary as { min?: number | null; max?: number | null; currency?: string };
  const { min, max, currency = "UZS" } = s;
  if (min == null && max == null) return "Kelishilgan";
  const f = (n: number) => {
    if (currency === "USD") return "$" + Math.round(n);
    if (n >= 1_000_000) { const v = n / 1_000_000; return (v >= 10 ? Math.round(v) : +v.toFixed(1)) + " mln"; }
    return String(Math.round(n));
  };
  if (min != null && max != null) return f(min) + "–" + f(max);
  if (min != null) return f(min) + "+";
  return f(max!);
}

function getCompanyName(job: Job): string {
  if (typeof job.company === "object" && job.company !== null) {
    return (job.company as { name?: string }).name ?? "Kompaniya";
  }
  return job.company || "Kompaniya";
}

export default function JobsMapPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [onlyWithSalary, setOnlyWithSalary] = useState(false);

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [flyTarget, setFlyTarget] = useState<MapFlyTarget | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

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

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (activeCategory) {
        const cat = (job.category ?? "").toLowerCase();
        if (!cat.includes(activeCategory)) return false;
      }
      if (onlyWithSalary) {
        const s = job.salary as { min?: number | null; max?: number | null } | string | undefined;
        if (!s) return false;
        if (typeof s === "object" && s.min == null && s.max == null) return false;
      }
      if (radiusKm != null && userLocation && job.locationPoint?.coordinates) {
        const d = haversineKm(userLocation, coordsToLatLng(job.locationPoint.coordinates));
        if (d > radiusKm) return false;
      }
      if (activeCity && job.location?.city !== activeCity) return false;
      return true;
    });
  }, [jobs, activeCategory, onlyWithSalary, radiusKm, userLocation, activeCity]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGpsError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setFlyTarget({ lat: loc.lat, lng: loc.lng, zoom: 13, token: Date.now() });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || "Joylashuvni aniqlab bo'lmadi");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleCityClick = (cityName: string | null) => {
    setActiveCity(cityName);
    if (cityName === null) { setFlyTarget(null); return; }
    const c = CITIES.find((x) => x.name === cityName);
    if (c) setFlyTarget({ lat: c.lat, lng: c.lng, zoom: c.zoom, token: Date.now() });
  };

  const handleCardClick = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = filteredJobs.find((j) => j._id === jobId);
    if (job?.locationPoint?.coordinates) {
      const [lng, lat] = job.locationPoint.coordinates;
      setFlyTarget({ lat, lng, zoom: 14, token: Date.now() });
    }
  };

  const handleMarkerSelect = (jobId: string | null) => {
    setSelectedJobId(jobId);
    if (jobId && carouselRef.current) {
      const el = carouselRef.current.querySelector('[data-job-id="' + jobId + '"]');
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const resetFilters = () => {
    setActiveCity(null);
    setActiveCategory(null);
    setRadiusKm(null);
    setOnlyWithSalary(false);
    setFlyTarget(null);
  };

  const hasActiveFilter =
    activeCity !== null || activeCategory !== null || radiusKm !== null || onlyWithSalary;

  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-slate-950">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[900] flex flex-col gap-2 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent px-4 pb-12 pt-[76px] md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="pointer-events-auto">
            <h1 className="text-lg font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Xaritada ishlar
            </h1>
            <p className="text-xs text-zinc-300">
              {loading ? "Yuklanmoqda..." : filteredJobs.length + " ta vakansiya"}
              {userLocation && radiusKm ? " · " + radiusKm + " km radiusda" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLocate}
              disabled={gpsLoading}
              className={cn(
                "pointer-events-auto flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors",
                userLocation
                  ? "border border-blue-400/50 bg-blue-500/20 text-blue-200"
                  : "border border-white/15 bg-white/10 text-white hover:bg-white/20",
              )}
            >
              {gpsLoading ? <Spinner className="h-3.5 w-3.5" /> : <span>📍</span>}
              <span className="hidden sm:inline">{userLocation ? "Yoqilgan" : "Yaqinimda"}</span>
            </button>
            <Link
              href="/jobs"
              className="pointer-events-auto rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              ←
            </Link>
          </div>
        </div>

        {gpsError && (
          <div className="pointer-events-auto rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-[11px] text-rose-200 backdrop-blur-md">
            ⚠️ {gpsError}
          </div>
        )}

        {userLocation && (
          <div className="pointer-events-auto -mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setRadiusKm(opt.value)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                  radiusKm === opt.value
                    ? "bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.6)]"
                    : "border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="pointer-events-auto -mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCityClick(null)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                activeCity === null
                  ? "bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
                  : "border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
              )}
            >
              📍 Barchasi
            </button>
            {CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleCityClick(c.name)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  activeCity === c.name
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
                    : "border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="pointer-events-auto -mx-4 flex items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={String(cat.value)}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                  activeCategory === cat.value
                    ? "bg-emerald-500/90 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:bg-white/15",
                )}
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyWithSalary((v) => !v)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                onlyWithSalary
                  ? "bg-emerald-500/90 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:bg-white/15",
              )}
            >
              💰 Maoshli
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden md:pt-[76px]">
        <aside className="hidden w-[400px] shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950 md:flex">
          <div className="px-5 pb-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white">Xaritada ishlar</h1>
                <p className="text-xs text-zinc-400">
                  {loading ? "Yuklanmoqda\u2026" : filteredJobs.length + " ta vakansiya"}
                </p>
              </div>
              <Link
                href="/jobs"
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                ← Ro&apos;yxat
              </Link>
            </div>
          </div>

          <div className="space-y-3 border-b border-zinc-800/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLocate}
                disabled={gpsLoading}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  userLocation
                    ? "border border-blue-400/50 bg-blue-500/20 text-blue-200"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                )}
              >
                {gpsLoading ? <Spinner className="h-3.5 w-3.5" /> : <span>📍</span>}
                <span>{userLocation ? "Yoqilgan" : "Yaqinimda"}</span>
              </button>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-auto text-[11px] font-medium text-zinc-400 transition-colors hover:text-emerald-400"
                >
                  Tozalash
                </button>
              )}
            </div>

            {gpsError && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-300">
                ⚠️ {gpsError}
              </div>
            )}

            {userLocation && (
              <div className="flex flex-wrap gap-1.5">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setRadiusKm(opt.value)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      radiusKm === opt.value
                        ? "bg-blue-500 text-white"
                        : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleCityClick(null)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  activeCity === null
                    ? "bg-emerald-500 text-slate-950"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                )}
              >
                Barchasi
              </button>
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCityClick(c.name)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    activeCity === c.name
                      ? "bg-emerald-500 text-slate-950"
                      : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={String(cat.value)}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    activeCategory === cat.value
                      ? "bg-emerald-500/90 text-slate-950"
                      : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                  )}
                >
                  {cat.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOnlyWithSalary((v) => !v)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  onlyWithSalary
                    ? "bg-emerald-500/90 text-slate-950"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                )}
              >
                💰 Maoshli
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {loading && (
              <div className="flex h-40 items-center justify-center">
                <Spinner className="h-6 w-6 text-emerald-400" />
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-xs text-rose-300">
                {error}
              </div>
            )}

            {!loading && !error && filteredJobs.length === 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                <div className="text-3xl">🗺️</div>
                <h3 className="mt-2 text-sm font-semibold text-white">
                  Vakansiya topilmadi
                </h3>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Filtrlarni o&apos;zgartirib qayta urinib ko&apos;ring
                </p>
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-400"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            )}

            {!loading && !error && filteredJobs.map((job) => {
              const isSelected = selectedJobId === job._id;
              const isHovered = hoveredJobId === job._id;
              const salaryStr = formatSalaryShort(job.salary);

              let distanceLabel: string | null = null;
              if (userLocation && job.locationPoint?.coordinates) {
                const d = haversineKm(userLocation, coordsToLatLng(job.locationPoint.coordinates));
                distanceLabel = formatDistance(d);
              }

              return (
                <button
                  key={job._id}
                  type="button"
                  onClick={() => handleCardClick(job._id)}
                  onMouseEnter={() => setHoveredJobId(job._id)}
                  onMouseLeave={() => setHoveredJobId(null)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    isSelected
                      ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                      : isHovered
                        ? "border-emerald-500/40 bg-zinc-900"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                    <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      {getCompanyName(job)}
                    </span>
                  </div>

                  <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-white">
                    {job.title}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-400">
                    {job.location?.city && <span>📍 {job.location.city}</span>}
                    {distanceLabel && (
                      <span className="text-blue-300">🚶 {distanceLabel}</span>
                    )}
                  </div>

                  <div className="mt-2 text-[13px] font-bold text-emerald-400">
                    {salaryStr}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

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
            <MapView
              jobs={filteredJobs}
              flyTarget={flyTarget}
              userLocation={userLocation}
              selectedJobId={selectedJobId}
              hoveredJobId={hoveredJobId}
              onJobSelect={handleMarkerSelect}
            />
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <div
              ref={carouselRef}
              className="pointer-events-none absolute bottom-[92px] left-0 right-0 z-[950] flex gap-3 overflow-x-auto px-4 pb-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredJobs.map((job) => {
                const companyName = getCompanyName(job);
                const isSelected = selectedJobId === job._id;
                const salaryStr = formatSalaryShort(job.salary);

                let distanceLabel: string | null = null;
                if (userLocation && job.locationPoint?.coordinates) {
                  const d = haversineKm(userLocation, coordsToLatLng(job.locationPoint.coordinates));
                  distanceLabel = formatDistance(d);
                }

                return (
                  <button
                    key={job._id}
                    type="button"
                    data-job-id={job._id}
                    onClick={() => handleCardClick(job._id)}
                    className={cn(
                      "pointer-events-auto w-[240px] shrink-0 rounded-2xl border p-3 text-left transition-colors",
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_24px_rgba(16,185,129,0.5)] backdrop-blur-xl"
                        : "border-white/15 bg-slate-900/85 backdrop-blur-xl hover:bg-slate-900/95",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                      <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        {companyName}
                      </span>
                    </div>
                    <h4 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-white">
                      {job.title}
                    </h4>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {job.location?.city && (
                        <span className="text-[10px] text-slate-400">📍 {job.location.city}</span>
                      )}
                      {distanceLabel && (
                        <span className="text-[10px] text-blue-300">🚶 {distanceLabel}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-emerald-400">{salaryStr}</span>
                      <a
                        href={"/jobs/" + job._id}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-400"
                      >
                        Batafsil
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
