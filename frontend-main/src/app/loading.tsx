import { SkeletonJobGrid } from "@/components/jobs/SkeletonJobCard";

export default function Loading() {
  return (
    <div className="space-y-12 py-6">
      {/* Hero skeleton */}
      <div className="rim rounded-[2rem] glass p-6 sm:p-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="skeleton mx-auto h-10 w-3/4 rounded-2xl" />
          <div className="skeleton mx-auto h-4 w-1/2 rounded-lg" />
          <div className="skeleton mx-auto h-14 w-full rounded-2xl" />
          <div className="flex justify-center gap-2">
            <div className="skeleton h-8 w-24 rounded-full" />
            <div className="skeleton h-8 w-24 rounded-full" />
            <div className="skeleton h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Jobs skeleton */}
      <SkeletonJobGrid count={6} />
    </div>
  );
}
