"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.068 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          An unexpected error occurred. Our team has been notified. Please try
          again or contact support if the issue persists.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-gray-400">
            Error ID: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
