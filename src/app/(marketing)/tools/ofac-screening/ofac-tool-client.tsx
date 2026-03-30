"use client";

import { useState } from "react";

type Match = { sdnName: string; score: number; programs: string[] };

export function OfacToolClient() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ofac/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? "Search failed");
      return;
    }
    setStatus(body.status as string);
    setMatches((body.matches ?? []) as Match[]);
  }

  return (
    <>
      <form className="mt-6 space-y-3" onSubmit={submit}>
        <input
          name="name"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Full name or entity name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="rounded-md bg-primary px-4 py-2 text-white" type="submit" disabled={loading}>
          {loading ? "Screening..." : "Screen Name"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {status ? (
        <div className="mt-4 rounded-md border border-slate-200 p-4">
          <p className="font-semibold">Status: {status}</p>
          {matches.slice(0, 5).map((m, idx) => (
            <p key={`${m.sdnName}-${idx}`} className="mt-1 text-sm text-muted">
              {m.sdnName} - Score {m.score} {m.programs.length ? `(${m.programs.join(", ")})` : ""}
            </p>
          ))}
        </div>
      ) : null}
    </>
  );
}
