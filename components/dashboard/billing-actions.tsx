"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { authClient } from "@/lib/auth-client";
import type { PlanTier } from "@/types/app";

type BillingActionsProps = {
  authReady: boolean;
  checkoutAvailable: boolean;
  portalAvailable: boolean;
  activePlanId: PlanTier | null;
};

export function BillingActions({ authReady, checkoutAvailable, portalAvailable, activePlanId }: BillingActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(slug: "starter" | "pro") {
    if (!authReady || !checkoutAvailable) {
      return;
    }

    setPending(slug);
    setError(null);

    const { error: checkoutError } = await authClient.checkout({
      slug,
      metadata: {
        source: "dashboard-billing",
      },
    });

    if (checkoutError) {
      setPending(null);
      setError(checkoutError.message ?? "Unable to open checkout.");
    }
  }

  async function handlePortal() {
    if (!authReady || !portalAvailable) {
      return;
    }

    setPending("portal");
    setError(null);

    const { error: portalError } = await authClient.customer.portal({
      redirect: true,
    });

    if (portalError) {
      setPending(null);
      setError(portalError.message ?? "Unable to open the billing portal.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });

    setPending(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!authReady || !checkoutAvailable || pending !== null}
          onClick={() => handleCheckout("starter")}
          className={`rounded-full border px-5 py-3 text-sm font-medium transition-transform duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            activePlanId === "starter"
              ? "border-[color:var(--signal)] bg-[color:var(--signal)]/18"
              : "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
          }`}
        >
          {pending === "starter" ? "Opening checkout..." : activePlanId === "starter" ? "Starter active" : "Choose Starter"}
        </button>

        <button
          type="button"
          disabled={!authReady || !checkoutAvailable || pending !== null}
          onClick={() => handleCheckout("pro")}
          className={`rounded-full border px-5 py-3 text-sm font-medium transition-transform duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            activePlanId === "pro"
              ? "border-[color:var(--signal)] bg-[color:var(--signal)]/18"
              : "border-[color:var(--foreground)]/16 bg-[color:var(--surface)]"
          }`}
        >
          {pending === "pro" ? "Opening checkout..." : activePlanId === "pro" ? "Pro active" : "Choose Pro"}
        </button>

        <button
          type="button"
          disabled={!authReady || !portalAvailable || pending !== null}
          onClick={handlePortal}
          className="rounded-full border border-[color:var(--foreground)]/16 bg-[color:var(--surface)] px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "portal" ? "Opening portal..." : "Manage billing"}
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-[color:var(--accent)]/24 bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
