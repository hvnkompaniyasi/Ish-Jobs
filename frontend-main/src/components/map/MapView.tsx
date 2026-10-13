"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Job } from "@/types";
import { haversineKm, formatDistance, coordsToLatLng, type LatLng } from "@/lib/geo";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════
export interface MapFlyTarget {
  lat: number;
  lng: number;
  zoom: number;
  token: number;
}

interface MapViewProps {
  jobs: Job[];
  flyTarget?: MapFlyTarget | null;
  userLocation?: LatLng | null;
  selectedJobId?: string | null;
  onJobSelect?: (id: string | null) => void;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatSalaryPill(salary: unknown): string {
  if (salary == null) return "Kelishilgan";
  if (typeof salary === "string") {
    const s = salary.trim();
    if (!s) return "Kelishilgan";
    return s.length > 14 ? s.slice(0, 12) + "…" : s;
  }
  if (typeof salary === "object") {
    const s = salary as { min?: number | null; max?: number | null; currency?: string; isNegotiable?: boolean };
    const { min, max, currency = "UZS", isNegotiable } = s;
    if (min == null && max == null) return "Kelishilgan";
    if (isNegotiable && min == null && max == null) return "Kelishilgan";

    const fmtNum = (n: number): string => {
      if (currency === "USD") return "$" + Math.round(n);
      if (currency === "EUR") return "€" + Math.round(n);
      if (currency === "RUB") return Math.round(n) + "₽";
      if (n >= 1000000) { const v = n / 1000000; return (v >= 10 ? Math.round(v) : +v.toFixed(1)) + " mln"; }
      if (n >= 1000) return Math.round(n / 1000) + "k";
      return String(n);
    };

    if (min != null && max != null && min !== max) return fmtNum(min) + "–" + fmtNum(max);
    if (min != null) return fmtNum(min) + "+";
    if (max != null) return fmtNum(max);
    return "Kelishilgan";
  }
  return "Kelishilgan";
}

function createSalaryIcon(label: string, selected = false): L.DivIcon {
  const safe = escapeHtml(label);
  const ring = selected
    ? "0 0 0 3px rgba(16,185,129,0.95), 0 8px 20px rgba(16,185,129,0.7), 0 0 26px rgba(16,185,129,0.5)"
    : "0 6px 16px rgba(16,185,129,0.55), 0 0 0 1.5px rgba(255,255,255,0.4) inset, 0 0 22px rgba(16,185,129,0.35)";

  const html = `
    <div style="
      position:absolute; top:0; left:0; transform:translate(-50%,-100%);
      display:inline-flex; align-items:center; gap:5px;
      padding:6px 11px; border-radius:9999px;
      background:linear-gradient(135deg,#10b981 0%,#059669 100%);
      color:#fff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
      font-size:12px; font-weight:700; line-height:1; letter-spacing:0.2px;
      white-space:nowrap; box-shadow:${ring};
      cursor:pointer; user-select:none; pointer-events:auto;
      transition:transform 0.15s ease;
    " onmouseover="this.style.transform='translate(-50%,-100%) scale(1.08)'"
      onmouseout="this.style.transform='translate(-50%,-100%) scale(1)'">
      <span style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:#fff;box-shadow:0 0 6px rgba(255,255,255,0.95);flex-shrink:0;"></span>
      <span>${safe}</span>
    </div>`;
  return L.divIcon({ html, className: "ishjobs-salary-marker", iconSize: [0, 0], iconAnchor: [0, 0], popupAnchor: [0, -30] });
}

// ═══════════════════════════════════════════════════════
// INTERNAL
// ═══════════════════════════════════════════════════════
function FitBoundsToJobs({ jobs }: { jobs: Job[] }) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = jobs
      .map((j) => {
        const c = j.locationPoint?.coordinates;
        if (!c || c.length !== 2) return null;
        return [c[1], c[0]] as [number, number];
      })
      .filter((v): v is [number, number] => v !== null);
    if (pts.length === 0) return;
    if (pts.length === 1) { map.setView(pts[0], 12, { animate: true }); return; }
    map.fitBounds(L.latLngBounds(pts), { padding: [80, 80], maxZoom: 13, animate: true });
  }, [jobs, map]);
  return null;
}

function FlyToTarget({ target }: { target?: MapFlyTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2, easeLinearity: 0.25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.token, map]);
  return null;
}

function MapClickDeselect({ onDeselect }: { onDeselect?: () => void }) {
  useMapEvents({ click: () => onDeselect?.() });
  return null;
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════
export default function MapView({
  jobs,
  flyTarget,
  userLocation,
  selectedJobId,
  onJobSelect,
  defaultCenter = [41.3111, 69.2797],
  defaultZoom = 6,
}: MapViewProps) {
  const validJobs = useMemo(
    () => jobs.filter((j) => j.locationPoint?.coordinates?.length === 2),
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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains="abc"
        maxZoom={19}
      />

      <FitBoundsToJobs jobs={validJobs} />
      <FlyToTarget target={flyTarget} />
      <MapClickDeselect onDeselect={() => onJobSelect?.(null)} />

      {/* Foydalanuvchi joylashuvi — ko'k pulsatsiyalanuvchi nuqta */}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.35,
            weight: 2,
          }}
          className="ishjobs-user-dot"
        />
      )}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={3}
          pathOptions={{ color: "#ffffff", fillColor: "#ffffff", fillOpacity: 1, weight: 2 }}
        />
      )}

      {validJobs.map((job) => {
        const [lng, lat] = job.locationPoint!.coordinates;
        const companyName =
          typeof job.company === "object" && job.company !== null
            ? (job.company as { name?: string }).name ?? "Kompaniya"
            : job.company || "Kompaniya";
        const salaryLabel = formatSalaryPill(job.salary);
        const isSelected = selectedJobId === job._id;
        const icon = createSalaryIcon(salaryLabel, isSelected);
        const href = `/jobs/${job._id}`;

        // Masofa hisoblash
        let distanceLabel: string | null = null;
        if (userLocation) {
          const d = haversineKm(userLocation, coordsToLatLng([lng, lat]));
          distanceLabel = formatDistance(d);
        }

        return (
          <Marker
            key={job._id}
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{ click: () => onJobSelect?.(job._id) }}
          >
            <Popup autoPan closeButton>
              <div className="w-[260px] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:text-white">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                  <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                    {companyName}
                  </span>
                </div>

                <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
                  {job.title}
                </h3>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {job.location?.city && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300">
                      📍 {job.location.city}
                    </span>
                  )}
                  {distanceLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-500/30 dark:text-blue-300">
                      🚶 {distanceLabel}
                    </span>
                  )}
                  {job.employmentType && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      {job.employmentType}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Maosh:</span>
                  <span className="text-[15px] font-bold text-emerald-400">{salaryLabel}</span>
                </div>

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
