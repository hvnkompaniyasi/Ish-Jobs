"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { LogoUploader } from "@/components/jobs/LogoUploader";
import { useAuth } from "@/hooks";
import { jobsService, getErrorMessage } from "@/services";
import { cn } from "@/lib/utils";
import type { CreateJobPayload, EmploymentType, ExperienceLevel, Job } from "@/types";

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full-time", label: "To'liq stavka" },
  { value: "part-time", label: "Yarim stavka" },
  { value: "contract", label: "Shartnoma" },
  { value: "internship", label: "Amaliyot" },
  { value: "remote", label: "Masofadan" },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "intern", label: "Amaliyotchi" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    category: "IT",
    skills: "",
    employmentType: "full-time" as EmploymentType,
    experienceLevel: "middle" as ExperienceLevel,
    salaryMin: "",
    salaryMax: "",
    currency: "UZS",
    isNegotiable: false,
    city: "",
    country: "UZ",
    isRemote: false,
    companyName: "",
    companyWebsite: "",
    deadline: "",
    status: "active" as Job["status"],
  });

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=/jobs/${params.id}/edit`);
      return;
    }
    if (user?.activeRole !== "employer" && user?.role !== "admin") {
      router.replace("/jobs");
    }
  }, [hydrated, isAuthenticated, user, router, params.id]);

  useEffect(() => {
    if (!params.id || !isAuthenticated) return;
    (async () => {
      try {
        const data = await jobsService.getJob(params.id as string);
        setJob(data);
        const employerId = typeof data.employer === "object" ? data.employer._id : data.employer;
        if (user && employerId !== user._id && user.role !== "admin") {
          setError("Bu vakansiyani tahrirlash huquqi yo'q");
          return;
        }
        setForm({
          title: data.title || "",
          description: data.description || "",
          requirements: (data.requirements || []).join("\n"),
          responsibilities: (data.responsibilities || []).join("\n"),
          category: data.category || "IT",
          skills: (data.skills || []).join(", "),
          employmentType: data.employmentType || "full-time",
          experienceLevel: data.experienceLevel || "middle",
          salaryMin: data.salary?.min?.toString() || "",
          salaryMax: data.salary?.max?.toString() || "",
          currency: data.salary?.currency || "UZS",
          isNegotiable: data.salary?.isNegotiable || false,
          city: data.location?.city || "",
          country: data.location?.country || "UZ",
          isRemote: data.location?.isRemote || false,
          companyName: data.company?.name || "",
          companyWebsite: data.company?.website || "",
          deadline: data.deadline?.slice(0, 10) || "",
          status: data.status || "active",
        });
        if (data.company?.logo) setLogoPreview(data.company.logo);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, isAuthenticated, user]);

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.title.trim().length < 3) {
      setError("Sarlavha kamida 3 belgi");
      return;
    }
    if (form.description.trim().length < 20) {
      setError("Tavsif kamida 20 belgi");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Partial<CreateJobPayload> = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || "other",
        employmentType: form.employmentType,
        experienceLevel: form.experienceLevel,
        requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        salary: {
          min: form.salaryMin ? Number(form.salaryMin) : null,
          max: form.salaryMax ? Number(form.salaryMax) : null,
          currency: form.currency,
          isNegotiable: form.isNegotiable,
        },
        location: {
          city: form.city || null,
          country: form.country,
          isRemote: form.isRemote,
        },
        company: {
          name: form.companyName || undefined,
          website: form.companyWebsite || undefined,
        },
        deadline: form.deadline || null,
        status: form.status,
      };
      const updated = await jobsService.updateJob(params.id as string, payload, logoFile);
      router.push(`/jobs/${updated._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rim rounded-3xl glass p-8 text-center">
        <p className="text-rose-700 dark:text-rose-400">{error || "Vakansiya topilmadi"}</p>
        <Link href="/jobs/my">
          <Button variant="outline" className="mt-4">← Orqaga</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="animate-fade-in-up">
        <Link
          href={`/jobs/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          ← Orqaga
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Vakansiyani tahrirlash
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Ma&apos;lumotlarni yangilang va saqlang
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Asosiy ma&apos;lumot
          </h2>
          <div className="space-y-4">
            <Input label="Lavozim nomi *" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">Ish tavsifi *</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={6}
                required
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Kategoriya" value={form.category} onChange={(e) => update("category", e.target.value)} />
              <Input label="Ko'nikmalar (vergul)" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up delay-100">
          <h2 className="mb-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Talablar va vazifalar
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">Talablar (har bir qatorda)</label>
              <textarea
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">Vazifalar (har bir qatorda)</label>
              <textarea
                value={form.responsibilities}
                onChange={(e) => update("responsibilities", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up delay-200">
          <h2 className="mb-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Ish sharoiti va status
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-zinc-300">Ish turi</label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => update("employmentType", t.value)}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-sm font-bold transition-all duration-200",
                      form.employmentType === t.value
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                        : "border border-slate-200/60 bg-white/60 text-slate-700 hover:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-zinc-300">Tajriba darajasi</label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => update("experienceLevel", l.value)}
                    className={cn(
                      "rounded-xl px-3.5 py-2 text-sm font-bold transition-all duration-200",
                      form.experienceLevel === l.value
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                        : "border border-slate-200/60 bg-white/60 text-slate-700 hover:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-zinc-300">Vakansiya holati</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: "active", label: "Faol", color: "emerald" },
                  { value: "closed", label: "Yopilgan", color: "rose" },
                  { value: "draft", label: "Qoralama", color: "slate" },
                  { value: "archived", label: "Arxiv", color: "zinc" },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => update("status", s.value)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                      form.status === s.value
                        ? s.color === "emerald"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                          : s.color === "rose"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-500/30"
                          : "bg-slate-700 text-white shadow-md"
                        : "border border-slate-200/60 bg-white/60 text-slate-700 hover:border-emerald-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up delay-300">
          <h2 className="mb-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">Maosh</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Minimal" type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} />
            <Input label="Maksimal" type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} />
            <Input label="Valyuta" value={form.currency} onChange={(e) => update("currency", e.target.value)} />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isNegotiable}
              onChange={(e) => update("isNegotiable", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Kelishilgan</span>
          </label>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up delay-400">
          <h2 className="mb-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">Joylashuv</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Shahar" value={form.city} onChange={(e) => update("city", e.target.value)} />
            <Input label="Davlat" value={form.country} onChange={(e) => update("country", e.target.value)} />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isRemote}
              onChange={(e) => update("isRemote", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Masofadan ishlash</span>
          </label>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up delay-500">
          <h2 className="mb-5 text-lg font-black tracking-tight text-slate-900 dark:text-white">Kompaniya</h2>
          <div className="space-y-4">
            <Input label="Kompaniya nomi" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
            <Input label="Veb-sayt" value={form.companyWebsite} onChange={(e) => update("companyWebsite", e.target.value)} />
            <LogoUploader
              value={logoPreview}
              file={logoFile}
              onChange={(f, p) => {
                setLogoFile(f);
                setLogoPreview(p);
              }}
            />
            <Input label="Ariza muddati (ixtiyoriy)" type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-xl animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href={`/jobs/${params.id}`}>
            <Button variant="outline" type="button" className="w-full sm:w-auto">Bekor qilish</Button>
          </Link>
          <Button type="submit" loading={submitting} size="lg" className="w-full sm:w-auto">
            Yangilash
          </Button>
        </div>
      </form>
    </div>
  );
}
