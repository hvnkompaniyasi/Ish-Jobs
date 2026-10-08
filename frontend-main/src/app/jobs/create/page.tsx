"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks";
import { jobsService, getErrorMessage } from "@/services";
import { cn } from "@/lib/utils";
import { LogoUploader } from "@/components/jobs/LogoUploader";
import type {
  CreateJobPayload,
  EmploymentType,
  ExperienceLevel,
} from "@/types";

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

export default function CreateJobPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
  });

  // Foydalanuvchi company nomi bo'lsa — avtomatik to'ldirish
  useEffect(() => {
    if (user?.company?.name) {
      setForm((f) => ({ ...f, companyName: user.company!.name! }));
    }
  }, [user]);

  // Auth/role tekshiruvi — himoyani yaxshiladik
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/jobs/create");
      return;
    }
    if (user?.role !== "employer" && user?.role !== "admin") {
      router.replace("/jobs");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const update = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.title.length < 3) {
      setError("Sarlavha kamida 3 belgi bo'lishi kerak");
      return;
    }
    if (form.description.length < 20) {
      setError("Tavsif kamida 20 belgi bo'lishi kerak");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateJobPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || "other",
        employmentType: form.employmentType,
        experienceLevel: form.experienceLevel,
        requirements: form.requirements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        responsibilities: form.responsibilities
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
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
        status: "active",
      };

      const job = await jobsService.createJob(payload);
      router.push(`/jobs/${job._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Auth emas — redirect bo'ladi, lekin xavfsizlik uchun ko'rsatamiz
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="text-4xl">🔒</div>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            Kirish kerak
          </h2>
          <Link href="/login">
            <Button className="mt-4">Kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Rol tekshiruvi
  if (user?.role !== "employer" && user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
          <div className="text-4xl">⛔</div>
          <h2 className="mt-3 text-lg font-semibold text-rose-900">
            Ruxsat yo&apos;q
          </h2>
          <p className="mt-1 text-sm text-rose-700">
            Faqat ish beruvchilar vakansiya yaratishi mumkin
          </p>
          <Link href="/jobs">
            <Button variant="outline" className="mt-4">
              ← Orqaga
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/jobs"
          className="text-sm font-medium text-slate-600 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          ← Orqaga
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Yangi vakansiya
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Formani to&apos;ldiring va e&apos;lon joylang
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Asosiy ma&apos;lumot
          </h2>
          <div className="space-y-4">
            <Input
              label="Lavozim nomi *"
              placeholder="Senior Node.js Dasturchi"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
                Ish tavsifi *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Vazifa, loyihalar, jamoa haqida batafsil yozing..."
                rows={6}
                required
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                Kamida 20 belgi ({form.description.length})
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Kategoriya"
                placeholder="IT, Marketing, Dizayn..."
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              />
              <Input
                label="Ko'nikmalar (vergul bilan)"
                placeholder="Node.js, MongoDB, Express"
                value={form.skills}
                onChange={(e) => update("skills", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Talablar va vazifalar
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
                Talablar (har bir qatorda bittasi)
              </label>
              <textarea
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                placeholder={"Node.js 3+ yil tajriba\nMongoDB bilan ishlash\nJamoaviy ish ko'nikmasi"}
                rows={4}
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-zinc-300">
                Vazifalar (har bir qatorda bittasi)
              </label>
              <textarea
                value={form.responsibilities}
                onChange={(e) => update("responsibilities", e.target.value)}
                placeholder={"Yangi API'lar yaratish\nKod review qilish\nArxitektura qarorlar qabul qilish"}
                rows={4}
                className="w-full rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 backdrop-blur-xl focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Ish sharoiti
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ish turi
              </label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => update("employmentType", t.value)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition",
                      form.employmentType === t.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tajriba darajasi
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => update("experienceLevel", l.value)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition",
                      form.experienceLevel === l.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">Maosh</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Minimal"
              type="number"
              placeholder="10000000"
              value={form.salaryMin}
              onChange={(e) => update("salaryMin", e.target.value)}
            />
            <Input
              label="Maksimal"
              type="number"
              placeholder="18000000"
              value={form.salaryMax}
              onChange={(e) => update("salaryMax", e.target.value)}
            />
            <Input
              label="Valyuta"
              placeholder="UZS"
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
            />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isNegotiable}
              onChange={(e) => update("isNegotiable", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Kelishilgan</span>
          </label>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Joylashuv
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Shahar"
              placeholder="Toshkent"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <Input
              label="Davlat"
              placeholder="UZ"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isRemote}
              onChange={(e) => update("isRemote", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              Masofadan ishlash mumkin
            </span>
          </label>
        </section>

        <section className="rim rounded-3xl glass p-6 animate-fade-in-up">
          <h2 className="mb-4 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Kompaniya
          </h2>
          <div className="space-y-4">
            <Input
              label="Kompaniya nomi"
              placeholder="Tech Corp"
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
            <LogoUploader
              value={logoPreview}
              file={logoFile}
              onChange={(file, preview) => {
                setLogoFile(file);
                setLogoPreview(preview);
              }}
            />
            <Input
              label="Veb-sayt"
              placeholder="https://techcorp.uz"
              value={form.companyWebsite}
              onChange={(e) => update("companyWebsite", e.target.value)}
            />
            <Input
              label="Ariza muddati (ixtiyoriy)"
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
            />
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium whitespace-pre-line text-rose-700 backdrop-blur-xl dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href="/jobs">
            <Button variant="outline" type="button" className="w-full sm:w-auto">
              Bekor qilish
            </Button>
          </Link>
          <Button
            type="submit"
            loading={submitting}
            size="lg"
            className="w-full sm:w-auto"
          >
            Vakansiyani joylash
          </Button>
        </div>
      </form>
    </div>
  );
}
