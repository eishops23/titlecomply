import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { OfacScreeningResult } from "@/lib/ofac";

export function OfacCertificate({
  result,
  onDownload,
}: {
  result: OfacScreeningResult | null;
  onDownload?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>OFAC Compliance Certificate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {result ? (
          <>
            <p>Certificate ID: {result.certificateId}</p>
            <p>Screened At: {new Date(result.screenedAt).toLocaleString("en-US")}</p>
            <p>Overall Status: {result.overallStatus}</p>
            <p>Parties Screened: {result.parties.length}</p>
            <Button type="button" variant="secondary" onClick={onDownload}>
              Download Certificate
            </Button>
          </>
        ) : (
          <p className="text-muted">Run OFAC screening to generate a compliance certificate.</p>
        )}
      </CardContent>
    </Card>
  );
}
