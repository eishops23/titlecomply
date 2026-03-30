"use client";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { OfacScreeningResult } from "@/lib/ofac";

const statusTone: Record<string, "filed" | "screening" | "rejected"> = {
  CLEAR: "filed",
  POTENTIAL_MATCH: "screening",
  MATCH: "rejected",
  ERROR: "screening",
};

export function OfacResults({ result }: { result: OfacScreeningResult | null }) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OFAC Results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted">No OFAC screening run yet.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>OFAC Screening Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.parties.map((party) => (
          <div key={`${party.partyRole}-${party.partyName}`} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{party.partyName}</p>
              <Badge variant={statusTone[party.status] || "screening"}>{party.status}</Badge>
            </div>
            <p className="text-xs text-muted">Role: {party.partyRole.replace("_", " ")}</p>
            {party.matches.length > 0 ? (
              <div className="mt-2 space-y-1 text-xs">
                {party.matches.slice(0, 3).map((match) => (
                  <div key={`${match.uid}-${match.sdnName}`} className="rounded bg-slate-50 px-2 py-1">
                    {match.sdnName} ({match.sdnType}) - Score {match.score}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
