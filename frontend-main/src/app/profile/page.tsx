"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { DeleteAccountModal } from "@/components/auth/DeleteAccountModal";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { useAuth } from "@/hooks";
import { useT } from "@/i18n/I18nProvider";
import { cn, fullName } from "@/lib/utils";
import { notificationsService } from "@/services";

type Tab = "profil" | "xavfsizlik" | "faoliyatim";

function getTabs(t: (k: string) => string): { id: Tab; label: string }[] {
  return [
    { id: "profil", label: t("profile.title") },
    { id: "faoliyatim", label: t("profile.activity") },
    { id: "xavfsizlik", label: t("profile.security") },
  ];
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, hydrated, updateProfile, changePassword, logout, switchRole } = useAuth();
  const t = useT();

  const initialTab = (searchParams.get("tab") as Tab) || "profil";
  const [tab, setTab] = useState<Tab>(
    getTabs(t).some((x) => x.id === initialTab) ? initialTab : "profil",
  );

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
  const [switching, setSwitching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Unread count
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { count } = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch {}
    })();
  }, [isAuthenticated]);

  // Tab URL'da saqlash
  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    const url = newTab === "profil" ? "/profile" : `/profile?tab=${newTab}`;
    window.history.replaceState(null, "", url);
  };

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

  const isEmployer = (user?.activeRole || user?.role) === "employer";

  const handleSwitchRole = async () => {
    setSwitching(true);
    try {
      await switchRole(isEmployer ? "seeker" : "employer");
      router.push(isEmployer ? "/jobs" : "/jobs/my");
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!hydrated || !user) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24 md:pb-6">
      {/* ═══════ HEADER ═══════ */}
      <div className="rim relative overflow-hidden rounded-3xl glass p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/20 to-transparent blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <AvatarUploader />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {fullName(user)}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              {user.phone || user.email}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={handleSwitchRole}
                disabled={switching}
                title={
                  isEmployer
                    ? "Ish qidiruvchi rejimiga o'tish"
                    : "Ish beruvchi rejimiga o'tish"
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
                  isEmployer
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30",
                  switching && "cursor-wait opacity-60",
                )}
              >
                {switching ? (
                  <Spinner className="h-3 w-3" />
                ) : (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                  </svg>
                )}
                {isEmployer ? "Ish beruvchi" : "Ish qidiruvchi"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ TABLAR ═══════ */}
      <div className="rim overflow-hidden rounded-2xl glass">
        <div
          role="tablist"
          className="flex gap-1 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {getTabs(t).map((tb) => {
            const active = tab === tb.id;
            const isDanger = false;
            return (
              <button
                key={tb.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTabChange(tb.id)}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                  active
                    ? isDanger
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                      : "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : isDanger
                      ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-white/5",
                )}
              >
                {tb.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ KONTENT ═══════ */}

      {/* ─── TAB: Profil ─── */}
      {tab === "profil" && (
        <section className="rim rounded-3xl glass p-6 sm:p-8 animate-fade-in">
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
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                ✓ {profileMsg}
              </div>
            )}
            {profileErr && (
              <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
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
      )}

      {/* ─── TAB: Xavfsizlik ─── */}
      {tab === "xavfsizlik" && (
        <section className="rim rounded-3xl glass p-6 sm:p-8 animate-fade-in">
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
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                ✓ {passwordMsg}
              </div>
            )}
            {passwordErr && (
              <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
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
      )}

      {/* ─── TAB: Faoliyatim ─── */}
      {tab === "faoliyatim" && (
        <div className="space-y-3 animate-fade-in">
          <Link
            href={isEmployer ? "/jobs/my" : "/applications/my"}
            className="rim group flex items-center gap-4 rounded-3xl glass p-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-white">
                {isEmployer ? "Mening vakansiyalarim" : "Mening arizalarim"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                {isEmployer
                  ? "Joylashtirilgan vakansiyalar ro'yxati"
                  : "Yuborilgan arizalar va ularning holati"}
              </p>
            </div>
            <svg
              className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/notifications"
            className="rim group flex items-center gap-4 rounded-3xl glass p-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 dark:text-white">Xabarlar</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                {unreadCount > 0
                  ? `${unreadCount} ta o'qilmagan xabar`
                  : "Yangi vakansiya va ariza bildirishnomalari"}
              </p>
            </div>
            <svg
              className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {!isEmployer && (
            <Link
              href="/resumes/my"
              className="rim group flex items-center gap-4 rounded-3xl glass p-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8M8 17h5" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 dark:text-white">Mening rezyumelarim</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  Rezyumelarni tahrirlash va yangilash
                </p>
              </div>
              <svg
                className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* ─── ROL O'ZGARTIRISH ─── */}
        <div className="rim rounded-3xl glass p-6 sm:p-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Rol o&apos;zgartirish
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isEmployer
                  ? "Ish qidiruvchi rejimiga o'tish"
                  : "Ish beruvchi rejimiga o'tish"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwitchRole}
            disabled={switching}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-100 disabled:opacity-50 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
          >
            {switching ? (
              <>
                <Spinner className="h-4 w-4" />
                O&apos;tilmoqda...
              </>
            ) : (
              <>
                {isEmployer ? "👤 Ish qidiruvchi" : "🏢 Ish beruvchi"}
                {" rejimiga o'tish"}
              </>
            )}
          </button>
        </div>

        {/* ─── CHIQISH ─── */}
        <div className="rim rounded-3xl glass p-6 sm:p-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md shadow-slate-500/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5M21 12H9" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Hisobdan chiqish
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Boshqa akkaunt bilan kirish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
            Chiqish
          </button>
        </div>

        {/* ─── DANGER ZONE (xavfsizlik ichida) ─── */}
      {tab === "xavfsizlik" && (
        <section className="rim rounded-3xl border border-rose-200/60 bg-rose-50/40 p-6 backdrop-blur-xl animate-fade-in dark:border-rose-500/20 dark:bg-rose-500/5 sm:p-8">
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
      )}

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
