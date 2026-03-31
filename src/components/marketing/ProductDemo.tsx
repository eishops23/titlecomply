"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const tabs = [
  "Screening",
  "Data Collection",
  "AI Extraction",
  "Filing",
  "Dashboard",
] as const;
type Tab = (typeof tabs)[number];

function ScreeningMockup() {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className="h-3 w-3 rounded-full bg-red-400" />
        <div className="h-3 w-3 rounded-full bg-amber-400" />
        <div className="h-3 w-3 rounded-full bg-green-400" />
        <div className="ml-2 text-xs text-gray-400">
          titlecomply.com/transactions/new
        </div>
      </div>
      <div className="mb-2 text-sm text-gray-500">Screening Result</div>
      <div className="rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="font-semibold text-red-700">Filing Required</span>
        </div>
        <p className="mt-1 text-sm text-red-600">
          This non-financed LLC purchase requires a FinCEN Real Estate Report
          filing.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        {[
          ["Property", "123 Ocean Drive, Boca Raton, FL"],
          ["Buyer", "Oceanview Holdings LLC"],
          ["Purchase Price", "$1,250,000"],
          ["Financing", "Cash / Wire"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-gray-50 p-3">
            <div className="text-gray-500">{label}</div>
            <div className="font-medium text-gray-900">{value}</div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        Start Data Collection →
      </button>
    </div>
  );
}

function DataCollectionMockup() {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-[#0F172A]">Collection Progress</p>
        <p className="text-sm font-semibold text-[#2563EB]">72%</p>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className="h-2 w-[72%] rounded-full bg-[#2563EB]" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg bg-green-50 px-3 py-1.5 text-green-700">
          ✓ Entity
        </span>
        <span className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-white">
          Beneficial Owners
        </span>
        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-500">
          Seller
        </span>
        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-500">
          Settlement Agent
        </span>
      </div>
      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="mb-3 text-sm font-semibold text-[#0F172A]">
          Beneficial Owner 1
        </p>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-lg bg-white p-3">
            <div className="text-gray-500">Full Name</div>
            <div className="font-medium text-gray-900">Maria Rodriguez</div>
          </div>
          <div className="rounded-lg bg-white p-3">
            <div className="text-gray-500">Date of Birth</div>
            <div className="font-medium text-gray-900">04/12/1985</div>
          </div>
          <div className="rounded-lg bg-white p-3">
            <div className="text-gray-500">SSN</div>
            <div className="font-medium text-gray-900">***-**-4421</div>
          </div>
          <div className="rounded-lg bg-white p-3">
            <div className="text-gray-500">Ownership %</div>
            <div className="font-medium text-gray-900">55%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtractionMockup() {
  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#0F172A]">AI Extraction Review</p>
        <button
          type="button"
          className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Apply All
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-[#0F172A]">
            Extracted from Operating Agreement
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex items-center justify-between">
              <span className="text-gray-500">Entity Name</span>
              <span className="font-medium text-gray-900">Oceanview Holdings LLC</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-gray-500">EIN</span>
              <span className="font-medium text-gray-900">87-9123456</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-gray-500">Formation State</span>
              <span className="font-medium text-gray-900">Florida</span>
            </p>
            <p className="rounded-lg bg-white px-3 py-2 text-gray-700">
              Members: Maria Rodriguez (55%), Liam Chen (45%)
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-sm font-semibold text-[#0F172A]">Current Form</p>
          <div className="mt-3 space-y-2 text-sm">
            {["Entity Name", "EIN", "Formation State", "Beneficial Owners"].map(
              (field) => (
                <div
                  key={field}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="text-gray-600">{field}</span>
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    99% confidence
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilingMockup() {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <p className="text-sm font-semibold text-green-700">✅ All 23 checks passed</p>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-gray-500">Filing ID</div>
          <div className="font-medium text-gray-900">TC-2026-A1B2C3D4</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-gray-500">Status</div>
          <div className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 font-medium text-[#2563EB]">
            Generated
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-gray-500">Generated Date</div>
          <div className="font-medium text-gray-900">Mar 30, 2026</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-gray-500">Property Address</div>
          <div className="font-medium text-gray-900">123 Ocean Drive, Boca Raton, FL</div>
        </div>
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white"
      >
        Download PDF
      </button>
      <div className="mt-6 grid grid-cols-5 gap-2 text-center text-xs">
        {["Draft", "Validated", "Generated", "Filed", "Accepted"].map((step) => (
          <div
            key={step}
            className={`rounded-lg px-2 py-2 ${
              step === "Generated"
                ? "bg-blue-50 font-semibold text-[#2563EB]"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className="h-3 w-3 rounded-full bg-red-400" />
        <div className="h-3 w-3 rounded-full bg-amber-400" />
        <div className="h-3 w-3 rounded-full bg-green-400" />
        <div className="ml-2 text-xs text-gray-400">titlecomply.com/dashboard</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        {[
          ["Active Transactions", "12"],
          ["Filings This Month", "8"],
          ["Overdue", "1"],
          ["Compliance Score", "94%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-[#0F172A]">Pipeline</p>
        <div className="mt-3 space-y-2">
          {[
            ["Screening", 3],
            ["Collecting", 4],
            ["Validating", 2],
            ["Ready to File", 2],
            ["Filed", 1],
          ].map(([stage, count]) => (
            <div key={stage as string}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-gray-500">{stage as string}</span>
                <span className="font-semibold text-[#0F172A]">{count as number}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white">
                <div
                  className="h-2 rounded-full bg-[#2563EB]"
                  style={{ width: `${Math.max((count as number) * 20, 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
        <p className="text-xs font-semibold text-orange-800">Filing Overdue - TC-2026-047</p>
        <p className="mt-1 text-xs text-orange-700">
          Closing packet complete, but filing has not been generated. Deadline risk: high.
        </p>
      </div>
    </div>
  );
}

export function ProductDemo() {
  const [activeTab, setActiveTab] = useState<Tab>("Screening");

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
          See TitleComply in Action
        </h2>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-[#2563EB] text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-[#0F172A] p-2 shadow-inner md:p-4">
          <div className="transition-all duration-300">
            {activeTab === "Screening" ? <ScreeningMockup /> : null}
            {activeTab === "Data Collection" ? <DataCollectionMockup /> : null}
            {activeTab === "AI Extraction" ? <ExtractionMockup /> : null}
            {activeTab === "Filing" ? <FilingMockup /> : null}
            {activeTab === "Dashboard" ? <DashboardMockup /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
