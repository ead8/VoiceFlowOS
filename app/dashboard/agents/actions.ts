"use server";

import { redirect } from "next/navigation";

import { requireWorkspaceAccess } from "@/lib/billing";
import { createAgent } from "@/lib/db/agents";
import { requireSession } from "@/lib/session";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createAgentAction(formData: FormData) {
  const session = await requireSession();
  await requireWorkspaceAccess(session.user.id, "/dashboard/agents/new");

  try {
    await createAgent(session.user.id, {
      name: getField(formData, "name"),
      voice: getField(formData, "voice"),
      instructions: getField(formData, "instructions"),
      phoneNumber: getField(formData, "phoneNumber"),
      status: (formData.get("status") as "draft" | "active" | "paused") ?? "draft",
      retellAgentId: getField(formData, "retellAgentId"),
      retellPhoneNumber: getField(formData, "retellPhoneNumber"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the agent.";
    redirect(`/dashboard/agents/new?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/agents?success=Agent%20created.");
}
