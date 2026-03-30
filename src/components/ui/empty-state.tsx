"use client";

import * as React from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const cta =
    action && action.href ? (
      <Link
        href={action.href}
        className={cn(
          "inline-flex h-8 items-center justify-center rounded-md bg-accent px-2.5 text-xs font-medium text-white transition-colors hover:bg-accent/90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {action.label}
      </Link>
    ) : action?.onClick ? (
      <Button type="button" variant="primary" size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center",
        className
      )}
    >
      <div className="text-muted [&>svg]:h-8 [&>svg]:w-8">
        {icon ?? <Inbox aria-hidden />}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-sm text-xs leading-relaxed text-muted">{description}</p>
      ) : null}
      {cta}
    </div>
  );
}
