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

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.phone.replace(/\D/g, "").length < 10) {
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
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Hisob yarating</h1>
          <p className="mt-1 text-sm text-slate-500">
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
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Ro&apos;yxatdan o&apos;tish
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Hisobingiz bormi?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
