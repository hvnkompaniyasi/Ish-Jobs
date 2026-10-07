"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { resumesService, getErrorMessage } from "@/services";
import { formatSalary, formatDate, fullName } from "@/lib/utils";
import type { Resume } from "@/types";

export default function ResumeDetailPage() {
  const params = useParams();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await resumesService.getResume(params.id as string);
        setResume(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  if (error || !resume) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-rose-700">{error || "Rezyume topilmadi"}</p>
        <Link href="/resumes/my"><Button variant="outline" className="mt-4">← Orqaga</Button></Link>
      </div>
    );
  }

  const owner = typeof resume.user === "object" ? resume.user : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/resumes/my" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600">← Rezyumelarim</Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {resume.isPrimary && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">Asosiy</span>}
              {resume.isPublic === false && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">Yopiq</span>}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{resume.title}</h1>
            {owner && (
              <p className="mt-1 text-sm text-slate-600">
                {fullName(owner)}{resume.location && ` • 📍 ${resume.location}`}
              </p>
            )}
            <p className="mt-3 text-lg font-semibold text-indigo-600">{formatSalary(resume.expectedSalary)}</p>
          </div>
        </div>
        {owner && (
          <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm">
            {owner.email && <span className="text-slate-600">✉️ {owner.email}</span>}
            {owner.phone && <span className="text-slate-600">📞 {owner.phone}</span>}
            {resume.experienceYears !== undefined && resume.experienceYears > 0 && (
              <span className="text-slate-600">💼 {resume.experienceYears} yil tajriba</span>
            )}
          </div>
        )}
      </div>

      {resume.about && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Men haqimda</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{resume.about}</p>
        </section>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Ko&apos;nikmalar</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {resume.skills.map((s, i) => (
              <span key={i} className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{s}</span>
            ))}
          </div>
        </section>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Ish tajribasi</h2>
          <div className="mt-4 space-y-4">
            {resume.experience.map((e, i) => (
              <div key={i} className="border-l-2 border-indigo-200 pl-4">
                <p className="font-semibold text-slate-900">{e.position}</p>
                <p className="text-sm text-slate-600">{e.company}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {e.startDate ? formatDate(e.startDate) : "—"} — {e.current ? "Hozirgacha" : e.endDate ? formatDate(e.endDate) : "—"}
                </p>
                {e.description && <p className="mt-2 text-sm text-slate-700">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education && resume.education.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Ta&apos;lim</h2>
          <div className="mt-4 space-y-4">
            {resume.education.map((e, i) => (
              <div key={i} className="border-l-2 border-emerald-200 pl-4">
                <p className="font-semibold text-slate-900">{e.institution}</p>
                {(e.degree || e.field) && <p className="text-sm text-slate-600">{[e.degree, e.field].filter(Boolean).join(" • ")}</p>}
                <p className="mt-1 text-xs text-slate-500">
                  {e.startDate ? formatDate(e.startDate) : "—"} — {e.endDate ? formatDate(e.endDate) : "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.languages && resume.languages.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Tillar</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {resume.languages.map((l, i) => (
              <span key={i} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{l.toUpperCase()}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
