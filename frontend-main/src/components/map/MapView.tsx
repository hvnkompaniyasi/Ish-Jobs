"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Job } from "@/types";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════
export interface MapFlyTarget {
  lat: number;
  lng: number;
  zoom: number;
  /** Har bosishda yangi token — useEffect qayta ishga tushishi uchun */
  token: number;
}

interface MapViewProps {
  jobs: Job[];
  flyTarget?: MapFlyTarget | null;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Maoshni marker uchun qisqa formatda qaytaradi: "12 mln", "$800", "8–12 mln" */
function formatSalaryPill(salary: Job["salary"] | undefined): string {
  if (salary == null) return "Kelishilgan";

  if (typeof salary === "string") {
    const s = salary.trim();
    if (!s) return "Kelishilgan";
    return s.length > 14 ? s.slice(0, 12) + "…" : s;
  }

  if (typeof salary === "object") {
    const s = salary as {
      min?: number | null;
      max?: number | null;
      currency?: string;
      isNegotiable?: boolean;
    };
    const { min, max, currency = "UZS", isNegotiable } = s;

    if (min == null && max == null) return "Kelishilgan";
    if (isNegotiable && min == null && max == null) return "Kelishilgan";

    const fmtNum = (n: number): string => {
      if (currency === "USD") return `$${Math.round(n)}`;
      if (currency === "EUR") return `€${Math.round(n)}`;
      if (currency === "RUB") return `${Math.round(n)}₽`;
      if (n >= 1_000_000) {
        const v = n / 1_000_000;
        return `${v >= 10 ? Math.round(v) : +v.toFixed(1)} mln`;
      }
      if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
      return String(n);
    };

    if (min != null && max != null && min !== max) {
      return `${fmtNum(min)}–${fmtNum(max)}`;
    }
    if (min != null) return `${fmtNum(min)}+`;
    return fmtNum(max!);
  }

  return "Kelishilgan";
}

/** Airbnb-uslubidagi yashil pill marker (maosh yozilgan) */
function createSalaryIcon(label: string): L.DivIcon {
  const safe = escapeHtml(label);

  const html = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      transform: translate(-50%, -100%);
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 11px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0.2px;
      white-space: nowrap;
      box-shadow:
        0 6px 16px rgba(16, 185, 129, 0.55),
        0 0 0 1.5px rgba(255, 255, 255, 0.4) inset,
        0 0 22px rgba(16, 185, 129, 0.35);
      cursor: pointer;
      user-select: none;
      pointer-events: auto;
    ">
      <span style="
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 9999px;
        background: #ffffff;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.95);
        flex-shrink: 0;
      "></span>
      <span>${safe}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "ishjobs-salary-marker",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -30],
  });
}

// ═══════════════════════════════════════════════════════
// INTERNAL COMPONENTS
// ═══════════════════════════════════════════════════════

/** Barcha markerlar sig'adigan qilib xaritani avtomatik moslashtiradi */
function FitBoundsToJobs({ jobs }: { jobs: Job[] }) {
  const map = useMap();

  useEffect(() => {
    const latLngs: [number, number][] = jobs
      .map((job) => {
        const c = job.locationPoint?.coordinates;
        if (!c || c.length !== 2) return null;
        const [lng, lat] = c;
        if (typeof lat !== "number" || typeof lng !== "number") return null;
        return [lat, lng] as [number, number];
      })
      .filter((v): v is [number, number] => v !== null);

    if (latLngs.length === 0) return;

    if (latLngs.length === 1) {
      map.setView(latLngs[0], 12, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 13, animate: true });
  }, [jobs, map]);

  return null;
}

/** Shahar tanlanganda xaritani silliq o'sha yerga uchirish */
function FlyToTarget({ target }: { target?: MapFlyTarget | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], target.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.token, map]);

  return null;
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function MapView({
  jobs,
  flyTarget,
  defaultCenter = [41.3111, 69.2797],
  defaultZoom = 6,
}: MapViewProps) {
  const validJobs = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.locationPoint?.coordinates &&
          Array.isArray(j.locationPoint.coordinates) &&
          j.locationPoint.coordinates.length === 2,
      ),
    [jobs],
  );

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom
      worldCopyJump
      className="h-full w-full"
    >
      {/* OSM Standard — butun dunyo, bepul, API key kerak emas.
          CSS filter (globals.css) uni dark rejimga o'giradi, lekin
          barcha ko'chalar, mahallalar, metro va daryolar ko'rinadi. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains="abc"
        maxZoom={19}
      />

      <FitBoundsToJobs jobs={validJobs} />
      <FlyToTarget target={flyTarget} />

      {validJobs.map((job) => {
        const coords = job.locationPoint!.coordinates;
        const [lng, lat] = coords;

        const companyName =
          typeof job.company === "object" && job.company !== null
            ? (job.company as { name?: string }).name ?? "Kompaniya"
            : job.company || "Kompaniya";

        const salaryLabel = formatSalaryPill(job.salary);
        const icon = createSalaryIcon(salaryLabel);
        const href = `/jobs/${job._id}`;

        return (
          <Marker
            key={job._id}
            position={[lat, lng]}
            icon={icon}
          >
            <Popup autoPan closeButton>
              <div className="w-[260px] overflow-hidden rounded-2xl bg-slate-900/95 p-4 text-white backdrop-blur-xl">
                {/* Kompaniya */}
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                  <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                    {companyName}
                  </span>
                </div>

                {/* Sarlavha */}
                <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-white">
                  {job.title}
                </h3>

                {/* Meta */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {job.location?.city && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      📍 {job.location.city}
                    </span>
                  )}
                  {job.employmentType && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                      {job.employmentType}
                    </span>
                  )}
                </div>

                {/* Maosh */}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[11px] text-slate-400">Maosh:</span>
                  <span className="text-[15px] font-bold text-emerald-400">
                    {formatSalaryPill(job.salary)}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={href}
                  className="mt-3 block w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-2 text-center text-[12.5px] font-bold text-slate-950 transition-all hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                >
                  Batafsil ko&apos;rish ↗
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
