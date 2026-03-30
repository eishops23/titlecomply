import * as React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-slate-400",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  accent: "bg-accent",
  muted: "bg-muted",
} as const;

export type StatusDotProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variantStyles;
};

export function StatusDot({
  className,
  variant = "default",
  ...props
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
