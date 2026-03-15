import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

const handlers = auth ? toNextJsHandler(auth) : null;

function notConfigured() {
  return NextResponse.json(
    {
      error: "Better Auth is not configured. Add DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  return handlers ? handlers.GET(request) : notConfigured();
}

export async function POST(request: Request) {
  return handlers ? handlers.POST(request) : notConfigured();
}

export async function PATCH(request: Request) {
  return handlers ? handlers.PATCH(request) : notConfigured();
}

export async function PUT(request: Request) {
  return handlers ? handlers.PUT(request) : notConfigured();
}

export async function DELETE(request: Request) {
  return handlers ? handlers.DELETE(request) : notConfigured();
}

