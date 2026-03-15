type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <span
      className={`grid h-10 w-10 grid-cols-2 gap-1 rounded-[1.2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-1 shadow-[0_16px_40px_-28px_rgba(35,45,56,0.75)] ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="rounded-full bg-[color:var(--accent)]" />
      <span className="rounded-sm bg-[color:var(--signal)]" />
      <span className="rounded-sm bg-[color:var(--foreground)]/72" />
      <span className="rounded-full border border-[color:var(--foreground)]/14 bg-[color:var(--background)]" />
    </span>
  );
}
