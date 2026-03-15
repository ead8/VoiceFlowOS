"use server";

import { redirect } from "next/navigation";

import { requireWorkspaceAccess } from "@/lib/billing";
import { createKnowledgeDocument } from "@/lib/db/knowledge";
import { requireSession } from "@/lib/session";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createKnowledgeDocumentAction(formData: FormData) {
  const session = await requireSession();
  await requireWorkspaceAccess(session.user.id, "/dashboard/knowledge");

  try {
    await createKnowledgeDocument(session.user.id, {
      title: getField(formData, "title"),
      sourceType: (formData.get("sourceType") as "pdf" | "text" | "faq") ?? "text",
      content: getField(formData, "content"),
      sourceUrl: getField(formData, "sourceUrl"),
      agentId: getField(formData, "agentId"),
      status: "ready",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save knowledge.";
    redirect(`/dashboard/knowledge?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/knowledge?success=Knowledge%20saved.");
}
