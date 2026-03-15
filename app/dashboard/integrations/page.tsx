import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import {
  getWebhookUrl,
  hasBillingConfig,
  hasBetterAuthConfig,
  hasTelephonyConfig,
  hasVoiceRoutingConfig,
  missingBillingEnv,
  missingBetterAuthEnv,
  missingVoiceEnv,
} from "@/lib/env";
import type { IntegrationCard } from "@/types/app";

function getCards(): IntegrationCard[] {
  return [
    {
      title: "Better Auth",
      configured: hasBetterAuthConfig(),
      detail: hasBetterAuthConfig()
        ? "Email and password auth can issue real sessions."
        : `Missing: ${missingBetterAuthEnv().join(", ")}`,
      hint: `Handler: ${getWebhookUrl("/api/auth/sign-in/email")}`,
    },
    {
      title: "Polar",
      configured: hasBillingConfig(),
      detail: hasBillingConfig()
        ? "Subscription checkout, portal access, and usage hooks are wired through Better Auth."
        : `Missing: ${missingBillingEnv().join(", ")}`,
      hint: `Billing page: ${getWebhookUrl("/dashboard/billing")}`,
    },
    {
      title: "Twilio",
      configured: hasTelephonyConfig(),
      detail: hasTelephonyConfig()
        ? "Inbound voice webhooks can be validated and answered with TwiML."
        : "Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.",
      hint: `Webhook: ${getWebhookUrl("/api/webhooks/twilio/inbound")}`,
    },
    {
      title: "Retell",
      configured: hasVoiceRoutingConfig(),
      detail: hasVoiceRoutingConfig()
        ? "Call forwarding and post-call webhooks are ready to connect."
        : `Missing: ${missingVoiceEnv().join(", ")}`,
      hint: `Webhook: ${getWebhookUrl("/api/webhooks/retell")}`,
    },
    {
      title: "Health endpoint",
      configured: true,
      detail: "Use this endpoint in deployment checks and uptime monitors.",
      hint: getWebhookUrl("/api/health"),
    },
  ];
}

export default function IntegrationsPage() {
  const cards = getCards();

  return (
    <div className="space-y-6">
      {!hasBetterAuthConfig() || !hasVoiceRoutingConfig() || !hasBillingConfig() ? (
        <SetupChecklist title="This page shows exactly what is still missing from the live integration stack." />
      ) : null}

      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
        <div className="border-b border-[color:var(--line)] pb-6">
          <SectionLabel>Integrations</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Provider configuration status</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            These checks read the current environment and expose the exact URLs the external providers should call.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">{card.title}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
                    card.configured ? "bg-[color:var(--signal)]/25" : "bg-[color:var(--accent-soft)]"
                  }`}
                >
                  {card.configured ? "ready" : "pending"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">{card.detail}</p>
              {card.hint ? (
                <p className="mt-4 rounded-2xl border border-[color:var(--foreground)]/10 px-4 py-3 text-sm text-[color:var(--foreground)]">
                  {card.hint}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
