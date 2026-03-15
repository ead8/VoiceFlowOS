import Link from "next/link";

import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { listAgentsByUser } from "@/lib/db/agents";
import { getDashboardMetrics, listCallsByUser } from "@/lib/db/calls";
import { formatDateTime, formatDuration } from "@/lib/format";
import { hasBetterAuthConfig } from "@/lib/env";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist />;
  }

  try {
    const session = await requireSession();
    const billing = await getBillingSummary(session.user.id);

    if (!hasWorkspaceAccess(billing)) {
      return (
        <PaywallCard
          title="Your account is created. The paid workspace unlocks after checkout."
          description={`${billing.message} Open billing, choose a plan, and the dashboard will start acting as the live operations console.`}
        />
      );
    }

    const [metrics, agents, calls] = await Promise.all([
      getDashboardMetrics(session.user.id),
      listAgentsByUser(session.user.id),
      listCallsByUser(session.user.id, 5),
    ]);

    return (
      <>
        <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
          <SectionLabel>Overview</SectionLabel>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-5xl leading-[0.96] font-semibold tracking-[-0.04em]">
                The live operations surface for your AI phone agents.
              </h1>
              <p className="mt-5 text-lg leading-8 text-[color:var(--muted-foreground)]">
                This dashboard is reading from your production database layer, not a design stub. Agents, calls, and
                webhook-ingested outcomes show up here as soon as the infrastructure is connected.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/agents/new"
                className="rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
              >
                Create agent
              </Link>
              <Link
                href="/dashboard/integrations"
                className="rounded-full border border-[color:var(--foreground)]/14 px-5 py-3 text-sm font-medium"
              >
                Configure integrations
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Calls Today"
            value={metrics.callsToday.toString()}
            detail="Inbound and webhook-synced calls handled since midnight."
          />
          <StatCard
            label="Calls This Week"
            value={metrics.callsThisWeek.toString()}
            detail="Rolling weekly signal for whether the system is actually being used."
          />
          <StatCard
            label="Average Duration"
            value={formatDuration(metrics.averageDurationSeconds)}
            detail="Longer conversations usually indicate successful intake rather than instant drop-off."
          />
          <StatCard
            label="Configured Agents"
            value={metrics.totalAgents.toString()}
            detail="Agents that can be routed from connected business phone numbers."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
            <div className="flex items-end justify-between gap-4 border-b border-[color:var(--line)] pb-4">
              <div>
                <SectionLabel>Agents</SectionLabel>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Routing inventory</h2>
              </div>
              <Link href="/dashboard/agents" className="text-sm font-medium text-[color:var(--foreground)]">
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {agents.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[color:var(--foreground)]/16 px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
                  No agents yet. Create your first one, attach its inbound number, then connect the Retell destination.
                </p>
              ) : (
                agents.slice(0, 4).map((agent) => (
                  <article key={agent.id} className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold tracking-[-0.03em]">{agent.name}</h3>
                        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{agent.phoneNumber}</p>
                      </div>
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                        {agent.status}
                      </span>
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                      {agent.instructions}
                    </p>
                  </article>
                ))
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
            <div className="flex items-end justify-between gap-4 border-b border-[color:var(--line)] pb-4">
              <div>
                <SectionLabel>Recent calls</SectionLabel>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Webhook-synced conversation history</h2>
              </div>
              <Link href="/dashboard/calls" className="text-sm font-medium text-[color:var(--foreground)]">
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {calls.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[color:var(--foreground)]/16 px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
                  No calls logged yet. When Retell sends `call_ended` or `call_analyzed`, the records will land here.
                </p>
              ) : (
                calls.map((call) => (
                  <article key={call.id} className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-[color:var(--signal)]/25 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                            {call.resolutionStatus}
                          </span>
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                            {call.agentName}
                          </span>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em]">{call.callerNumber}</h3>
                      </div>
                      <div className="text-sm text-[color:var(--muted-foreground)] sm:text-right">
                        <p>{formatDuration(call.durationSeconds)}</p>
                        <p className="mt-1">{formatDateTime(call.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                      {call.summary ?? "Transcript captured. Summary will appear after post-call analysis finishes."}
                    </p>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      </>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The dashboard database queries failed.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="The auth layer is wired, but the database tables still need to exist." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
