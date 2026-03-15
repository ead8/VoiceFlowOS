import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasBetterAuthConfig } from "@/lib/env";
import { requireAuth } from "@/lib/auth";

export async function getSession() {
  if (!hasBetterAuthConfig()) {
    return null;
  }

  const auth = requireAuth();
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

