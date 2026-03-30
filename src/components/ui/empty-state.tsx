"use client";

import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
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
      {action ? (
        <Button type="button" variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
