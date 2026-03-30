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

export const PLAN_USER_LIMITS: Record<PlanId, number> = {
  STARTER: 2,
  PROFESSIONAL: 10,
  ENTERPRISE: Number.POSITIVE_INFINITY,
  PAY_PER_FILE: 1,
};

export const PLAN_PRICING: Record<
  PlanId,
  {
    name: string;
    price: number;
    priceLabel: string;
    transactions: string;
    users: string;
    features: string[];
  }
> = {
  STARTER: {
    name: "Starter",
    price: 199,
    priceLabel: "$199/month",
    transactions: "25/month",
    users: "2",
    features: [
      "Screening engine",
      "Data collection",
      "Filing generation",
      "Audit trail",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 499,
    priceLabel: "$499/month",
    transactions: "100/month",
    users: "10",
    features: [
      "Everything in Starter",
      "AI document extraction",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 999,
    priceLabel: "$999/month",
    transactions: "Unlimited",
    users: "Unlimited",
    features: [
      "Everything in Professional",
      "API access",
      "Multi-office",
      "White-label",
      "Custom integrations",
    ],
  },
  PAY_PER_FILE: {
    name: "Per-File",
    price: 29,
    priceLabel: "$29/filing",
    transactions: "Pay per use",
    users: "1",
    features: [
      "Screening engine",
      "Data collection",
      "Filing generation",
      "Audit trail",
    ],
  },
};

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;
