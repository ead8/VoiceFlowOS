"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "./sign-out-button";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/knowledge", label: "Knowledge" },
  { href: "/dashboard/calls", label: "Calls" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/integrations", label: "Integrations" },
  { href: "/dashboard/settings", label: "Settings" },
];

type DashboardSidebarProps = {
  email?: string | null;
  authReady: boolean;
};

export function DashboardSidebar({ email, authReady }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col justify-between rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
      <div>
        <div className="border-b border-[color:var(--line)] pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent)]">
            Control room
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">VoiceFlowOS</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
            {authReady ? email ?? "Authenticated workspace" : "Configuration required before auth can start."}
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                    : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--background)] hover:text-[color:var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {authReady ? <SignOutButton /> : null}
    </aside>
  );
}
