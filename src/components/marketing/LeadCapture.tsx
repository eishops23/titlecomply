"use client";

import { FormEvent, useState } from "react";
import { Check, Download } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email.");

export function LeadCapture() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: parsed.data, source: "checklist" }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSuccess(true);

      const link = document.createElement("a");
      link.href = "/downloads/fincen-compliance-checklist.pdf";
      link.download = "fincen-compliance-checklist.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError("Could not submit right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#2563EB] py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <Download className="mx-auto mb-4 h-10 w-10 text-white/80" />
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          FinCEN Compliance Checklist for Title Companies
        </h2>
        <p className="mt-3 text-base leading-relaxed text-blue-100">
          22 items every title company needs to verify before their next
          cash-to-entity closing. Stay compliant.
        </p>

        {success ? (
          <p className="mt-8 rounded-xl bg-white/10 px-6 py-4 text-sm font-medium text-white">
            ✅ Check your inbox! Downloading now...
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg border-0 px-4 py-3 text-sm text-[#0F172A] placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="whitespace-nowrap rounded-lg bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? "Submitting..." : "Download Free Checklist"}
            </button>
          </form>
        )}

        {error ? <p className="mt-3 text-sm text-red-100">{error}</p> : null}

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-blue-200">
          <span className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            No spam
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            Unsubscribe anytime
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            Used by 200+ closers
          </span>
        </div>
      </div>
    </section>
  );
}
