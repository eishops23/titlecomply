"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const inputVariants = {
  text: "text",
  email: "email",
  password: "password",
  number: "number",
  date: "date",
  tel: "tel",
} as const;

export type InputVariant = keyof typeof inputVariants;

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  id?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = "text",
      id: idProp,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const type = inputVariants[variant];

    return (
      <div className="flex w-full flex-col gap-1">
        {label ? (
          <label
            htmlFor={id}
            className="text-xs font-medium text-foreground"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error ? errorId : null, helperText ? helperId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={cn(
            "h-9 w-full min-w-0 rounded-md border border-slate-300 bg-surface px-2.5 py-1.5 text-sm text-foreground shadow-sm",
            "placeholder:text-muted",
            "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
            error && "border-danger focus-visible:border-danger focus-visible:ring-danger",
            className
          )}
          {...props}
        />
        {helperText && !error ? (
          <p id={helperId} className="text-xs text-muted">
            {helperText}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
