"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  closeOnOverlay?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  bodyClassName,
  closeOnOverlay = true,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-[10vh]">
      {closeOnOverlay ? (
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/40"
          aria-label="Close dialog"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/40" aria-hidden />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative z-10 flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col rounded-md border border-slate-200 bg-surface shadow-lg",
          className
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          {title ? (
            <h2 id="modal-title" className="text-sm font-semibold text-foreground">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-slate-100 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm text-foreground",
            bodyClassName
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
