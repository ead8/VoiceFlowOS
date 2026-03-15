import Link from "next/link";

type PaywallCardProps = {
  title?: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function PaywallCard({
  title = "Billing needs attention before this workspace can keep operating.",
  description,
  ctaHref = "/dashboard/billing",
  ctaLabel = "Open billing",
}: PaywallCardProps) {
  return (
    <section className="rounded-[2rem] border border-[color:var(--accent)]/22 bg-[color:var(--surface)] p-8">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent)]">Workspace access</p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-[-0.04em]">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">{description}</p>
      <div className="mt-8">
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)]"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
