"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { cn } from "@/lib/utils";

type Mode = "phone" | "email";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [mode, setMode] = useState<Mode>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier =
      mode === "phone" ? phone.trim() : email.trim().toLowerCase();

    if (!identifier) {
      setError(mode === "phone" ? "Telefon raqamni kiriting" : "Emailni kiriting");
      return;
    }

    try {
      await login({ identifier, password });
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirishda xatolik");
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Xush kelibsiz</h1>
          <p className="mt-1 text-sm text-slate-500">Hisobingizga kiring</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setMode("phone"); setError(null); }}
            className={cn(
              "rounded-xl border px-4 py-2.5 text-sm font-medium transition",
              mode === "phone"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            📱 Telefon
          </button>
          <button
            type="button"
            onClick={() => { setMode("email"); setError(null); }}
            className={cn(
              "rounded-xl border px-4 py-2.5 text-sm font-medium transition",
              mode === "email"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            ✉️ Email
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "phone" ? (
            <PhoneInput
              label="Telefon raqam"
              value={phone}
              onChange={setPhone}
              required
            />
          ) : (
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="siz@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          )}

          <Input
            label="Parol"
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm whitespace-pre-line text-rose-700">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Kirish
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Hisobingiz yo&apos;qmi?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  );
}
