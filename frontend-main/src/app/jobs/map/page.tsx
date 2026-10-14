"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { jobsService, getErrorMessage } from "@/services";
import type { Job } from "@/types";
import type { MapFlyTarget } from "@/components/map/MapView";
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
  if (min != null && max != null) return `${f(min)}–${f(max)}`;
  if (min != null) return f(min) + "+";
  return f(max!);
}

export default function JobsMapPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtr state
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [onlyWithSalary, setOnlyWithSalary] = useState(false);

  // GPS
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Sinxronizatsiya
  const [flyTarget, setFlyTarget] = useState<MapFlyTarget | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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

  // Filtrlangan joblar
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Kategoriya
      if (activeCategory) {
        const cat = (job.category ?? "").toLowerCase();
        if (!cat.includes(activeCategory)) return false;
      }
      // Maosh mavjudligi
      if (onlyWithSalary) {
        const s = job.salary as { min?: number | null; max?: number | null } | string | undefined;
        if (!s) return false;
        if (typeof s === "object" && s.min == null && s.max == null) return false;
      }
      // Radius
      if (radiusKm != null && userLocation && job.locationPoint?.coordinates) {
        const d = haversineKm(userLocation, coordsToLatLng(job.locationPoint.coordinates));
        if (d > radiusKm) return false;
      }
      // Shahar
      if (activeCity && job.location?.city !== activeCity) return false;
      return true;
    });
  }, [jobs, activeCategory, onlyWithSalary, radiusKm, userLocation, activeCity]);

  // GPS tugmasi
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

  // Karusel → marker sinxron
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
      const el = carouselRef.current.querySelector(`[data-job-id="${jobId}"]`);
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-slate-950">
      {/* ═════════ HEADER ═════════ */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[900] flex flex-col gap-2 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent px-4 pb-12 pt-[76px]">
        <div className="flex items-center justify-between gap-3">
          <div className="pointer-events-auto">
            <h1 className="text-lg font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Xaritada ishlar
            </h1>
            <p className="text-xs text-zinc-300">
              {loading ? "Yuklanmoqda..." : `${filteredJobs.length} ta vakansiya`}
              {userLocation && radiusKm && ` · ${radiusKm} km radiusda`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLocate}
              disabled={gpsLoading}
              className={`pointer-events-auto flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                userLocation
                  ? "border border-blue-400/50 bg-blue-500/20 text-blue-200"
                  : "border border-white/15 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {gpsLoading ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <span>📍</span>
              )}
              <span className="hidden sm:inline">{userLocation ? "Yoqilgan" : "Yaqinimda"}</span>
              <span className="sm:hidden">{userLocation ? "Yoqilgan" : "Yaqinimda"}</span>
            </button>
            <Link
              href="/jobs"
              className="pointer-events-auto rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
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

        {/* Radius filtri (faqat GPS yoqilganda) */}
        {userLocation && (
          <div className="pointer-events-auto -mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setRadiusKm(opt.value)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                  radiusKm === opt.value
                    ? "bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.6)]"
                    : "border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Shahar tugmalari */}
        {!loading && !error && jobs.length > 0 && (
          <div className="pointer-events-auto -mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        {/* Kategoriya + maosh filtri */}
        {!loading && !error && jobs.length > 0 && (
          <div className="pointer-events-auto -mx-4 flex items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={String(cat.value)}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-emerald-500/90 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:bg-white/15"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyWithSalary((v) => !v)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                onlyWithSalary
                  ? "bg-emerald-500/90 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:bg-white/15"
              }`}
            >
              💰 Maoshli
            </button>
          </div>
        )}
      </div>

      {/* ═════════ MAP ═════════ */}
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
              <h3 className="mt-3 text-base font-bold text-white">Xaritada vakansiya yo&apos;q</h3>
              <p className="mt-1 text-xs text-zinc-400">Koordinatalari kiritilgan vakansiyalar bu yerda ko&apos;rinadi</p>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <MapView
            jobs={filteredJobs}
            flyTarget={flyTarget}
            userLocation={userLocation}
            selectedJobId={selectedJobId}
            onJobSelect={handleMarkerSelect}
          />
        )}

        {/* ═════════ BOTTOM CAROUSEL ═════════ */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div
            ref={carouselRef}
            className="pointer-events-none absolute bottom-[92px] left-0 right-0 z-[950] flex gap-3 overflow-x-auto px-4 pb-2 md:bottom-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredJobs.map((job) => {
              const companyName =
                typeof job.company === "object" && job.company !== null
                  ? (job.company as { name?: string }).name ?? "Kompaniya"
                  : job.company || "Kompaniya";
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
                  className={`pointer-events-auto w-[240px] shrink-0 rounded-2xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_24px_rgba(16,185,129,0.5)] backdrop-blur-xl"
                      : "border-white/15 bg-slate-900/85 backdrop-blur-xl hover:bg-slate-900/95"
                  }`}
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
                    {(job.company as any)?.telegramContact && (
                      <a href={`https://t.me/${((job.company as any).telegramContact as string).replace(/^@/,"")}`} target="_blank" rel="noopener noreferrer" onClick={(e:any)=>e.stopPropagation()} className="shrink-0 inline-flex items-center justify-center text-sky-500 hover:text-sky-400 transition" aria-label="Telegram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0z"/></svg>
                      </a>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
