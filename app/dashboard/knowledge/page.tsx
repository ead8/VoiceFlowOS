import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { listAgentsByUser } from "@/lib/db/agents";
import { listKnowledgeDocumentsByUser } from "@/lib/db/knowledge";
import { hasBetterAuthConfig } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";

import { createKnowledgeDocumentAction } from "./actions";

type KnowledgePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Knowledge management unlocks once auth and the database are configured." />;
  }

  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : null;
  const error = typeof params.error === "string" ? params.error : null;

  try {
    const session = await requireSession();
    const billing = await getBillingSummary(session.user.id);

    if (!hasWorkspaceAccess(billing)) {
      return (
        <PaywallCard
          description={`${billing.message} Upgrade to start uploading FAQs, policy docs, and hosted PDFs.`}
        />
      );
    }

    const [agents, documents] = await Promise.all([
      listAgentsByUser(session.user.id),
      listKnowledgeDocumentsByUser(session.user.id),
    ]);

    return (
      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
        <div className="border-b border-[color:var(--line)] pb-6">
          <SectionLabel>Knowledge base</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Teach each agent your business context</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Add hosted PDFs, internal playbooks, and FAQ content so the conversation layer can answer with cleaner
            business-specific context.
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form action={createKnowledgeDocumentAction} className="grid gap-5 rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-6">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Title</span>
              <input
                name="title"
                placeholder="Clinic FAQ"
                className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Source type</span>
                <select
                  name="sourceType"
                  defaultValue="faq"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                >
                  <option value="faq">FAQ</option>
                  <option value="text">Text</option>
                  <option value="pdf">PDF URL</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Assigned agent</span>
                <select
                  name="agentId"
                  defaultValue=""
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                >
                  <option value="">All agents</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Hosted PDF URL</span>
              <input
                name="sourceUrl"
                placeholder="https://example.com/handbook.pdf"
                className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Knowledge content</span>
              <textarea
                name="content"
                rows={12}
                placeholder="Business hours: Monday to Saturday, 8am to 7pm. Reservations require a phone number and preferred time..."
                className="rounded-[1.5rem] border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
              />
            </label>

            <div>
              <button
                type="submit"
                className="rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
              >
                Save knowledge
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {documents.length === 0 ? (
              <p className="rounded-[1.75rem] border border-dashed border-[color:var(--foreground)]/16 px-5 py-6 text-sm text-[color:var(--muted-foreground)]">
                No documents yet. Start with your highest-frequency FAQs, pricing rules, and locations.
              </p>
            ) : (
              documents.map((document) => (
                <article key={document.id} className="rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{document.title}</h2>
                        <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                          {document.sourceType}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">Updated {formatDateTime(document.updatedAt)}</p>
                    </div>
                    <span className="rounded-full border border-[color:var(--foreground)]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                      {document.status}
                    </span>
                  </div>

                  {document.sourceUrl ? (
                    <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">Source URL: {document.sourceUrl}</p>
                  ) : null}

                  <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {document.content ?? "This entry points to an external source and is ready for retrieval."}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the knowledge base.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Knowledge management is wired, but the supporting tables are not queryable yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
