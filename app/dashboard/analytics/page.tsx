import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { getAnalyticsOverview } from "@/lib/db/analytics";
import { listCallsByUser } from "@/lib/db/calls";
import { hasBetterAuthConfig } from "@/lib/env";
import { formatDuration } from "@/lib/format";
import { requireSession } from "@/lib/session";

export default async function AnalyticsPage() {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Analytics unlock once auth and the database are configured." />;
  }

  try {
    const session = await requireSession();
    const billing = await getBillingSummary(session.user.id);

    if (!hasWorkspaceAccess(billing)) {
      return <PaywallCard description={`${billing.message} Upgrade to unlock the performance views and volume reporting.`} />;
    }

    const [overview, calls] = await Promise.all([
      getAnalyticsOverview(session.user.id),
      listCallsByUser(session.user.id, 8),
    ]);

    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
          <SectionLabel>Analytics</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Performance and resolution quality</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Measure how many conversations complete cleanly, how much time they consume, and how much commercial value
            the voice layer is creating.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total calls" value={overview.totalCalls.toString()} detail="All webhook-synced conversations in this workspace." />
          <StatCard
            label="Completed"
            value={overview.completedCalls.toString()}
            detail="Calls that ended with the AI handling the interaction successfully."
          />
          <StatCard
            label="High value leads"
            value={overview.highValueLeads.toString()}
            detail="Qualified opportunities currently marked as high priority."
          />
          <StatCard
            label="Avg. duration"
            value={formatDuration(overview.averageDurationSeconds)}
            detail="Average call length across the full conversation history."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <article className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
            <div className="border-b border-[color:var(--line)] pb-4">
              <SectionLabel>Resolution mix</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Operational breakdown</h2>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              {[
                { label: "Transferred", value: overview.transferredCalls },
                { label: "Voicemail", value: overview.voicemailCalls },
                { label: "Spam prevented", value: overview.spamCalls },
                { label: "Appointments scheduled", value: overview.scheduledAppointments },
                { label: "Leads captured", value: overview.totalLeads },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] px-4 py-4"
                >
                  <span className="text-[color:var(--muted-foreground)]">{item.label}</span>
                  <span className="text-lg font-semibold tracking-[-0.03em]">{item.value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
            <div className="border-b border-[color:var(--line)] pb-4">
              <SectionLabel>Recent flow</SectionLabel>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Latest call outcomes</h2>
            </div>

            <div className="mt-6 space-y-4">
              {calls.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[color:var(--foreground)]/16 px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
                  No call records yet. Connect Twilio and Retell to start measuring live performance.
                </p>
              ) : (
                calls.map((call) => (
                  <article key={call.id} className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                          {call.agentName}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{call.callerNumber}</h3>
                      </div>
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                        {call.resolutionStatus}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                      {call.summary ?? "Waiting for analysis output."}
                    </p>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load analytics.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Analytics is wired, but the supporting tables are not queryable yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
