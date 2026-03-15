import Link from "next/link";

import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { hasBetterAuthConfig } from "@/lib/env";
import { requireSession } from "@/lib/session";

import { createAgentAction } from "../actions";

type NewAgentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewAgentPage({ searchParams }: NewAgentPageProps) {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Finish auth and database setup before creating agents." />;
  }

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const session = await requireSession();
  const billing = await getBillingSummary(session.user.id);

  if (!hasWorkspaceAccess(billing)) {
    return <PaywallCard description={`${billing.message} Upgrade to provision your first inbound AI phone agent.`} />;
  }

  return (
    <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
      <div className="flex flex-col gap-4 border-b border-[color:var(--line)] pb-6">
        <SectionLabel>New agent</SectionLabel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">Provision an inbound AI phone agent</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
              This writes directly to the production `agents` table. Use E.164 phone numbers so Twilio and Retell
              routing stays deterministic.
            </p>
          </div>

          <Link href="/dashboard/agents" className="text-sm font-medium text-[color:var(--foreground)]">
            Back to agents
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl border border-[color:var(--accent)]/28 bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <form action={createAgentAction} className="mt-8 grid gap-5 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Agent name</span>
          <input
            name="name"
            type="text"
            placeholder="Northstar Receptionist"
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Voice label</span>
          <input
            name="voice"
            type="text"
            placeholder="ElevenLabs / Maya"
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Inbound business number</span>
          <input
            name="phoneNumber"
            type="text"
            placeholder="+14155550123"
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            defaultValue="draft"
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Retell agent ID</span>
          <input
            name="retellAgentId"
            type="text"
            placeholder="agent_..."
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Retell transfer number</span>
          <input
            name="retellPhoneNumber"
            type="text"
            placeholder="+14155550999"
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
          />
        </label>

        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium">Instructions</span>
          <textarea
            name="instructions"
            rows={8}
            placeholder="You are a restaurant receptionist. Answer customer questions, take reservations, and escalate politely when the caller requests a manager."
            className="rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
            required
          />
        </label>

        <div className="lg:col-span-2 flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
          >
            Save agent
          </button>
          <Link href="/dashboard/agents" className="rounded-full border border-[color:var(--foreground)]/14 px-5 py-3 text-sm font-medium">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
