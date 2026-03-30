import type { Plan } from "@/generated/prisma/enums";

export const APP_NAME = "TitleComply";

export type PlanId = Plan;

export type PlanDefinition = {
  id: PlanId;
  label: string;
  monthlyPriceUsd: number | null;
  monthlyTransactionLimit: number | null;
  userLimit: number | null;
  features: {
    aiDocExtraction: boolean;
    apiAccess: boolean;
    multiOffice: boolean;
    whiteLabel: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  STARTER: {
    id: "STARTER",
    label: "Starter",
    monthlyPriceUsd: 199,
    monthlyTransactionLimit: 25,
    userLimit: 2,
    features: {
      aiDocExtraction: false,
      apiAccess: false,
      multiOffice: false,
      whiteLabel: false,
      prioritySupport: false,
      customIntegrations: false,
    },
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    label: "Professional",
    monthlyPriceUsd: 499,
    monthlyTransactionLimit: 100,
    userLimit: 10,
    features: {
      aiDocExtraction: true,
      apiAccess: false,
      multiOffice: false,
      whiteLabel: false,
      prioritySupport: true,
      customIntegrations: false,
    },
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    label: "Enterprise",
    monthlyPriceUsd: 999,
    monthlyTransactionLimit: null,
    userLimit: null,
    features: {
      aiDocExtraction: true,
      apiAccess: true,
      multiOffice: true,
      whiteLabel: true,
      prioritySupport: true,
      customIntegrations: true,
    },
  },
  PAY_PER_FILE: {
    id: "PAY_PER_FILE",
    label: "Per-file",
    monthlyPriceUsd: null,
    monthlyTransactionLimit: null,
    userLimit: 1,
    features: {
      aiDocExtraction: false,
      apiAccess: false,
      multiOffice: false,
      whiteLabel: false,
      prioritySupport: false,
      customIntegrations: false,
    },
  },
};

export const PER_FILE_PRICE_USD = 29;
