import Link from "next/link";

import { LogoMark } from "./logo-mark";

const navigation = [
  { href: "/#mvp", label: "MVP" },
  { href: "/#architecture", label: "Architecture" },
  { href: "/#roadmap", label: "Roadmap" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="flex flex-col gap-6 border-b border-[color:var(--line)] pb-6 lg:flex-row lg:items-center lg:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <LogoMark />
        <div>
          <p className="text-xl font-semibold tracking-[0.16em] text-[color:var(--foreground)] uppercase">
            VoiceFlowOS
          </p>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            AI phone operations for businesses that cannot miss a call.
          </p>
        </div>
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <nav className="flex flex-wrap gap-4 text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] sm:justify-end">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors duration-200 hover:text-[color:var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Launch dashboard
        </Link>
      </div>
    </header>
  );
}
