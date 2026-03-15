import { PaywallCard } from "@/components/dashboard/paywall-card";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { listAgentsByUser } from "@/lib/db/agents";
import { listAppointmentsByUser } from "@/lib/db/appointments";
import { hasBetterAuthConfig } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { requireSession } from "@/lib/session";

import { createAppointmentAction } from "./actions";

type AppointmentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Appointment workflows unlock once auth and the database are configured." />;
  }

  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : null;
  const error = typeof params.error === "string" ? params.error : null;

  try {
    const session = await requireSession();
    const billing = await getBillingSummary(session.user.id);

    if (!hasWorkspaceAccess(billing)) {
      return (
        <PaywallCard description={`${billing.message} Upgrade to book appointments and sync them into your workflow.`} />
      );
    }

    const [agents, appointments] = await Promise.all([
      listAgentsByUser(session.user.id),
      listAppointmentsByUser(session.user.id),
    ]);

    return (
      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
        <div className="border-b border-[color:var(--line)] pb-6">
          <SectionLabel>Appointments</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Booking operations</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Capture scheduled visits now, then connect the same flow to Google Calendar or Calendly as the integration
            layer comes online.
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
          <form action={createAppointmentAction} className="grid gap-5 rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Agent</span>
                <select
                  name="agentId"
                  defaultValue=""
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Provider</span>
                <select
                  name="provider"
                  defaultValue="Calendly"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                >
                  <option value="Calendly">Calendly</option>
                  <option value="Google Calendar">Google Calendar</option>
                  <option value="Manual">Manual</option>
                </select>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Contact name</span>
                <input
                  name="contactName"
                  placeholder="James Otieno"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Contact phone</span>
                <input
                  name="contactPhone"
                  placeholder="+254711234567"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Scheduled for</span>
                <input
                  name="scheduledFor"
                  type="datetime-local"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Status</span>
                <select
                  name="status"
                  defaultValue="scheduled"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium">External event id</span>
              <input
                name="externalEventId"
                placeholder="evt_..."
                className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Notes</span>
              <textarea
                name="notes"
                rows={6}
                placeholder="Initial plumbing inspection. Caller prefers afternoon slots."
                className="rounded-[1.5rem] border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
              />
            </label>

            <div>
              <button
                type="submit"
                className="rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
              >
                Save appointment
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="rounded-[1.75rem] border border-dashed border-[color:var(--foreground)]/16 px-5 py-6 text-sm text-[color:var(--muted-foreground)]">
                No appointments yet. Once bookings start landing, upcoming work will show here.
              </p>
            ) : (
              appointments.map((appointment) => (
                <article key={appointment.id} className="rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                          {appointment.contactName ?? "Unnamed booking"}
                        </h2>
                        <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                          {appointment.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                        {formatDateTime(appointment.scheduledFor)} · {appointment.provider}
                      </p>
                    </div>
                    <div className="text-sm text-[color:var(--muted-foreground)]">
                      <p>Agent: {appointment.agentName ?? "Unassigned"}</p>
                      <p className="mt-1">Phone: {appointment.contactPhone ?? "Not captured"}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                    {appointment.notes ?? "No notes captured yet."}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load appointments.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Appointments are wired, but the supporting tables are not queryable yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
