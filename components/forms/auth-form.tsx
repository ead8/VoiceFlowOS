"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { startTransition, useState } from "react";

import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "login" | "signup";
  authReady: boolean;
};

export function AuthForm({ mode, authReady }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!authReady) {
      setError("Better Auth is not configured yet. Add the required environment variables first.");
      return;
    }

    setPending(true);
    setError(null);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const rememberMe = formData.get("rememberMe") === "on";

    if (mode === "signup") {
      const name = String(formData.get("name") ?? "").trim();
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (signUpError) {
        setPending(false);
        setError(signUpError.message ?? "Unable to create your account.");
        return;
      }
    } else {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
        rememberMe,
      });

      if (signInError) {
        setPending(false);
        setError(signInError.message ?? "Unable to sign you in.");
        return;
      }
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });

    setPending(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit(new FormData(event.currentTarget));
  }

  return (
    <div className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-8 shadow-[0_30px_80px_-42px_rgba(32,41,51,0.42)]">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--accent)]">
          {mode === "login" ? "Welcome back" : "Create your workspace"}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
          {mode === "login" ? "Sign in to VoiceFlowOS" : "Launch your first AI phone operation"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
          {mode === "login"
            ? "Use Better Auth email and password sign-in to access your dashboard."
            : "Better Auth will create your owner account, then the dashboard can start provisioning agents and call workflows."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {mode === "signup" ? (
          <label className="grid gap-2">
            <span className="text-sm font-medium">Full name</span>
            <input
              name="name"
              type="text"
              placeholder="Ada Lovelace"
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none transition-colors focus:border-[color:var(--foreground)]"
              required
            />
          </label>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            placeholder="team@voiceflowos.com"
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none transition-colors focus:border-[color:var(--foreground)]"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 outline-none transition-colors focus:border-[color:var(--foreground)]"
            minLength={8}
            required
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-[color:var(--muted-foreground)]">
          <input name="rememberMe" type="checkbox" className="h-4 w-4 rounded border-[color:var(--line)]" />
          Keep me signed in on this device
        </label>

        {error ? (
          <p className="rounded-2xl border border-[color:var(--accent)]/28 bg-[color:var(--accent-soft)] px-4 py-3 text-sm text-[color:var(--foreground)]">
            {error}
          </p>
        ) : null}

        {!authReady ? (
          <p className="rounded-2xl border border-[color:var(--foreground)]/10 bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--muted-foreground)]">
            Authentication is disabled until `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` are set.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !authReady}
          className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--foreground)] bg-[color:var(--foreground)] px-5 py-3 text-sm font-medium text-[color:var(--background)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[color:var(--muted-foreground)]">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-[color:var(--foreground)]">
          {mode === "login" ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
