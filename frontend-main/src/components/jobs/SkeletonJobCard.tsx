export function SkeletonJobCard() {
  return (
    <div className="rim rounded-3xl glass p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="skeleton h-12 w-12 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-3 w-24 rounded-md" />
          <div className="skeleton h-5 w-3/4 rounded-md" />
        </div>
      </div>

      {/* Description */}
      <div className="mt-3 space-y-2">
        <div className="skeleton h-3 w-full rounded-md" />
        <div className="skeleton h-3 w-5/6 rounded-md" />
      </div>

      {/* Tags */}
      <div className="mt-4 flex gap-1.5">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-200/60 pt-3.5 mt-4 dark:border-white/5">
        <div className="skeleton h-5 w-32 rounded-md" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonJobGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <SkeletonJobCard />
        </div>
      ))}
    </div>
  );
}
