export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Orb 1 — Emerald (top left) — pulsatsiya */}
      <div className="orb-1 orb-pulse absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/25 via-emerald-400/10 to-transparent blur-[140px] dark:from-emerald-500/20" />

      {/* Orb 2 — Teal (bottom right) — pulsatsiya */}
      <div className="orb-2 orb-pulse absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-teal-500/20 via-cyan-400/10 to-transparent blur-[150px] dark:from-teal-500/15" />

      {/* Orb 3 — Subtle emerald (center) — pulsatsiya */}
      <div className="orb-3 orb-pulse absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/10 to-transparent blur-[130px] dark:from-emerald-400/8" />

      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,9,14,0.6)_100%)]" />
    </div>
  );
}
