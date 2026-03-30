import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { WireInstruction } from "@/lib/wire-fraud";

const tone: Record<string, "rejected" | "screening"> = {
  critical: "rejected",
  high: "rejected",
  medium: "screening",
  low: "screening",
};

export function WireVerification({ wire }: { wire: WireInstruction | null }) {
  if (!wire) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted">No wire instructions submitted yet.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">Status: {wire.verificationStatus.toUpperCase()}</p>
        {wire.flags.map((flag, i) => (
          <div key={`${flag.type}-${i}`} className="rounded-md border border-slate-200 p-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{flag.type.replaceAll("_", " ")}</p>
              <Badge variant={tone[flag.severity] || "screening"}>{flag.severity}</Badge>
            </div>
            <p className="text-xs text-muted">{flag.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
