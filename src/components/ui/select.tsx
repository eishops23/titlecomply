"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      placeholder,
      options,
      id: idProp,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const errorId = `${id}-error`;

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
        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "h-9 w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-surface py-1.5 pr-8 pl-2.5 text-sm text-foreground shadow-sm",
              "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
              !props.value && placeholder && "text-muted",
              error && "border-danger focus-visible:border-danger focus-visible:ring-danger",
              className
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            ) : null}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
