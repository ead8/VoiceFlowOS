import { BillingActions } from "@/components/dashboard/billing-actions";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary } from "@/lib/billing";
import { hasBetterAuthConfig, hasBillingConfig } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { getBillingPlans } from "@/lib/polar";
import { requireSession } from "@/lib/session";

type BillingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Billing unlocks once authentication and the database are configured." />;
  }

  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : null;
  const checkout = typeof params.checkout === "string" ? params.checkout : null;

  try {
    const session = await requireSession();
    const summary = await getBillingSummary(session.user.id);
    const plans = getBillingPlans();

    return (
      <div className="space-y-6">
        {!hasBillingConfig() ? (
          <SetupChecklist title="Polar billing is not configured yet. Add your token and product ids to go live." />
        ) : null}

        <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
          <SectionLabel>Billing</SectionLabel>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-[-0.04em]">Subscription access and included minutes</h1>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                {summary.message}
                {from ? ` You were sent here from ${from}.` : ""}
              </p>
            </div>

            <BillingActions
              authReady={hasBetterAuthConfig()}
              checkoutAvailable={summary.checkoutAvailable}
              portalAvailable={summary.portalAvailable}
              activePlanId={summary.planId}
            />
          </div>

          {checkout === "success" ? (
            <p className="mt-6 rounded-2xl border border-[color:var(--signal)]/28 bg-[color:var(--signal)]/12 px-4 py-3 text-sm">
              Checkout completed. If Polar has already activated the subscription, your workspace will refresh into the
              paid experience automatically.
            </p>
          ) : null}

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Current plan</p>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{summary.planName ?? "No active plan"}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                {summary.periodEnd ? `Current window ends ${formatDateTime(summary.periodEnd)}.` : "Choose a plan to unlock the workspace."}
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Minutes used</p>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{summary.minutesUsed ?? 0}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                Measured from call logs in the active billing window{summary.minuteMeterConfigured ? " and optionally mirrored into Polar meters." : "."}
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Minutes remaining</p>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                {summary.minutesRemaining ?? (summary.active ? "Unlimited" : 0)}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                {summary.minutesIncluded !== null
                  ? `${summary.minutesIncluded} included minutes in this plan.`
                  : "Enterprise and custom plans can be managed directly in the billing portal."}
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[2rem] border p-6 ${
                summary.planId === plan.id
                  ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
                  : "border-[color:var(--line)] bg-[color:var(--surface)]"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent)]">{plan.name}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{plan.price}</h2>
              <p className="mt-4 text-sm leading-7 opacity-88">{plan.description}</p>
              <p className="mt-5 rounded-2xl border border-current/12 px-4 py-3 text-sm">{plan.allowance}</p>
              {summary.planId === plan.id ? (
                <p className="mt-5 text-sm font-medium uppercase tracking-[0.2em]">Current plan</p>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load billing.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Billing is wired, but the subscription layer cannot be queried yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
