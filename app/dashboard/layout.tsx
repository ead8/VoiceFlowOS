import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { hasBetterAuthConfig } from "@/lib/env";
import { getSession } from "@/lib/session";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const authReady = hasBetterAuthConfig();
  const session = authReady ? await getSession() : null;

  if (authReady && !session) {
    redirect("/login");
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <DashboardSidebar authReady={authReady} email={session?.user.email ?? null} />
          <section className="space-y-6">{children}</section>
        </div>
      </div>
    </main>
  );
}

