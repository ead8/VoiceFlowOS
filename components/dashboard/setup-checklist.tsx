import { missingBetterAuthEnv, missingVoiceEnv } from "@/lib/env";

type SetupChecklistProps = {
  title?: string;
};

export function SetupChecklist({ title = "VoiceFlowOS needs credentials before the live system can run." }: SetupChecklistProps) {
  const missingAuth = missingBetterAuthEnv();
  const missingVoice = missingVoiceEnv();

  return (
    <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent)]">Setup required</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
        The app code is wired for production. What is still missing is the external infrastructure configuration that
        only your credentials can provide.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
          <h3 className="text-xl font-semibold tracking-[-0.03em]">Authentication + database</h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--muted-foreground)]">
            {missingAuth.length === 0 ? (
              <li>Configured.</li>
            ) : (
              missingAuth.map((key) => <li key={key}>{key}</li>)
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] p-5">
          <h3 className="text-xl font-semibold tracking-[-0.03em]">Voice routing</h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--muted-foreground)]">
            {missingVoice.length === 0 ? (
              <li>Configured.</li>
            ) : (
              missingVoice.map((key) => <li key={key}>{key}</li>)
            )}
          </ul>
        </article>
      </div>
    </section>
  );
}
