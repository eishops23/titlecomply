"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  info: "border-blue-200 bg-blue-50 text-blue-950 [&>svg]:text-blue-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600",
  warning: "border-amber-200 bg-amber-50 text-amber-950 [&>svg]:text-amber-600",
  error: "border-red-200 bg-red-50 text-red-950 [&>svg]:text-red-600",
} as const;

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variantStyles;
  dismissible?: boolean;
  onDismiss?: () => void;
  title?: string;
};

export function Alert({
  className,
  variant = "info",
  dismissible = false,
  onDismiss,
  title,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative rounded-md border px-3 py-2 text-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dismissible ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2 right-2 rounded p-0.5 text-current opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:outline-none"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      <div className={cn(dismissible && "pr-7")}>
        {title ? (
          <p className="mb-0.5 text-sm font-semibold">{title}</p>
        ) : null}
        <div className="text-sm leading-snug">{children}</div>
      </div>
    </div>
  );
}
