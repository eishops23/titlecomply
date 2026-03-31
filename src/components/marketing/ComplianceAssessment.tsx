"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

type Question = {
  id: "closings" | "entity" | "cash" | "process";
  text: string;
  options: string[];
};

const questions: Question[] = [
  {
    id: "closings",
    text: "1. How many closings does your company handle monthly?",
    options: ["Under 10", "10-25", "25-50", "50+"],
  },
  {
    id: "entity",
    text: "2. What % involve an LLC, trust, or corp buyer?",
    options: ["Under 10%", "10-30%", "30-60%", "60%+"],
  },
  {
    id: "cash",
    text: "3. What % are non-financed (cash/wire)?",
    options: ["Under 5%", "5-15%", "15-30%", "30%+"],
  },
  {
    id: "process",
    text: "4. Do you have a FinCEN filing process in place?",
    options: ["Yes, automated", "Yes, manual", "No"],
  },
];

type AssessmentResult = {
  riskLevel: RiskLevel;
  fincenTransactions: number;
  penaltyExposure: number;
  manualHours: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const riskStyles: Record<RiskLevel, string> = {
  CRITICAL: "bg-red-50 border-red-200 text-red-800",
  HIGH: "bg-orange-50 border-orange-200 text-orange-800",
  MEDIUM: "bg-amber-50 border-amber-200 text-amber-800",
  LOW: "bg-green-50 border-green-200 text-green-800",
};

export function ComplianceAssessment() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const isComplete = useMemo(
    () => questions.every((q) => answers[q.id] !== undefined),
    [answers],
  );

  const setAnswer = (questionId: Question["id"], optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const assessRisk = () => {
    if (!isComplete) {
      return;
    }

    const closingsAnswer = answers.closings;
    const entityAnswer = answers.entity;
    const cashAnswer = answers.cash;
    const processAnswer = answers.process;

    const closingsPerMonth = [5, 17, 37, 75][closingsAnswer];
    const entityPercent = [5, 20, 45, 75][entityAnswer] / 100;
    const cashPercent = [2.5, 10, 22, 40][cashAnswer] / 100;
    const fincenTransactions = Math.round(
      closingsPerMonth * entityPercent * cashPercent,
    );
    const penaltyExposure = fincenTransactions * 50000;
    const manualHours = fincenTransactions * 3;

    const riskLevel: RiskLevel =
      processAnswer === 0
        ? "LOW"
        : processAnswer === 1 && fincenTransactions > 5
          ? "MEDIUM"
          : fincenTransactions > 10
            ? "CRITICAL"
            : fincenTransactions > 3
              ? "HIGH"
              : "MEDIUM";

    setResult({
      riskLevel,
      fincenTransactions,
      penaltyExposure,
      manualHours,
    });
  };

  return (
    <section className="bg-gray-50/50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
          How Exposed Is Your Title Company?
        </h2>
        <p className="mt-4 text-center text-lg text-gray-500">
          Answer 4 questions to assess your FinCEN compliance risk.
        </p>

        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          {questions.map((question) => (
            <div key={question.id} className="mb-7 last:mb-0">
              <p className="mb-4 text-base font-medium text-[#0F172A]">
                {question.text}
              </p>
              <div className="flex flex-wrap gap-3">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[question.id] === optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswer(question.id, optionIndex)}
                      className={`rounded-lg border px-4 py-2.5 text-sm transition-all ${
                        selected
                          ? "border-[#2563EB] bg-blue-50 font-medium text-[#2563EB]"
                          : "cursor-pointer border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={assessRisk}
            className="mt-8 w-full rounded-lg bg-[#2563EB] px-8 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isComplete}
          >
            Assess My Risk
          </button>
        </div>

        {result ? (
          <div
            className={`mx-auto mt-8 max-w-2xl rounded-xl border-2 p-8 ${riskStyles[result.riskLevel]}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-bold">
              <AlertTriangle className="h-4 w-4" />
              {result.riskLevel} RISK
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Based on your answers, your company likely has around{" "}
              <span className="font-bold">{result.fincenTransactions}</span>{" "}
              FinCEN-reportable transactions per month, with{" "}
              <span className="font-bold">
                {formatCurrency(result.penaltyExposure)}
              </span>{" "}
              in potential penalty exposure.
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              That is approximately{" "}
              <span className="font-bold">{result.manualHours} manual hours</span>{" "}
              per month if you rely on manual filing workflows.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">{result.fincenTransactions}</p>
                <p className="text-xs text-gray-500">FinCEN transactions/month</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(result.penaltyExposure)}
                </p>
                <p className="text-xs text-gray-500">Penalty exposure</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{result.manualHours}h</p>
                <p className="text-xs text-gray-500">Manual hours/month</p>
              </div>
            </div>

            <Link
              href="/sign-up"
              className="mt-6 block w-full rounded-lg bg-[#2563EB] px-6 py-3 text-center font-semibold text-white"
            >
              Start Free Trial - Automate Your Compliance →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
