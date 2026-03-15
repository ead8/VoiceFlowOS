"use server";

import { redirect } from "next/navigation";

import { requireWorkspaceAccess } from "@/lib/billing";
import { createLead } from "@/lib/db/leads";
import { requireSession } from "@/lib/session";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createLeadAction(formData: FormData) {
  const session = await requireSession();
  await requireWorkspaceAccess(session.user.id, "/dashboard/leads");

  try {
    await createLead(session.user.id, {
      name: getField(formData, "name"),
      phoneNumber: getField(formData, "phoneNumber"),
      budget: getField(formData, "budget"),
      timeline: getField(formData, "timeline"),
      problem: getField(formData, "problem"),
      location: getField(formData, "location"),
      qualification: (formData.get("qualification") as "high" | "medium" | "low") ?? undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save lead.";
    redirect(`/dashboard/leads?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/leads?success=Lead%20saved.");
}
