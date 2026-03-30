import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Form1099SData } from "@/lib/form-1099s";

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica", fontSize: 10, color: "#0F172A" },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#475569", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12, marginBottom: 8 },
  box: { borderWidth: 1, borderColor: "#CBD5E1", padding: 8, flex: 1, minHeight: 88 },
  boxTitle: { fontSize: 9, color: "#334155", marginBottom: 4, fontFamily: "Helvetica-Bold" },
  bodyRow: { marginBottom: 6 },
  bodyLabel: { fontSize: 9, color: "#334155", fontFamily: "Helvetica-Bold" },
  bodyValue: { fontSize: 10 },
  footer: { marginTop: 14, fontSize: 9, color: "#334155" },
});

function Form1099SPdf({ data }: { data: Form1099SData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Form 1099-S - Proceeds From Real Estate Transactions</Text>
        <Text style={styles.subtitle}>Tax Year {data.taxYear}</Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Filer</Text>
            <Text>{data.filerName}</Text>
            <Text>EIN: {data.filerEin}</Text>
            <Text>{data.filerAddress}</Text>
            <Text>{`${data.filerCity}, ${data.filerState} ${data.filerZip}`}</Text>
            <Text>{data.filerPhone}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Transferor</Text>
            <Text>{data.transferorName}</Text>
            <Text>SSN/TIN: {data.transferorSsn}</Text>
            <Text>{data.transferorAddress}</Text>
            <Text>{`${data.transferorCity}, ${data.transferorState} ${data.transferorZip}`}</Text>
          </View>
        </View>

        <View style={styles.bodyRow}>
          <Text style={styles.bodyLabel}>Date of Closing</Text>
          <Text style={styles.bodyValue}>{data.dateOfClosing}</Text>
        </View>
        <View style={styles.bodyRow}>
          <Text style={styles.bodyLabel}>Gross Proceeds</Text>
          <Text style={styles.bodyValue}>${data.grossProceeds.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.bodyRow}>
          <Text style={styles.bodyLabel}>Property Address</Text>
          <Text style={styles.bodyValue}>{data.propertyAddress}</Text>
        </View>
        <View style={styles.bodyRow}>
          <Text style={styles.bodyLabel}>Box 4: Buyer received property</Text>
          <Text style={styles.bodyValue}>{data.buyerReceivedProperty ? "Yes" : "No"}</Text>
        </View>
        <View style={styles.bodyRow}>
          <Text style={styles.bodyLabel}>Box 5: Foreign person</Text>
          <Text style={styles.bodyValue}>{data.foreignPerson ? "Yes" : "No"}</Text>
        </View>

        <Text style={styles.footer}>
          This is important tax information and is being furnished to the IRS.
        </Text>
      </Page>
    </Document>
  );
}

export async function generate1099SPdf(data: Form1099SData): Promise<Buffer> {
  const buffer = await renderToBuffer(<Form1099SPdf data={data} />);
  return Buffer.from(buffer);
}
