import type { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with TitleComply. Request a demo, ask a question, or get technical support for FinCEN compliance automation.",
  alternates: { canonical: "https://titlecomply.com/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
