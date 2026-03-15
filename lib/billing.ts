import { redirect } from "next/navigation";

import { getUsageSummaryByUser } from "@/lib/db/calls";
import { env, hasBillingConfig } from "@/lib/env";
import { getBillingPlan, getIncludedMinutes, getPlanIdByProductId, getPolarCustomerState } from "@/lib/polar";
import type { BillingSummary } from "@/types/app";

function createSummary(input: BillingSummary): BillingSummary {
  return input;
}

export async function getBillingSummary(userId: string): Promise<BillingSummary> {
  if (!hasBillingConfig()) {
    return createSummary({
      configured: false,
      active: false,
      status: "unconfigured",
      customerId: null,
      planId: null,
      planName: null,
      subscriptionsCount: 0,
      periodStart: null,
      periodEnd: null,
      minutesIncluded: null,
      minutesRemaining: null,
      minutesUsed: null,
      minuteMeterConfigured: Boolean(env.POLAR_MINUTES_METER_ID),
      checkoutAvailable: false,
      portalAvailable: false,
      message: "Add Polar credentials and product ids to start selling plans.",
    });
  }

  const state = await getPolarCustomerState(userId);

  if (!state || state.activeSubscriptions.length === 0) {
    return createSummary({
      configured: true,
      active: false,
      status: "inactive",
      customerId: state?.id ?? null,
      planId: null,
      planName: null,
      subscriptionsCount: 0,
      periodStart: null,
      periodEnd: null,
      minutesIncluded: null,
      minutesRemaining: null,
      minutesUsed: null,
      minuteMeterConfigured: Boolean(env.POLAR_MINUTES_METER_ID),
      checkoutAvailable: true,
      portalAvailable: Boolean(state?.id),
      message: "Pick a plan to unlock agent routing, knowledge, and live call handling.",
    });
  }

  const subscription = state.activeSubscriptions[0];
  const planId = getPlanIdByProductId(subscription.productId);
  const plan = getBillingPlan(planId);
  const periodStart = subscription.currentPeriodStart.toISOString();
  const periodEnd = subscription.currentPeriodEnd.toISOString();
  const defaultIncludedMinutes = getIncludedMinutes(planId);
  const usage = defaultIncludedMinutes === null ? null : await getUsageSummaryByUser(userId, periodStart, periodEnd);

  let minutesIncluded = defaultIncludedMinutes;
  let minutesUsed = usage?.totalRoundedMinutes ?? null;
  let minutesRemaining =
    minutesIncluded !== null && minutesUsed !== null ? Math.max(minutesIncluded - minutesUsed, 0) : null;

  const meter = env.POLAR_MINUTES_METER_ID
    ? state.activeMeters.find((entry) => entry.meterId === env.POLAR_MINUTES_METER_ID) ?? null
    : null;

  if (meter) {
    minutesIncluded = Math.max(Math.ceil(meter.creditedUnits), minutesIncluded ?? 0);
    minutesUsed = Math.ceil(meter.consumedUnits);
    minutesRemaining = Math.max(Math.floor(meter.balance), 0);
  }

  const status =
    minutesRemaining !== null && minutesRemaining <= 0 && defaultIncludedMinutes !== null ? "meter_exhausted" : "active";

  return createSummary({
    configured: true,
    active: status === "active",
    status,
    customerId: state.id,
    planId,
    planName: plan?.name ?? "Custom subscription",
    subscriptionsCount: state.activeSubscriptions.length,
    periodStart,
    periodEnd,
    minutesIncluded,
    minutesRemaining,
    minutesUsed,
    minuteMeterConfigured: Boolean(env.POLAR_MINUTES_METER_ID),
    checkoutAvailable: true,
    portalAvailable: true,
    message:
      status === "meter_exhausted"
        ? "Your included minutes are exhausted for the active billing window."
        : "Billing is active. Workspace features and live routing are unlocked.",
  });
}

export function hasWorkspaceAccess(summary: BillingSummary) {
  if (!summary.configured) {
    return true;
  }

  return summary.status === "active";
}

export async function requireWorkspaceAccess(userId: string, fromPath = "/dashboard") {
  const summary = await getBillingSummary(userId);

  if (!hasWorkspaceAccess(summary)) {
    redirect(`/dashboard/billing?from=${encodeURIComponent(fromPath)}`);
  }

  return summary;
}
