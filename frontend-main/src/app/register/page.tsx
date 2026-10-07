"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.phone.replace(/\D/g, "").length < 9) {
      setError("Telefon raqamni to'liq kiriting");
      return;
    }

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email.trim() || undefined,
        password: form.password,
        role: "seeker",
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatda xatolik");
    }
  };

  return (
    <div className="relative mx-auto max-w-md py-6 sm:py-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />

      <div className="rim relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8 animate-fade-in-up">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-500/40 ring-2 ring-white/40 dark:ring-white/10">
            ij
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Hisob yarating
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            ishjobs&apos;ga qo&apos;shiling
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ism"
              name="firstName"
              placeholder="Ismingiz"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
            <Input
              label="Familiya"
              name="lastName"
              placeholder="Familiyangiz"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>

          <PhoneInput
            label="Telefon raqam"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            hint="Asosiy kirish usuli"
            required
          />

          <Input
            label="Email (ixtiyoriy)"
            type="email"
            name="email"
            placeholder="siz@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <Input
            label="Parol"
            type="password"
            name="password"
            placeholder="Kamida 8 ta belgi"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={8}
          />

          {error && (
            <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium whitespace-pre-line text-rose-700 backdrop-blur-xl animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Ro&apos;yxatdan o&apos;tish
          </Button>
        </form>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

        <p className="text-center text-sm text-slate-600 dark:text-zinc-400">
          Hisobingiz bormi?{" "}
          <Link
            href="/login"
            className="font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
