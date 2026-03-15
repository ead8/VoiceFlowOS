import { Polar } from "@polar-sh/sdk";
import type { CustomerState } from "@polar-sh/sdk/models/components/customerstate";

import { env, hasBillingConfig } from "@/lib/env";
import type { BillingPlan, PlanTier } from "@/types/app";

let polarClient: Polar | null = null;

const billingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$29 / month",
    description: "For the first production AI receptionist.",
    allowance: "1 agent / 200 included minutes",
    productId: env.POLAR_STARTER_PRODUCT_ID ?? null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99 / month",
    description: "For growing businesses with multiple active call paths.",
    allowance: "5 agents / 1000 included minutes",
    productId: env.POLAR_PRO_PRODUCT_ID ?? null,
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For high-volume operations, CRM sync, and custom routing policy.",
    allowance: "Custom limits / custom onboarding",
    productId: null,
  },
];

export function getBillingPlans() {
  return billingPlans;
}

export function getBillingPlan(planId: PlanTier | null | undefined) {
  return billingPlans.find((plan) => plan.id === planId) ?? null;
}

export function getPlanIdByProductId(productId: string | null | undefined): PlanTier | null {
  if (!productId) {
    return null;
  }

  const match = billingPlans.find((plan) => plan.productId === productId);
  return match?.id ?? null;
}

export function getIncludedMinutes(planId: PlanTier | null | undefined) {
  switch (planId) {
    case "starter":
      return 200;
    case "pro":
      return 1000;
    default:
      return null;
  }
}

export function getPolarClient() {
  if (!env.POLAR_ACCESS_TOKEN) {
    throw new Error("Polar is not configured. Add POLAR_ACCESS_TOKEN and product ids.");
  }

  if (!polarClient) {
    polarClient = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_SERVER,
      serverURL: env.POLAR_API_BASE_URL,
    });
  }

  return polarClient;
}

function isNotFoundError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    statusCode?: number;
    status?: number;
    response?: { status?: number };
  };

  return candidate.statusCode === 404 || candidate.status === 404 || candidate.response?.status === 404;
}

export async function getPolarCustomerState(userId: string): Promise<CustomerState | null> {
  if (!hasBillingConfig()) {
    return null;
  }

  try {
    return await getPolarClient().customers.getStateExternal({
      externalId: userId,
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

export async function ingestPolarCallUsage(input: {
  userId: string;
  callId: string;
  agentId: string;
  durationSeconds: number;
  createdAt: string;
}) {
  if (!env.POLAR_ACCESS_TOKEN || !env.POLAR_MINUTES_METER_ID) {
    return null;
  }

  const minutes = Math.max(1, Math.ceil(input.durationSeconds / 60));

  return getPolarClient().events.ingest({
    events: [
      {
        name: "call_minutes_consumed",
        externalCustomerId: input.userId,
        externalId: `call:${input.callId}`,
        timestamp: new Date(input.createdAt),
        metadata: {
          meter_id: env.POLAR_MINUTES_METER_ID,
          minutes,
          seconds: input.durationSeconds,
          call_id: input.callId,
          agent_id: input.agentId,
        },
      },
    ],
  });
}
