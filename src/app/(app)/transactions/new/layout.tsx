import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New transaction",
};

export default function NewTransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
