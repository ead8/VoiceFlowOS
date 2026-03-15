import Link from "next/link";

import { BillingActions } from "@/components/dashboard/billing-actions";
import { SectionLabel } from "@/components/section-label";
import { SiteHeader } from "@/components/site-header";
import { getBillingSummary } from "@/lib/billing";
import { hasBetterAuthConfig } from "@/lib/env";
import { getBillingPlans } from "@/lib/polar";
import { getSession } from "@/lib/session";

export default async function PricingPage() {
  const authReady = hasBetterAuthConfig();
  const session = authReady ? await getSession() : null;
  const billing = session ? await getBillingSummary(session.user.id) : null;
  const plans = getBillingPlans();

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <SiteHeader />

        <section className="grid gap-12 border-b border-[color:var(--line)] py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="reveal">
            <SectionLabel>Pricing</SectionLabel>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.04em] sm:text-6xl">
              Pay only when the AI phone desk is ready to work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              Create your account, choose a plan, and unlock the paid workspace. Billing lives inside the app so
              operators can manage minutes, subscriptions, and portal access without leaving the control room.
            </p>

            <div className="mt-8">
              {session ? (
                <BillingActions
                  authReady={authReady}
                  checkoutAvailable={billing?.checkoutAvailable ?? false}
                  portalAvailable={billing?.portalAvailable ?? false}
                  activePlanId={billing?.planId ?? null}
                />
              ) : (
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-6 py-3 text-sm font-medium text-[color:var(--background)]"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--foreground)]/16 bg-[color:var(--surface)] px-6 py-3 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                key={plan.id}
                className={`reveal rounded-[2rem] border p-6 ${
                  plan.highlight
                    ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
                    : "border-[color:var(--line)] bg-[color:var(--surface)]"
                }`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent)]">{plan.name}</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{plan.price}</h2>
                <p className="mt-4 text-sm leading-7 opacity-88">{plan.description}</p>
                <p className="mt-6 rounded-2xl border border-current/12 px-4 py-3 text-sm">{plan.allowance}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
