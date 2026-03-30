import type { Metadata } from "next";
import { OfacToolClient } from "./ofac-tool-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free OFAC Screening Tool for Title Companies",
  description:
    "Search OFAC SDN sanctions instantly. Free OFAC screening tool built for title and escrow teams.",
};

export default function PublicOfacToolPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Free OFAC Screening Tool for Title Companies</h1>
      <p className="mt-2 text-muted">
        Enter a name to run an instant OFAC SDN sanctions check.
      </p>
      <OfacToolClient />
      <p className="mt-8 text-sm text-muted">
        Screen all parties in a real estate transaction automatically with TitleComply.
      </p>
      <a href="/sign-up" className="mt-2 inline-block text-accent hover:underline">
        Start your free trial
      </a>
    </div>
  );
}
