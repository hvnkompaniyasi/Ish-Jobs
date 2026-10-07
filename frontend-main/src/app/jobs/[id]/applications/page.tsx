"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { applicationsService, getErrorMessage } from "@/services";
import { initials, fullName, timeAgo, formatSalary } from "@/lib/utils";
import type { Application, Job, Resume, User } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "reviewing", label: "Ko'rilmoqda" },
  { value: "shortlisted", label: "Tanlangan" },
  { value: "interview", label: "Suhbat" },
  { value: "accepted", label: "Qabul qilindi" },
  { value: "rejected", label: "Rad etildi" },
];

export default function JobApplicationsPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await applicationsService.getForJob(params.id as string);
      setJob(res.job);
      setApps(res.applications);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const updated = await applicationsService.updateStatus(
        id,
        status as Application["status"]
      );
      setApps((list) => list.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-rose-700">{error}</p>
        <Link href="/jobs/my">
          <Button variant="outline" className="mt-4">← Orqaga</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/jobs/my"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600"
      >
        ← Mening e&apos;lonlarim
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {job?.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {apps.length} ta ariza kelgan
        </p>
      </div>

      {apps.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="text-4xl">📭</div>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            Hozircha ariza yo&apos;q
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Nomzodlar ariza topshirgach, bu yerda ko&apos;rinadi
          </p>
        </div>
      )}

      <div className="space-y-4">
        {apps.map((a) => {
          const applicant =
            typeof a.applicant === "object" ? (a.applicant as User) : null;
          const resume =
            typeof a.resume === "object" ? (a.resume as Resume) : null;

          return (
            <div
              key={a._id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                  {initials(applicant?.firstName, applicant?.lastName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {fullName(applicant)}
                    </h3>
                    <ApplicationStatusBadge status={a.status} />
                  </div>

                  <div className="text-sm text-slate-600">
                    {applicant?.phone && <span>📞 {applicant.phone}</span>}
                    {applicant?.email && <span className="ml-3">✉️ {applicant.email}</span>}
                  </div>

                  {resume && (
                    <div className="text-sm text-slate-600">
                      📄 <Link href={`/resumes/${resume._id}`} className="text-indigo-600 hover:underline">{resume.title}</Link>
                      {resume.expectedSalary && (
                        <span className="ml-2 text-xs text-slate-500">
                          {formatSalary(resume.expectedSalary)}
                        </span>
                      )}
                    </div>
                  )}

                  {a.coverLetter && (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="text-xs font-semibold text-slate-500">Cover letter</p>
                      <p className="mt-1 whitespace-pre-line">{a.coverLetter}</p>
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Yuborilgan: {timeAgo(a.createdAt)}
                  </p>
                </div>

                {/* Status actions */}
                <div className="flex flex-col gap-2 sm:w-48">
                  <label className="text-xs font-medium text-slate-600">
                    Statusni o&apos;zgartirish
                  </label>
                  <select
                    value={a.status}
                    disabled={updating === a._id || ["accepted", "rejected", "withdrawn"].includes(a.status)}
                    onChange={(e) => handleStatus(a._id, e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                  >
                    <option value={a.status}>
                      {a.status === "pending"
                        ? "Yuborilgan"
                        : a.status === "accepted"
                        ? "Qabul qilindi"
                        : a.status === "rejected"
                        ? "Rad etildi"
                        : a.status === "withdrawn"
                        ? "Olib tashlangan"
                        : a.status === "reviewing"
                        ? "Ko'rilmoqda"
                        : a.status === "shortlisted"
                        ? "Tanlangan"
                        : a.status === "interview"
                        ? "Suhbat"
                        : a.status}
                    </option>
                    {STATUS_OPTIONS.filter((o) => o.value !== a.status).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
