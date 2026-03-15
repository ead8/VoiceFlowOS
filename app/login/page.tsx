import { redirect } from "next/navigation";

import { AuthForm } from "@/components/forms/auth-form";
import { SectionLabel } from "@/components/section-label";
import { SiteHeader } from "@/components/site-header";
import { hasBetterAuthConfig } from "@/lib/env";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const authReady = hasBetterAuthConfig();
  const session = authReady ? await getSession() : null;

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <SiteHeader />

        <section className="grid gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
          <div className="max-w-xl">
            <SectionLabel>Authentication</SectionLabel>
            <h1 className="mt-6 text-5xl leading-[0.96] font-semibold tracking-[-0.04em]">
              Production auth, not a placeholder.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[color:var(--muted-foreground)]">
              VoiceFlowOS now uses Better Auth for real email and password sessions. Once your database connection and
              auth secret are set, this page becomes the live owner sign-in.
            </p>
          </div>

          <AuthForm mode="login" authReady={authReady} />
        </section>
      </div>
    </main>
  );
}

