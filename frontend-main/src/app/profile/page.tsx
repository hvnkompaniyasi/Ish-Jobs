"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { DeleteAccountModal } from "@/components/auth/DeleteAccountModal";
import { useAuth } from "@/hooks";
import { cn, initials, fullName } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    hydrated,
    updateProfile,
    changePassword,
  } = useAuth();

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/profile");
    }
  }, [hydrated, isAuthenticated, router]);

  // Formani user bilan to'ldirish
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
      });
      setProfileMsg("Profil muvaffaqiyatli yangilandi");
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErr("Yangi parollar mos kelmadi");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordErr("Yangi parol kamida 8 belgi bo'lishi kerak");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordMsg("Parol muvaffaqiyatli o'zgartirildi");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) {
      setPasswordErr(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!hydrated || !user) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const isEmployer = (user.activeRole || user.role) === "employer";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ═══════ HEADER CARD ═══════ */}
      <div className="rim relative overflow-hidden rounded-3xl glass p-6 sm:p-8 animate-fade-in-up">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/20 to-transparent blur-3xl" />

        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-2xl shadow-emerald-500/40 ring-4 ring-white/40 dark:ring-white/10">
            {initials(user.firstName, user.lastName)}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {fullName(user)}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              {user.phone || user.email}
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                  isEmployer
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
                )}
              >
                {isEmployer ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <path d="M9 22v-4h6v4" />
                    </svg>
                    Ish beruvchi
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Ish qidiruvchi
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ PROFILE EDIT ═══════ */}
      <section className="rim rounded-3xl glass p-6 sm:p-8 animate-fade-in-up delay-100">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Profil ma&apos;lumotlari
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ism va familiyani tahrirlash
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Ism"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="Ismingiz"
              required
            />
            <Input
              label="Familiya"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Familiyangiz"
              required
            />
          </div>

          <Input
            label="Telefon raqam"
            value={user.phone || ""}
            disabled
            hint="Telefon raqamni o'zgartirish mumkin emas"
          />

          {profileMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 backdrop-blur-xl animate-fade-in dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {profileMsg}
            </div>
          )}

          {profileErr && (
            <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-xl animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {profileErr}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Saqlash
            </Button>
          </div>
        </form>
      </section>

      {/* ═══════ PASSWORD CHANGE ═══════ */}
      <section className="rim rounded-3xl glass p-6 sm:p-8 animate-fade-in-up delay-200">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Parolni o&apos;zgartirish
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Xavfsizlik uchun eski parolni kiriting
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Eski parol"
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Yangi parol"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="Kamida 8 belgi"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Input
              label="Yangi parolni takrorlash"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Yana kiriting"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {passwordMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 backdrop-blur-xl animate-fade-in dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {passwordMsg}
            </div>
          )}

          {passwordErr && (
            <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-xl animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
              {passwordErr}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={savingPassword}>
              Parolni o&apos;zgartirish
            </Button>
          </div>
        </form>
      </section>

      {/* ═══════ DANGER ZONE ═══════ */}
      <section className="rim rounded-3xl border border-rose-200/60 bg-rose-50/40 p-6 backdrop-blur-xl animate-fade-in-up delay-300 dark:border-rose-500/20 dark:bg-rose-500/5 sm:p-8">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-black tracking-tight text-rose-900 dark:text-rose-400">
              Xavfli hudud
            </h2>
            <p className="text-xs text-rose-700/70 dark:text-rose-400/70">
              Hisobni o&apos;chirish — qaytarib bo&apos;lmaydi
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-rose-900/80 dark:text-rose-300/80">
          Hisobingizni o&apos;chirsangiz, barcha ma&apos;lumotlaringiz
          (rezyumelar, vakansiyalar, arizalar) <strong>butunlay o&apos;chiriladi</strong>.
        </p>

        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
          Hisobni o&apos;chirish
        </Button>
      </section>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sm font-medium text-slate-500 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          ← Bosh sahifaga qaytish
        </Link>
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
