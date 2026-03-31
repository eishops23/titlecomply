import { CheckCircle2 } from "lucide-react";

const features = [
  "AES-256-GCM encryption",
  "SHA-256 hash chain audit",
  "Claude AI document extraction",
  "OFAC SDN list screening",
  "Wire fraud detection",
  "Role-based access control",
  "Automated compliance alerts",
  "PDF filing generation",
];

export function EnterpriseProof() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-5 md:items-start">
        <div className="md:col-span-3">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
            Enterprise-Grade Compliance Infrastructure
          </h2>
          <p className="mt-4 leading-relaxed text-gray-500">
            TitleComply is not a form builder. It is a complete compliance
            automation platform with encrypted data handling, hash-chain audit
            trails, and AI-powered document extraction.
          </p>
          <div className="mt-8 space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#059669]" />
                <span className="text-sm font-medium text-[#0F172A]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl bg-[#0F172A] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-500">
                titlecomply - security architecture
              </span>
            </div>
            <pre className="overflow-x-auto text-xs leading-relaxed">
              <span className="text-blue-400">AES-256-GCM Encryption</span>
              {"\n"}
              <span className="text-gray-600"> |-</span>{" "}
              <span className="text-gray-400">SSN/EIN fields</span>{" "}
              <span className="text-amber-400">-&gt; enc:v1:iv:ciphertext:tag</span>
              {"\n"}
              <span className="text-gray-600"> |-</span>{" "}
              <span className="text-gray-400">Per-field encryption</span>{" "}
              <span className="text-green-400">enabled</span>
              {"\n"}
              <span className="text-gray-600"> `-</span>{" "}
              <span className="text-gray-400">Key derivation</span>{" "}
              <span className="text-green-400">HKDF-SHA256</span>
              {"\n\n"}
              <span className="text-blue-400">SHA-256 Hash Chain Audit</span>
              {"\n"}
              <span className="text-gray-600"> |-</span>{" "}
              <span className="text-gray-400">Previous hash</span>{" "}
              <span className="text-purple-400">a3f2c1...</span>
              {"\n"}
              <span className="text-gray-600"> |-</span>{" "}
              <span className="text-gray-400">Action: filing.generated</span>
              {"\n"}
              <span className="text-gray-600"> `-</span>{" "}
              <span className="text-gray-400">Current hash</span>{" "}
              <span className="text-purple-400">7b9e4d...</span>{" "}
              <span className="text-green-400">chain valid</span>
              {"\n\n"}
              <span className="text-blue-400">OFAC SDN Screening</span>
              {"\n"}
              <span className="text-gray-600"> |-</span>{" "}
              <span className="text-gray-400">Buyer entity</span>{" "}
              <span className="text-green-400">CLEAR</span>
              {"\n"}
              <span className="text-gray-600"> |-</span>{" "}
              <span className="text-gray-400">Beneficial owner 1</span>{" "}
              <span className="text-green-400">CLEAR</span>
              {"\n"}
              <span className="text-gray-600"> |-</span>{" "}
              <span className="text-gray-400">Beneficial owner 2</span>{" "}
              <span className="text-green-400">CLEAR</span>
              {"\n"}
              <span className="text-gray-600"> `-</span>{" "}
              <span className="text-gray-400">Seller</span>{" "}
              <span className="text-green-400">CLEAR</span>
              {"\n"}
              <span className="text-gray-500">Certificate: OFAC-2026-A7B3C1D9</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
