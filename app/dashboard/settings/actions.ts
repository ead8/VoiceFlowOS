"use server";

import { redirect } from "next/navigation";

import { upsertBusinessProfile } from "@/lib/db/business-profile";
import { requireSession } from "@/lib/session";

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveBusinessProfileAction(formData: FormData) {
  const session = await requireSession();
  const languages = getField(formData, "languages")
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);

  try {
    await upsertBusinessProfile(session.user.id, {
      companyName: getField(formData, "companyName"),
      industry: getField(formData, "industry"),
      businessPhone: getField(formData, "businessPhone"),
      timezone: getField(formData, "timezone") || "Africa/Nairobi",
      transferPhoneNumber: getField(formData, "transferPhoneNumber"),
      spamScreeningEnabled: formData.get("spamScreeningEnabled") === "on",
      voicemailDetectionEnabled: formData.get("voicemailDetectionEnabled") === "on",
      languages: languages.length > 0 ? languages : ["English"],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save business settings.";
    redirect(`/dashboard/settings?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard/settings?success=Settings%20saved.");
}
