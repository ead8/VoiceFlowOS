import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { SectionLabel } from "@/components/section-label";
import { getBillingSummary } from "@/lib/billing";
import { getBusinessProfileByUser } from "@/lib/db/business-profile";
import { hasBetterAuthConfig } from "@/lib/env";
import { requireSession } from "@/lib/session";

import { saveBusinessProfileAction } from "./actions";

type SettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  if (!hasBetterAuthConfig()) {
    return <SetupChecklist title="Business settings unlock once authentication and the database are configured." />;
  }

  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : null;
  const error = typeof params.error === "string" ? params.error : null;

  try {
    const session = await requireSession();
    const [profile, billing] = await Promise.all([
      getBusinessProfileByUser(session.user.id),
      getBillingSummary(session.user.id),
    ]);

    return (
      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
        <div className="border-b border-[color:var(--line)] pb-6">
          <SectionLabel>Business profile</SectionLabel>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Business settings and call policy</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Capture the operational details your AI agents depend on: company identity, escalation number, voicemail
            behavior, and anti-spam posture.
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form action={saveBusinessProfileAction} className="grid gap-5 rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-6">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Company name</span>
              <input
                name="companyName"
                defaultValue={profile?.companyName ?? ""}
                placeholder="Northstar Dental"
                className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Industry</span>
                <input
                  name="industry"
                  defaultValue={profile?.industry ?? ""}
                  placeholder="Dental clinic"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Business phone</span>
                <input
                  name="businessPhone"
                  defaultValue={profile?.businessPhone ?? ""}
                  placeholder="+254700000000"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium">Timezone</span>
                <input
                  name="timezone"
                  defaultValue={profile?.timezone ?? "Africa/Nairobi"}
                  placeholder="Africa/Nairobi"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Human transfer number</span>
                <input
                  name="transferPhoneNumber"
                  defaultValue={profile?.transferPhoneNumber ?? ""}
                  placeholder="+254711111111"
                  className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Supported languages</span>
              <input
                name="languages"
                defaultValue={(profile?.languages ?? ["English"]).join(", ")}
                placeholder="English, Swahili"
                className="rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--foreground)]"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--foreground)]/10 px-4 py-4 text-sm">
                <input
                  name="spamScreeningEnabled"
                  type="checkbox"
                  defaultChecked={profile?.spamScreeningEnabled ?? false}
                  className="mt-0.5 h-4 w-4 rounded border-[color:var(--line)]"
                />
                <span>
                  <span className="block font-medium">Enable press-1 screening</span>
                  <span className="mt-1 block text-[color:var(--muted-foreground)]">
                    Block low-quality robocalls before the assistant engages.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--foreground)]/10 px-4 py-4 text-sm">
                <input
                  name="voicemailDetectionEnabled"
                  type="checkbox"
                  defaultChecked={profile?.voicemailDetectionEnabled ?? true}
                  className="mt-0.5 h-4 w-4 rounded border-[color:var(--line)]"
                />
                <span>
                  <span className="block font-medium">Enable voicemail detection</span>
                  <span className="mt-1 block text-[color:var(--muted-foreground)]">
                    End early when the system hears a voicemail greeting instead of a live caller.
                  </span>
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
              >
                Save settings
              </button>
            </div>
          </form>

          <aside className="space-y-5 rounded-[1.75rem] border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent)]">Workspace plan</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {billing.planName ?? "No active subscription"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{billing.message}</p>
            </div>

            <div className="grid gap-4 text-sm">
              <div className="rounded-2xl border border-[color:var(--foreground)]/10 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Minutes status</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  {billing.minutesRemaining ?? "Unlimited"}
                </p>
                <p className="mt-2 text-[color:var(--muted-foreground)]">Included minutes remaining in the current window.</p>
              </div>

              <div className="rounded-2xl border border-[color:var(--foreground)]/10 px-4 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">Transfer routing</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Store the human escalation line here, then use the same value in your Retell transfer workflow.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load business settings.";

    return (
      <div className="space-y-6">
        <SetupChecklist title="Business settings are wired, but the backing tables are not queryable yet." />
        <p className="rounded-2xl border border-[color:var(--accent)]/22 bg-[color:var(--surface)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          {message}
        </p>
      </div>
    );
  }
}
