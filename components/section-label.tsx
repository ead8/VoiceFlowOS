type SectionLabelProps = {
  children: React.ReactNode;
};

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span className="inline-flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.34em] text-[color:var(--muted-foreground)]">
      <span className="h-px w-10 bg-[color:var(--foreground)]/22" />
      {children}
    </span>
  );
}
