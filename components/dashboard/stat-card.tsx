type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="border-t-2 border-[color:var(--foreground)] bg-[color:var(--surface)] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{value}</p>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">{detail}</p>
    </article>
  );
}

