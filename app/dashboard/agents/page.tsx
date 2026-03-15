import Link from "next/link";

import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { listAgentsByUser } from "@/lib/db/agents";
import { hasBetterAuthConfig } from "@/lib/env";
import { requireSession } from "@/lib/session";

type AgentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Add auth and database credentials before agent management can go live." />;
  }

  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : null;

  try {
    const session = await requireSession();
    const billing = await getBillingSummary(session.user.id);

    if (!hasWorkspaceAccess(billing)) {
      return (
        <PaywallCard
          description={`${billing.message} Upgrade to create and route live AI phone agents.`}
        />
      );
    }

    const agents = await listAgentsByUser(session.user.id);

    return (
      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
        <div className="flex flex-col gap-6 border-b border-[color:var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>Agent management</SectionLabel>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Create and route AI phone agents</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
              Each agent stores its business number, prompt instructions, voice label, and Retell routing metadata.
            </p>
          </div>

          <Link
            href="/dashboard/agents/new"
            className="rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
          >
            New agent
          </Link>
        </div>

        {success ? (
          <p className="mt-6 rounded-2xl border border-[color:var(--signal)]/28 bg-[color:var(--signal)]/12 px-4 py-3 text-sm">
            {success}
          </p>
        ) : null}

        <div className="mt-8 space-y-4">
          {agents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[color:var(--foreground)]/16 px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
              No agents yet. Create one and map its inbound business number to a Retell phone number or agent id.
            </p>
          ) : (
            agents.map((agent) => (
              <article key={agent.id} className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold tracking-[-0.03em]">{agent.name}</h2>
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                        {agent.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{agent.phoneNumber}</p>
                  </div>

                  <dl className="grid gap-2 text-sm text-[color:var(--muted-foreground)] lg:min-w-[18rem]">
                    <div className="flex items-center justify-between gap-4">
                      <dt>Voice</dt>
                      <dd className="text-[color:var(--foreground)]">{agent.voice}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt>Retell agent</dt>
                      <dd className="text-[color:var(--foreground)]">{agent.retellAgentId ?? "Not set"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt>Retell number</dt>
                      <dd className="text-[color:var(--foreground)]">{agent.retellPhoneNumber ?? "Not set"}</dd>
                    </div>
                  </dl>
                </div>

                <p className="mt-5 text-sm leading-7 text-[color:var(--muted-foreground)]">{agent.instructions}</p>
              </article>
            ))
          )}
        </div>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load agents.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Agent management is ready, but the backing tables are not queryable yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
