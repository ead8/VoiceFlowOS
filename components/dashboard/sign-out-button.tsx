"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="rounded-full border border-[color:var(--foreground)]/12 px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition-colors duration-200 hover:border-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}

