"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { useToastStore } from "@/lib/toast";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const iconClass = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
} as const;

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-slide-in items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
            role="status"
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconClass[t.type]}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0F172A]">{t.title}</p>
              {t.message ? (
                <p className="mt-0.5 text-xs text-gray-500">{t.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
