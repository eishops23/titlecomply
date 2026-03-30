import * as React from "react";
import { cn } from "@/lib/utils";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  showLabel?: boolean;
};

export function Progress({
  className,
  value,
  max = 100,
  showLabel = true,
  ...props
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const rounded = Math.round(pct);

  return (
    <div
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    >
      <div
        className="h-2 w-full overflow-hidden rounded-sm bg-slate-200"
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel ? (
        <span className="text-xs tabular-nums text-muted">{rounded}%</span>
      ) : null}
    </div>
  );
}
