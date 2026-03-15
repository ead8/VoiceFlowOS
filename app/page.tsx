import Link from "next/link";

import { SectionLabel } from "@/components/section-label";
import { SiteHeader } from "@/components/site-header";
import {
  architectureLayers,
  featureTracks,
  heroMetrics,
  mvpTimeline,
  pricingTiers,
  roadmapPhases,
  workflowSteps,
} from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <SiteHeader />

        <section className="grid gap-12 border-b border-[color:var(--line)] py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="reveal">
            <SectionLabel>Voice operations, simplified</SectionLabel>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
              The operating system for AI phone agents.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)] sm:text-xl">
              VoiceFlowOS gives businesses a no-code way to create, deploy, and manage AI assistants that answer calls,
              speak naturally, and feed every conversation back into an actionable dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-6 py-3 text-sm font-medium text-[color:var(--background)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                View pricing
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--foreground)]/18 bg-[color:var(--surface)] px-6 py-3 text-sm font-medium text-[color:var(--foreground)] transition-colors duration-200 hover:border-[color:var(--foreground)]/30"
              >
                Open workspace
              </Link>
              <a
                href="#architecture"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--foreground)]/18 bg-[color:var(--surface)] px-6 py-3 text-sm font-medium text-[color:var(--foreground)] transition-colors duration-200 hover:border-[color:var(--foreground)]/30"
              >
                Review architecture
              </a>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {heroMetrics.map((metric, index) => (
                <article
                  key={metric.label}
                  className="reveal border-t-2 border-[color:var(--foreground)] bg-[color:var(--surface)] p-5"
                  style={{ animationDelay: `${120 + index * 90}ms` }}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                    {metric.label}
                  </p>
                  <p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{metric.value}</p>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">{metric.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <aside
            className="reveal noise overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[0_30px_80px_-42px_rgba(32,41,51,0.5)]"
            style={{ animationDelay: "180ms" }}
          >
            <div className="flex items-center justify-between border-b border-[color:var(--line)] pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
                  Core loop
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Inbound call to logged outcome</h2>
              </div>
              <span className="rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]">
                MVP
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="grid gap-3 border-l border-[color:var(--line)] pl-4 sm:grid-cols-[auto_1fr]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--foreground)] text-sm font-medium text-[color:var(--background)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]/86">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Better Auth", "Polar", "Twilio", "Retell AI"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)]/72 px-4 py-3 text-sm font-medium text-[color:var(--foreground)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="mvp" className="grid gap-10 border-b border-[color:var(--line)] py-[4.5rem] lg:grid-cols-[0.72fr_1.28fr] lg:py-20">
          <div className="reveal">
            <SectionLabel>Phase 1 focus</SectionLabel>
            <h2 className="mt-6 max-w-xl text-4xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              Built around one proof point: no business call should go unanswered.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--muted-foreground)] sm:text-lg">
              The MVP is intentionally narrow. It proves the most important loop first: inbound call, AI response,
              conversation, and a clean operational record inside the owner dashboard.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featureTracks.map((feature, index) => (
              <article
                key={feature.title}
                className={`reveal border border-[color:var(--line)] bg-[color:var(--surface)] p-6 ${index % 2 === 1 ? "md:translate-y-10" : ""}`}
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-[color:var(--accent)]">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-4 text-2xl leading-snug font-semibold tracking-[-0.03em]">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-[color:var(--line)] py-[4.5rem] lg:grid-cols-[0.62fr_1.38fr] lg:py-20">
          <div className="reveal">
            <SectionLabel>MVP timeline</SectionLabel>
            <h2 className="mt-6 max-w-lg text-4xl leading-tight font-semibold tracking-[-0.04em] text-balance">
              Four focused weeks to get the first production loop working.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {mvpTimeline.map((item, index) => (
              <article
                key={item.label}
                className="reveal border-t-2 border-[color:var(--accent)] bg-[color:var(--surface-strong)] p-6"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
                  {item.label}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{item.focus}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="border-b border-[color:var(--line)] py-[4.5rem] lg:py-20">
          <div className="reveal max-w-3xl">
            <SectionLabel>System architecture</SectionLabel>
            <h2 className="mt-6 text-4xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              A product shell on top, a voice pipeline underneath, and automation hooks ready for growth.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {architectureLayers.map((layer, index) => (
              <article
                key={layer.title}
                className="reveal border border-[color:var(--line)] bg-[color:var(--surface)] p-6"
                style={{ animationDelay: `${index * 95}ms` }}
              >
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-[color:var(--accent)]">
                  {layer.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">{layer.note}</p>
                <ul className="mt-6 space-y-3 text-sm leading-6 text-[color:var(--foreground)]/90">
                  {layer.items.map((item) => (
                    <li key={item} className="border-t border-[color:var(--foreground)]/10 pt-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="border-b border-[color:var(--line)] py-[4.5rem] lg:py-20">
          <div className="reveal max-w-3xl">
            <SectionLabel>Product roadmap</SectionLabel>
            <h2 className="mt-6 text-4xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              From a useful phone assistant to the platform layer for AI-powered customer conversations.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {roadmapPhases.map((phase, index) => (
              <article
                key={phase.title}
                className="reveal border border-[color:var(--line)] bg-[color:var(--surface)] p-7"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em]">{phase.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted-foreground)]">
                      {phase.goal}
                    </p>
                  </div>
                  <span className="rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--background)] px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
                    {phase.duration}
                  </span>
                </div>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {phase.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)]/75 px-4 py-3 text-sm leading-6"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="grid gap-10 py-[4.5rem] lg:grid-cols-[0.72fr_1.28fr] lg:py-20">
          <div className="reveal">
            <SectionLabel>Monetization</SectionLabel>
            <h2 className="mt-6 text-4xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              Pricing that starts with validation and expands with the business.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {pricingTiers.map((tier, index) => (
              <article
                key={tier.name}
                className={`reveal flex h-full flex-col justify-between border p-6 ${
                  tier.highlight
                    ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
                    : "border-[color:var(--line)] bg-[color:var(--surface)]"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.32em] ${
                      tier.highlight ? "text-[color:var(--accent-soft)]" : "text-[color:var(--accent)]"
                    }`}
                  >
                    {tier.name}
                  </p>
                  <p className="mt-5 text-4xl font-semibold tracking-[-0.04em]">{tier.price}</p>
                  <p
                    className={`mt-4 text-sm leading-7 ${
                      tier.highlight ? "text-[color:var(--background)]/80" : "text-[color:var(--muted-foreground)]"
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>
                <p
                  className={`mt-8 border-t pt-4 text-sm font-medium ${
                    tier.highlight ? "border-[color:var(--background)]/15 text-[color:var(--background)]" : "border-[color:var(--foreground)]/10"
                  }`}
                >
                  {tier.allowance}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-[color:var(--line)] py-8 text-sm text-[color:var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
          <p>VoiceFlowOS is designed to help businesses deploy AI phone agents in minutes instead of assembling voice infrastructure by hand.</p>
          <Link href="/dashboard" className="font-medium text-[color:var(--foreground)] transition-opacity duration-200 hover:opacity-70">
            Explore the dashboard prototype
          </Link>
        </footer>
      </div>
    </main>
  );
}
