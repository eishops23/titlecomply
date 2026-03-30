import * as React from "react";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: "h-3 w-3 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: keyof typeof sizeStyles;
};

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-slate-200 border-t-accent",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
