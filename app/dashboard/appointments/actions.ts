"use server";

import { redirect } from "next/navigation";

import { requireWorkspaceAccess } from "@/lib/billing";
import { createAppointment } from "@/lib/db/appointments";
import { requireSession } from "@/lib/session";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createAppointmentAction(formData: FormData) {
  const session = await requireSession();
  await requireWorkspaceAccess(session.user.id, "/dashboard/appointments");

  try {
    const scheduledFor = getField(formData, "scheduledFor");
    const scheduledDate = new Date(scheduledFor);

    await createAppointment(session.user.id, {
      agentId: getField(formData, "agentId"),
      provider: getField(formData, "provider"),
      externalEventId: getField(formData, "externalEventId"),
      contactName: getField(formData, "contactName"),
      contactPhone: getField(formData, "contactPhone"),
      scheduledFor: scheduledDate.toISOString(),
      notes: getField(formData, "notes"),
      status: (formData.get("status") as "scheduled" | "completed" | "cancelled") ?? "scheduled",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save appointment.";
    redirect(`/dashboard/appointments?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/appointments?success=Appointment%20saved.");
}
