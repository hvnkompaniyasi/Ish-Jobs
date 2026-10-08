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
  { href: "/jobs", label: "Vakansiyalar" },
  { href: "/resumes", label: "Mutaxassislar" },
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

  const activeRole: UserRole = user?.activeRole || user?.role || "seeker";
  const isEmployer = activeRole === "employer";
  const otherRole: UserRole = isEmployer ? "seeker" : "employer";

  // Tashqariga bosish — menyularni yopish
  useEffect(() => {
    if (!userMenuOpen && !menuOpen) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;

      // User menu
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      // Mobile menu
      if (menuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [userMenuOpen, menuOpen]);

  // Sahifa o'zgarganda menyularni yopish
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
      <div className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 sm:top-4">
        <header className="rim rounded-full border border-white/60 bg-white/70 px-2 py-2 sm:px-5 sm:py-3 shadow-xl shadow-emerald-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-black/50 sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-2 rounded-full pl-1 pr-2 transition">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-black sm:h-10 sm:w-10 sm:text-sm text-white shadow-lg shadow-emerald-500/40 transition group-hover:scale-105 sm:h-10 sm:w-10">
                ij
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" />
              </span>
              <span className="hidden text-base font-black tracking-tight text-slate-900 sm:block dark:text-white">
                ish<span className="text-emerald-600 dark:text-emerald-400">jobs</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 md:flex">
              {navLinks.map((l) => {
                const active = pathname === l.href || pathname.startsWith(l.href + "/");
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
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              {isAuthenticated && <NotificationBell />}

              {isAuthenticated ? (
                <>
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

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/40 transition hover:scale-105"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName || 'Avatar'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials(user?.firstName, user?.lastName)
                      )}
                      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" />
                    </button>

                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl animate-fade-in-up dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/60"
                      >
                        <div className="border-b border-slate-100/80 bg-gradient-to-br from-emerald-50/80 to-white/50 px-4 py-3 dark:border-white/5 dark:from-emerald-950/40 dark:to-zinc-900/50">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {fullName(user)}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                            {user?.phone || user?.email}
                          </p>
                          <span className={cn(
                            "mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            isEmployer
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                          )}>
                            {isEmployer ? (
                              <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="4" y="2" width="16" height="20" rx="2" />
                                  <path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01M9 18h.01M15 18h.01" />
                                </svg>
                                Ish beruvchi
                              </>
                            ) : (
                              <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                Ish qidiruvchi
                              </>
                            )}
                          </span>
                        </div>

                        <div className="p-1.5">
                          <button
                            onClick={handleSwitchRole}
                            disabled={switching}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                          >
                            {isEmployer ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="4" y="2" width="16" height="20" rx="2" />
                                <path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
                              </svg>
                            )}
                            {switching
                              ? "O'tilmoqda..."
                              : isEmployer
                              ? "Ish qidiruvchi rejimiga"
                              : "Ish beruvchi rejimiga"}
                          </button>

                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profil
                          </Link>

                          <div className="my-1 h-px bg-slate-100 dark:bg-white/5" />

                          {isEmployer ? (
                            <>
                              <Link
                                href="/jobs/my"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="16" rx="2" />
                                  <path d="M3 10h18M8 2v4M16 2v4" />
                                </svg>
                                Mening e&apos;lonlarim
                              </Link>
                              <Link
                                href="/jobs/create"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                                Yangi vakansiya
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                href="/resumes/my"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                                </svg>
                                Mening rezyumelarim
                              </Link>
                              <Link
                                href="/applications/my"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="6" width="20" height="14" rx="2" />
                                  <path d="m22 7-10 6L2 7" />
                                </svg>
                                Mening arizalarim
                              </Link>
                            </>
                          )}

                          <div className="my-1 h-px bg-slate-100 dark:bg-white/5" />

                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-white/5"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                            Chiqish
                          </button>
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setDeleteOpen(true);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                            </svg>
                            Hisobni o&apos;chirish
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      Kirish
                    </Button>
                  </Link>
                  <Link href="/register">
                  <Button size="sm" className="rounded-full whitespace-nowrap !px-2.5 !text-xs sm:!px-5 sm:!text-sm">
                    Ro&apos;yxatdan o&apos;tish
                  </Button>
                </Link>
                </>
              )}

              <button
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
            </div>
          </div>
        </header>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            ref={mobileMenuRef}
            className="mt-2 overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-2 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl animate-fade-in-up md:hidden dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/60"
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && isEmployer && (
              <Link
                href="/jobs/my"
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Mening e&apos;lonlarim
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Kirish
              </Link>
            )}
          </div>
        )}
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}
