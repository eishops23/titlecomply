"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const variantStyles = {
  primary:
    "bg-accent text-white hover:bg-accent/90 focus-visible:ring-accent/40 disabled:bg-accent/50",
  secondary:
    "border border-slate-300 bg-surface text-foreground hover:bg-slate-50 focus-visible:ring-slate-400/30 disabled:opacity-50",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/40 disabled:bg-danger/50",
  ghost:
    "bg-transparent text-foreground hover:bg-slate-100 focus-visible:ring-slate-400/30 disabled:opacity-50",
} as const;

const sizeStyles = {
  sm: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
  md: "h-9 px-3 text-sm gap-2 rounded-md",
  lg: "h-10 px-4 text-sm gap-2 rounded-md",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled ?? loading}
        aria-busy={loading}
        className={cn(
          "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={size === "lg" ? "md" : "sm"} className="shrink-0" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
