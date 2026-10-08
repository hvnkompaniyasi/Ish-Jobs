"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { cn } from "@/lib/utils";

type Mode = "phone" | "email";

function LoginForm() {
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

    const identifier = mode === "phone" ? phone.trim() : email.trim().toLowerCase();

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
    <div className="relative mx-auto max-w-md overflow-hidden py-6 sm:py-12">
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />

      <div className="rim relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8 animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Xush kelibsiz
          </h1>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/60 bg-white/40 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <button
            type="button"
            onClick={() => { setMode("phone"); setError(null); }}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
              mode === "phone"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 dark:bg-emerald-500"
                : "text-slate-600 hover:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/5"
            )}
          >
            📱 Telefon
          </button>
          <button
            type="button"
            onClick={() => { setMode("email"); setError(null); }}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
              mode === "email"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 dark:bg-emerald-500"
                : "text-slate-600 hover:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/5"
            )}
          >
            ✉️ Email
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "phone" ? (
            <PhoneInput label="Telefon raqam" value={phone} onChange={setPhone} required />
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
            <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium whitespace-pre-line text-rose-700 backdrop-blur-xl animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Kirish
          </Button>
        </form>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

        <p className="text-center text-sm text-slate-600 dark:text-zinc-400">
          Hisobingiz yo&apos;qmi?{" "}
          <Link
            href="/register"
            className="font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
