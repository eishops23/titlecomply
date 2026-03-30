import * as React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  screening: "bg-slate-100 text-slate-700 ring-slate-200",
  collecting: "bg-blue-50 text-blue-800 ring-blue-200",
  validating: "bg-amber-50 text-amber-900 ring-amber-200",
  filed: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  rejected: "bg-red-50 text-red-800 ring-red-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-300",
} as const;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variantStyles;
};

export function Badge({
  className,
  variant = "screening",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-max items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
