import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { listLeadsByUser } from "@/lib/db/leads";
import { hasBetterAuthConfig } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";

import { createLeadAction } from "./actions";

type LeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Lead qualification unlocks once auth and the database are configured." />;
  }

  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : null;
  const error = typeof params.error === "string" ? params.error : null;

  try {
    const session = await requireSession();
    const billing = await getBillingSummary(session.user.id);

    if (!hasWorkspaceAccess(billing)) {
      return <PaywallCard description={`${billing.message} Upgrade to capture and score leads inside the workspace.`} />;
    }

    const leads = await listLeadsByUser(session.user.id);

    return (
      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
        <div className="border-b border-[color:var(--line)] pb-6">
          <SectionLabel>Lead qualification</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Turn calls into routed opportunities</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Capture budget, urgency, problem type, and service location so your operators can prioritize follow-up.
          </p>
        </div>

        {success ? (
          <p className="mt-6 rounded-2xl border border-[color:var(--signal)]/28 bg-[color:var(--signal)]/12 px-4 py-3 text-sm">
            {success}
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-2xl border border-[color:var(--accent)]/24 bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <form action={createLeadAction} className="grid gap-5 rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Contact name</span>
                <input
                  name="name"
                  placeholder="Jane Smith"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Phone number</span>
                <input
                  name="phoneNumber"
                  placeholder="+14155550123"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Budget</span>
                <input
                  name="budget"
                  placeholder="$2,000 to $5,000"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Timeline</span>
                <input
                  name="timeline"
                  placeholder="This week"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Problem</span>
              <textarea
                name="problem"
                rows={5}
                placeholder="Leaking pipe behind kitchen wall and wants urgent assessment."
                className="rounded-[1.5rem] border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Location</span>
                <input
                  name="location"
                  placeholder="Westlands"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Qualification</span>
                <select
                  name="qualification"
                  defaultValue="medium"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
              >
                Save lead
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {leads.length === 0 ? (
              <p className="rounded-[1.75rem] border border-dashed border-[color:var(--foreground)]/16 px-5 py-6 text-sm text-[color:var(--muted-foreground)]">
                No leads yet. Once intake calls start landing, your qualification list will build here.
              </p>
            ) : (
              leads.map((lead) => (
                <article key={lead.id} className="rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{lead.name ?? "Unnamed lead"}</h2>
                        <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                          {lead.qualification ?? "unscored"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                        {lead.phoneNumber ?? "No phone number"} · {formatDateTime(lead.createdAt)}
                      </p>
                    </div>
                    <div className="text-sm text-[color:var(--muted-foreground)]">
                      <p>Budget: {lead.budget ?? "Not captured"}</p>
                      <p className="mt-1">Timeline: {lead.timeline ?? "Not captured"}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {lead.problem ?? "Problem details have not been captured yet."}
                  </p>
                  <p className="mt-3 text-sm text-[color:var(--foreground)]/84">Location: {lead.location ?? "Not captured"}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load leads.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Lead management is wired, but the supporting tables are not queryable yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
