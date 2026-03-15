import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { listCallsByUser } from "@/lib/db/calls";
import { hasBetterAuthConfig } from "@/lib/env";
import { formatDateTime, formatDuration } from "@/lib/format";
import { requireSession } from "@/lib/session";

export default async function CallsPage() {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Call history will go live once auth and routing credentials are configured." />;
  }

  try {
    const session = await requireSession();
    const billing = await getBillingSummary(session.user.id);

    if (!hasWorkspaceAccess(billing)) {
      return <PaywallCard description={`${billing.message} Upgrade to unlock live call history and transcripts.`} />;
    }

    const calls = await listCallsByUser(session.user.id, 50);

    return (
      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
        <div className="border-b border-[color:var(--line)] pb-6">
          <SectionLabel>Calls</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Resolved and in-progress conversations</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Every call shown here was read from the database and joined to its owning agent.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {calls.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[color:var(--foreground)]/16 px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
              No calls logged yet. Point the Retell webhook at this app and the first ended call will appear here.
            </p>
          ) : (
            calls.map((call) => (
              <article key={call.id} className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                        {call.resolutionStatus}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                        {call.agentName}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{call.callerNumber}</h2>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                      {formatDuration(call.durationSeconds)} / {formatDateTime(call.createdAt)}
                    </p>
                  </div>

                  <div className="text-sm text-[color:var(--muted-foreground)]">
                    <p>Status: {call.status}</p>
                    <p className="mt-1">External call id: {call.externalCallId ?? "Not captured"}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Summary</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]/88">
                      {call.summary ?? "Waiting for post-call analysis."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Transcript</p>
                    <p className="mt-3 line-clamp-6 text-sm leading-7 text-[color:var(--foreground)]/88">
                      {call.transcript ?? "Transcript not available yet."}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load calls.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Call history is wired, but the database cannot return records yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
