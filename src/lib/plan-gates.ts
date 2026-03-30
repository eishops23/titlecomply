import type { Plan } from "@/generated/prisma/enums";

export type PlanId = Plan;

export interface PlanFeatures {
  transactionsPerMonth: number;
  users: number;
  screening: boolean;
  dataCollection: boolean;
  filingGeneration: boolean;
  auditTrail: boolean;
  ofacScreening: boolean;
  wireFraudPrevention: boolean;
  aiDocExtraction: boolean;
  form1099sReporting: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  multiOffice: boolean;
  whiteLabel: boolean;
  customIntegrations: boolean;
}

export const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  STARTER: {
    transactionsPerMonth: 25,
    users: 2,
    screening: true,
    dataCollection: true,
    filingGeneration: true,
    auditTrail: true,
    ofacScreening: true,
    wireFraudPrevention: true,
    aiDocExtraction: false,
    form1099sReporting: false,
    prioritySupport: false,
    apiAccess: false,
    multiOffice: false,
    whiteLabel: false,
    customIntegrations: false,
  },
  PROFESSIONAL: {
    transactionsPerMonth: 100,
    users: 10,
    screening: true,
    dataCollection: true,
    filingGeneration: true,
    auditTrail: true,
    ofacScreening: true,
    wireFraudPrevention: true,
    aiDocExtraction: true,
    form1099sReporting: true,
    prioritySupport: true,
    apiAccess: false,
    multiOffice: false,
    whiteLabel: false,
    customIntegrations: false,
  },
  ENTERPRISE: {
    transactionsPerMonth: -1,
    users: -1,
    screening: true,
    dataCollection: true,
    filingGeneration: true,
    auditTrail: true,
    ofacScreening: true,
    wireFraudPrevention: true,
    aiDocExtraction: true,
    form1099sReporting: true,
    prioritySupport: true,
    apiAccess: true,
    multiOffice: true,
    whiteLabel: true,
    customIntegrations: true,
  },
  PAY_PER_FILE: {
    transactionsPerMonth: -1,
    users: 1,
    screening: true,
    dataCollection: true,
    filingGeneration: true,
    auditTrail: true,
    ofacScreening: true,
    wireFraudPrevention: true,
    aiDocExtraction: false,
    form1099sReporting: false,
    prioritySupport: false,
    apiAccess: false,
    multiOffice: false,
    whiteLabel: false,
    customIntegrations: false,
  },
};

const PLAN_ORDER: PlanId[] = ["STARTER", "PROFESSIONAL", "ENTERPRISE", "PAY_PER_FILE"];

export function planHasFeature(plan: string, feature: keyof PlanFeatures): boolean {
  const planFeatures = PLAN_FEATURES[plan as PlanId];
  if (!planFeatures) return false;
  const value = planFeatures[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return false;
}

export function getRequiredPlan(feature: keyof PlanFeatures): PlanId {
  for (const plan of PLAN_ORDER) {
    if (planHasFeature(plan, feature)) return plan;
  }
  return "ENTERPRISE";
}

export function getUpgradeMessage(feature: keyof PlanFeatures, currentPlan: string): string {
  const requiredPlan = getRequiredPlan(feature);
  const featureLabels: Partial<Record<keyof PlanFeatures, string>> = {
    aiDocExtraction: "AI Document Extraction",
    form1099sReporting: "1099-S Reporting",
    apiAccess: "API Access",
    multiOffice: "Multi-Office Support",
    whiteLabel: "White-Label",
    customIntegrations: "Custom Integrations",
    prioritySupport: "Priority Support",
  };
  const label = featureLabels[feature] ?? feature;
  return `${label} requires a ${requiredPlan} plan or higher. You are currently on the ${currentPlan} plan. Upgrade in Settings -> Billing.`;
}

export function isPayPerFilePlan(plan: string): boolean {
  return plan === "PAY_PER_FILE";
}

export function getTransactionLimit(plan: string): number {
  const features = PLAN_FEATURES[plan as PlanId];
  if (!features) return 25;
  return features.transactionsPerMonth;
}

export function getUserLimit(plan: string): number {
  const features = PLAN_FEATURES[plan as PlanId];
  if (!features) return 2;
  return features.users;
}
