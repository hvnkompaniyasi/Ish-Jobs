"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { DeleteAccountModal } from "@/components/auth/DeleteAccountModal";
import { cn, initials, fullName } from "@/lib/utils";
import type { UserRole } from "@/types";

const navLinks = [
  { href: "/jobs", label: "Vakansiyalar", exact: true },
  { href: "/jobs/map", label: "Xarita", exact: true },
  { href: "/resumes", label: "Mutaxassislar" },
  { href: "/applications", label: "Arizalar", auth: true },
  { href: "/dashboard", label: "Boshqaruv", auth: true },
];

export function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const activeRole: UserRole = user?.activeRole || user?.role || "seeker";
  const isEmployer = activeRole === "employer";
  const otherRole: UserRole = isEmployer ? "seeker" : "employer";

  // Tashqariga bosish
  useEffect(() => {
    if (!userMenuOpen && !menuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (
        menuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !mobileToggleRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen, menuOpen]);

  // Sahifa o'zgarganda yopish
  useEffect(() => {
    setUserMenuOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  const handleSwitchRole = async () => {
    setSwitching(true);
    try {
      await switchRole(otherRole);
      setUserMenuOpen(false);
      router.push(isEmployer ? "/jobs" : "/jobs/my");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 top-3 z-50 mx-auto max-w-5xl px-3 sm:top-4 sm:px-4">
        <header className="rim rounded-full border border-white/60 bg-white/70 px-2.5 py-2 shadow-xl shadow-emerald-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-black/50 sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-1 sm:gap-2">

            {/* ═══════ Logo ═══════ */}
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5 rounded-full pl-1 pr-2 transition"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-500/40 transition group-hover:scale-105 sm:h-10 sm:w-10">
                ij
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" />
              </span>
              <span className="hidden text-base font-black tracking-tight text-slate-900 sm:block dark:text-white">
                ish<span className="text-emerald-600 dark:text-emerald-400">jobs</span>
              </span>
            </Link>

            {/* ═══════ Desktop nav ═══════ */}
            <nav className="hidden items-center gap-0.5 md:flex">
              {navLinks
                .filter((l) => !(l as { auth?: boolean }).auth || isAuthenticated)
                .map((l) => {
                const active = pathname === l.href || (!(l as { exact?: boolean }).exact && pathname.startsWith(l.href + "/"));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-semibold transition",
                      active
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    {l.label}
                    {active && (
                      <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                    )}
                  </Link>
                );
              })}

              {isAuthenticated && isEmployer && (
                <>
                  <Link
                    href="/jobs/my"
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-semibold transition",
                      pathname === "/jobs/my"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    Mening e&apos;lonlarim
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-semibold transition",
                      pathname === "/dashboard"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </nav>

            {/* ═══════ Right side ═══════ */}
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  {/* Notification — desktop */}
                  <div className="hidden md:block">
                    <NotificationBell />
                  </div>

                  {/* Employer Vakansiya tugmasi — desktop */}
                  {isEmployer && (
                    <Link href="/jobs/create" className="hidden sm:block">
                      <Button size="sm" className="rounded-full">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Vakansiya
                      </Button>
                    </Link>
                  )}

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/40 transition hover:scale-105"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName || "Avatar"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials(user?.firstName, user?.lastName)
                      )}
                      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl animate-fade-in-up dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-black/60">
                        {/* User info */}
                        <div className="border-b border-slate-100/80 bg-gradient-to-br from-emerald-50/80 to-white/50 px-4 py-3 dark:border-white/5 dark:from-emerald-950/40 dark:to-zinc-900/50">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {fullName(user)}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                            {user?.phone || user?.email}
                          </p>
                          <span className={cn(
                            "mt-1.5 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            isEmployer
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                          )}>
                            {isEmployer ? "🏢 Ish beruvchi" : "👤 Ish qidiruvchi"}
                          </span>
                        </div>

                        <div className="p-1.5">
                          {/* Switch role */}
                          <button
                            onClick={handleSwitchRole}
                            disabled={switching}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                          >
                            <span className="text-base">{isEmployer ? "👤" : "🏢"}</span>
                            {switching
                              ? "O'tilmoqda..."
                              : isEmployer
                              ? "Ish qidiruvchi rejimiga"
                              : "Ish beruvchi rejimiga"}
                          </button>

                          <div className="my-1 h-px bg-slate-100 dark:bg-white/5" />

                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                          >
                            👤 Profil
                          </Link>
                          <Link
                            href="/notifications"
                            onClick={() => setUserMenuOpen(false)}
                            className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                          >
                            🔔 Xabarnomalar
                          </Link>

                          {isEmployer ? (
                            <>
                              <Link
                                href="/jobs/my"
                                onClick={() => setUserMenuOpen(false)}
                                className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                📋 Mening e&apos;lonlarim
                              </Link>
                              <Link
                                href="/dashboard"
                                onClick={() => setUserMenuOpen(false)}
                                className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                📊 Dashboard
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                href="/resumes/my"
                                onClick={() => setUserMenuOpen(false)}
                                className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                📄 Mening rezyumelarim
                              </Link>
                              <Link
                                href="/applications/my"
                                onClick={() => setUserMenuOpen(false)}
                                className="block rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                📬 Mening arizalarim
                              </Link>
                            </>
                          )}

                          <div className="my-1 h-px bg-slate-100 dark:bg-white/5" />

                          <button
                            onClick={handleLogout}
                            className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                          >
                            🚪 Chiqish
                          </button>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setDeleteOpen(true);
                            }}
                            className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            🗑️ Hisobni o&apos;chirish
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Guest — faqat desktop */}
                  <div className="hidden items-center gap-2 md:flex">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        Kirish
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="rounded-full">
                        Ro&apos;yxatdan o&apos;tish
                      </Button>
                    </Link>
                  </div>
                </>
              )}

              {/* Hamburger — faqat guest mobilda */}
              {!isAuthenticated && (
                <button
                  ref={mobileToggleRef}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white/60 md:hidden dark:text-zinc-300 dark:hover:bg-white/5"
                  aria-label="Menu"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {menuOpen ? (
                      <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ═══════ Mobile dropdown (faqat guest) ═══════ */}
        {menuOpen && !isAuthenticated && (
          <div
            ref={mobileMenuRef}
            className="mt-2 overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-2 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl animate-fade-in-up md:hidden dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/60"
          >
            {navLinks
              .filter((l) => !(l as { auth?: boolean }).auth || isAuthenticated)
              .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-slate-100 dark:bg-white/5" />
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="block rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </div>
        )}
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}
