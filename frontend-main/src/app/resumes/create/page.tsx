"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks";
import { resumesService, getErrorMessage } from "@/services";
import type { CreateResumePayload, ResumeEducation, ResumeExperience } from "@/types";

const emptyExperience = (): ResumeExperience => ({
  company: "", position: "", startDate: "", endDate: "", current: false, description: "",
});

const emptyEducation = (): ResumeEducation => ({
  institution: "", degree: "", field: "", startDate: "", endDate: "",
});

export default function CreateResumePage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", about: "", skills: "", languages: "", location: "",
    salaryMin: "", salaryMax: "", currency: "UZS", isPublic: true, isPrimary: false,
  });

  const [experience, setExperience] = useState<ResumeExperience[]>([emptyExperience()]);
  const [education, setEducation] = useState<ResumeEducation[]>([emptyEducation()]);

  useEffect(() => {
    console.log("[create] Guard:", { hydrated, isAuthenticated, activeRole: user?.activeRole, role: user?.role });
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/resumes/create");
      return;
    }
    if (user?.activeRole !== "seeker" && user?.role !== "admin") {
      router.replace("/resumes/my");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const update = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.title.trim().length < 2) {
      setError("Sarlavha kamida 2 belgi bo'lishi kerak");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateResumePayload = {
        title: form.title.trim(),
        about: form.about.trim() || undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        location: form.location.trim() || undefined,
        expectedSalary: {
          min: form.salaryMin ? Number(form.salaryMin) : null,
          max: form.salaryMax ? Number(form.salaryMax) : null,
          currency: form.currency,
        },
        experience: experience
          .filter((e) => e.company && e.position && e.startDate)
          .map((e) => ({ ...e, endDate: e.current ? null : e.endDate || null })),
        education: education.filter((e) => e.institution && e.startDate),
        isPublic: form.isPublic,
        isPrimary: form.isPrimary,
      };
      const resume = await resumesService.createResume(payload);
      router.push(`/resumes/${resume._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="text-4xl">🔒</div>
          <h2 className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-white">Kirish kerak</h2>
          <Link href="/login?next=/resumes/create">
            <Button className="mt-4">Kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/resumes/my" className="text-sm font-medium text-slate-600 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400">
          ← Orqaga
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">Yangi rezyume</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">O&apos;zingiz haqingizda batafsil ma&apos;lumot kiriting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">Asosiy ma&apos;lumot</h2>
          <div className="space-y-4">
            <Input label="Sarlavha *" placeholder="Frontend dasturchi" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">O&apos;zim haqida</label>
              <textarea value={form.about} onChange={(e) => update("about", e.target.value)} placeholder="Tajribangiz, maqsadlaringiz..." rows={5} className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Ko'nikmalar (vergul bilan)" placeholder="React, Next.js" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
              <Input label="Tillar (vergul bilan)" placeholder="uz, ru, en" value={form.languages} onChange={(e) => update("languages", e.target.value)} />
            </div>
            <Input label="Joylashuv" placeholder="Toshkent" value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ish tajribasi</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setExperience((e) => [...e, emptyExperience()])}>+ Qo&apos;shish</Button>
          </div>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/60 bg-white/40 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">#{idx + 1}</span>
                  {experience.length > 1 && (
                    <button type="button" onClick={() => setExperience((e) => e.filter((_, i) => i !== idx))} className="text-xs text-rose-600 hover:text-rose-700">O&apos;chirish</button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Kompaniya" placeholder="Tech Corp" value={exp.company} onChange={(e) => setExperience((list) => list.map((it, i) => i === idx ? { ...it, company: e.target.value } : it))} />
                  <Input label="Lavozim" placeholder="Frontend dasturchi" value={exp.position} onChange={(e) => setExperience((list) => list.map((it, i) => i === idx ? { ...it, position: e.target.value } : it))} />
                  <Input label="Boshlanish" type="date" value={exp.startDate?.slice(0, 10) || ""} onChange={(e) => setExperience((list) => list.map((it, i) => i === idx ? { ...it, startDate: e.target.value } : it))} />
                  <Input label="Tugash" type="date" disabled={exp.current} value={exp.endDate?.slice(0, 10) || ""} onChange={(e) => setExperience((list) => list.map((it, i) => i === idx ? { ...it, endDate: e.target.value } : it))} />
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={!!exp.current} onChange={(e) => setExperience((list) => list.map((it, i) => i === idx ? { ...it, current: e.target.checked } : it))} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Hali ishlayapman</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ta&apos;lim</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setEducation((e) => [...e, emptyEducation()])}>+ Qo&apos;shish</Button>
          </div>
          <div className="space-y-4">
            {education.map((ed, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/60 bg-white/40 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">#{idx + 1}</span>
                  {education.length > 1 && (
                    <button type="button" onClick={() => setEducation((e) => e.filter((_, i) => i !== idx))} className="text-xs text-rose-600 hover:text-rose-700">O&apos;chirish</button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Muassasa" placeholder="TATU" value={ed.institution} onChange={(e) => setEducation((list) => list.map((it, i) => i === idx ? { ...it, institution: e.target.value } : it))} />
                  <Input label="Daraja" placeholder="Bakalavr" value={ed.degree || ""} onChange={(e) => setEducation((list) => list.map((it, i) => i === idx ? { ...it, degree: e.target.value } : it))} />
                  <Input label="Boshlanish" type="date" value={ed.startDate?.slice(0, 10) || ""} onChange={(e) => setEducation((list) => list.map((it, i) => i === idx ? { ...it, startDate: e.target.value } : it))} />
                  <Input label="Tugash" type="date" value={ed.endDate?.slice(0, 10) || ""} onChange={(e) => setEducation((list) => list.map((it, i) => i === idx ? { ...it, endDate: e.target.value } : it))} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">Kutilayotgan maosh</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Minimal" type="number" placeholder="8000000" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
            <Input label="Maksimal" type="number" placeholder="15000000" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
            <Input label="Valyuta" value={form.currency} onChange={(e) => update("currency", e.target.value)} />
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">Sozlamalar</h2>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => update("isPublic", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Ommaviy (ish beruvchilar ko&apos;ra oladi)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.isPrimary} onChange={(e) => update("isPrimary", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Asosiy rezyume sifatida belgilash</span>
            </label>
          </div>
        </section>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm whitespace-pre-line text-rose-700">{error}</div>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href="/resumes/my"><Button variant="outline" type="button" className="w-full sm:w-auto">Bekor qilish</Button></Link>
          <Button type="submit" loading={submitting} size="lg" className="w-full sm:w-auto">Rezyumeni saqlash</Button>
        </div>
      </form>
    </div>
  );
}
