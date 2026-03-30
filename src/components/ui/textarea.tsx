"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      maxLength,
      showCount = true,
      id: idProp,
      value,
      defaultValue,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;

    const [internal, setInternal] = React.useState("");
    const isControlled = value !== undefined;
    const length = isControlled
      ? String(value ?? "").length
      : typeof defaultValue === "string"
        ? defaultValue.length
        : internal.length;

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
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            if (!isControlled) setInternal(e.target.value);
            onChange?.(e);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "min-h-[88px] w-full resize-y rounded-md border border-slate-300 bg-surface px-2.5 py-2 text-sm text-foreground shadow-sm",
            "placeholder:text-muted",
            "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
            error && "border-danger focus-visible:border-danger focus-visible:ring-danger",
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-2">
          {error ? (
            <p id={errorId} className="text-xs text-danger" role="alert">
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength !== undefined ? (
            <span className="text-xs tabular-nums text-muted">
              {length}/{maxLength}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
