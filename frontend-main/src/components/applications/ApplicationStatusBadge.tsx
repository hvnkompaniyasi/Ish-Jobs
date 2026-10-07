import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUS_COLORS,
  statusLabel,
} from "@/lib/applicationStatus";
import type { ApplicationStatus } from "@/types";

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  const c = APPLICATION_STATUS_COLORS[status];
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        c.bg,
        c.text,
        c.border,
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
