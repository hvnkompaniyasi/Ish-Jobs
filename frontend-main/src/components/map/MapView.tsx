"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { formatSalary } from "@/lib/utils";
import type { Job } from "@/types";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="#10b981"/>
        <circle cx="18" cy="18" r="7" fill="white"/>
      </svg>`
    ),
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -46],
});

function FitBounds({ jobs }: { jobs: Job[] }) {
  const map = useMap();
  useEffect(() => {
    const points = jobs
      .map((j) => j.locationPoint?.coordinates)
      .filter((c): c is [number, number] => Array.isArray(c) && c.length === 2);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((c) => [c[1], c[0]]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (points.length === 1) {
      map.setView([points[0][1], points[0][0]], 12);
    }
  }, [jobs, map]);
  return null;
}

export default function MapView({ jobs }: { jobs: Job[] }) {
  const validJobs = jobs.filter(
    (j) =>
      j.locationPoint?.coordinates &&
      Array.isArray(j.locationPoint.coordinates) &&
      j.locationPoint.coordinates.length === 2
  );

  return (
    <MapContainer
      center={[41.2995, 69.2401]}
      zoom={11}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={false}
      dragging={true}
      touchZoom={true}
      doubleClickZoom={true}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />

      <FitBounds jobs={validJobs} />

      {validJobs.map((job) => {
        const coords = job.locationPoint!.coordinates;
        const [lng, lat] = coords;
        return (
          <Marker key={job._id} position={[lat, lng]} icon={greenIcon}>
            <Popup>
              <div className="min-w-[200px] p-1">
                <p className="text-xs font-bold text-emerald-600">
                  {job.company?.name || "Kompaniya"}
                </p>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  {job.title}
                </h3>
                {job.location?.city && (
                  <p className="mt-1 text-xs text-slate-500">
                    📍 {job.location.city}
                  </p>
                )}
                <p className="mt-2 text-sm font-black text-emerald-600">
                  {formatSalary(job.salary)}
                </p>
                <Link
                  href={`/jobs/${job._id}`}
                  className="mt-2 block rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Batafsil →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
