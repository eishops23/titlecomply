"use client";

import * as React from "react";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { AuditTrailTab } from "@/components/transactions/AuditTrailTab";
import { OverviewTab } from "@/components/transactions/OverviewTab";
import { TransactionHeader } from "@/components/transactions/TransactionHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TransactionDetailPayload = Prisma.TransactionGetPayload<{
  include: {
    organization: true;
    entity_detail: true;
    trust_detail: true;
    beneficial_owners: true;
    documents: true;
    filings: true;
    assigned_to: true;
    created_by: true;
  };
}>;

type TabKey = "overview" | "collection" | "documents" | "ofac" | "wires" | "filing" | "audit";

export function TransactionDetail({ transaction }: { transaction: TransactionDetailPayload }) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const extractedCount = transaction.documents.filter((d) => d.extraction_status === "COMPLETED").length;
  const pendingCount = transaction.documents.filter(
    (d) => d.extraction_status === "PENDING" || d.extraction_status === "PROCESSING"
  ).length;
  const latestFiling = transaction.filings[0] ?? null;
  const collectionData =
    transaction.data_collection && typeof transaction.data_collection === "object" && !Array.isArray(transaction.data_collection)
      ? (transaction.data_collection as Record<string, unknown>)
      : {};
  const sellerData =
    collectionData.seller && typeof collectionData.seller === "object"
      ? (collectionData.seller as Record<string, unknown>)
      : null;
  const sellerStatus = sellerData?.name && sellerData?.address ? "Complete" : "Incomplete";

  return (
    <div className="space-y-4 p-6">
      <TransactionHeader transaction={transaction} />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collection">Data Collection</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ofac">OFAC</TabsTrigger>
          <TabsTrigger value="wires">Wires</TabsTrigger>
          <TabsTrigger value="filing">Filing</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab transaction={transaction} />
        </TabsContent>

        <TabsContent value="collection">
          <Card>
            <CardHeader>
              <CardTitle>Data Collection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={transaction.collection_progress} />
              <p className="text-sm text-muted">{Math.round(transaction.collection_progress)} of 100 fields completed</p>
              <p>Entity/Trust: {transaction.entity_detail?.entity_name ?? transaction.trust_detail?.trust_name ?? "Not started"}</p>
              <p>Beneficial owners: {transaction.beneficial_owners.length}</p>
              <p>Seller info: {sellerStatus}</p>
              <Link href={`/transactions/${transaction.id}/collect`} className="text-accent hover:underline">
                Continue Data Collection →
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>{transaction.documents.length} documents uploaded</p>
              <p>
                {extractedCount} extracted, {pendingCount} pending
              </p>
              <Link href={`/transactions/${transaction.id}/documents`} className="text-accent hover:underline">
                Manage Documents →
              </Link>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Extraction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted">
                        No documents uploaded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transaction.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.file_name}</TableCell>
                        <TableCell>{doc.document_type}</TableCell>
                        <TableCell>
                          <Badge variant="screening">{doc.extraction_status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filing">
          <Card>
            <CardHeader>
              <CardTitle>Filing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {latestFiling ? (
                <>
                  <p>Filing ID: {latestFiling.id}</p>
                  <p>Status: {latestFiling.status}</p>
                  <p>Generated: {new Date(latestFiling.created_at).toLocaleDateString("en-US")}</p>
                  {latestFiling.pdf_url ? (
                    <a href={latestFiling.pdf_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Download PDF
                    </a>
                  ) : null}
                  <div>
                    <Link href={`/transactions/${transaction.id}/filing`} className="text-accent hover:underline">
                      View Filing →
                    </Link>
                  </div>
                  <p className="text-sm text-muted">
                    Validation: {latestFiling.validation_errors ? "Has validation issues" : "No validation errors"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted">No filing generated yet.</p>
                  <Link href={`/transactions/${transaction.id}/filing`} className="text-accent hover:underline">
                    Generate Filing →
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ofac">
          <Card>
            <CardHeader>
              <CardTitle>OFAC Screening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">Screen every party against OFAC sanctions and generate a compliance certificate.</p>
              <Link href={`/transactions/${transaction.id}/ofac`} className="mt-2 inline-block text-accent hover:underline">
                Open OFAC Screening →
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wires">
          <Card>
            <CardHeader>
              <CardTitle>Wire Fraud Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">Verify wire instructions, flag risky changes, and collect confirmations before releasing funds.</p>
              <Link href={`/transactions/${transaction.id}/wires`} className="mt-2 inline-block text-accent hover:underline">
                Open Wire Verification →
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrailTab transactionId={transaction.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
