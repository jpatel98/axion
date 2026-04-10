import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { extractInvoiceData } from "@/lib/invoice-extract";

const TRIAL_MAX_USES = 3;
// How many distinct sessions per IP we allow before treating it as exhausted.
const MAX_SESSIONS_PER_IP = 4;
const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const sessionId = cookieStore.get("axion_trial_sid")?.value ?? null;
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  // ── Resolve session ────────────────────────────────────────────────────────
  // 1. Look up by cookie session ID
  let session: { id: string; uses_count: number } | null = null;

  if (sessionId) {
    const { data } = await supabase
      .from("trial_sessions")
      .select("id, uses_count")
      .eq("session_id", sessionId)
      .single();
    session = data ?? null;
  }

  // 2. If no session from cookie, check if this IP already exhausted its quota
  if (!session) {
    const { data: ipSessions } = await supabase
      .from("trial_sessions")
      .select("uses_count")
      .eq("ip_address", ip);

    const totalIpUses = (ipSessions ?? []).reduce(
      (sum, s) => sum + s.uses_count,
      0,
    );
    const sessionCount = (ipSessions ?? []).length;

    if (
      totalIpUses >= TRIAL_MAX_USES ||
      sessionCount >= MAX_SESSIONS_PER_IP
    ) {
      return NextResponse.json({ error: "trial_exhausted" }, { status: 429 });
    }
  }

  // 3. Check uses on the existing session
  if (session && session.uses_count >= TRIAL_MAX_USES) {
    return NextResponse.json({ error: "trial_exhausted" }, { status: 429 });
  }

  // ── Parse the uploaded file ────────────────────────────────────────────────
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF, JPG, PNG, or WEBP." },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 10 MB." },
      { status: 413 },
    );
  }

  // ── Atomically increment the session counter ───────────────────────────────
  let newSessionId = sessionId;

  if (session) {
    // Increment existing session with an optimistic check
    const { data: updated, error } = await supabase
      .from("trial_sessions")
      .update({ uses_count: session.uses_count + 1 })
      .eq("id", session.id)
      .eq("uses_count", session.uses_count) // optimistic lock
      .select("uses_count")
      .single();

    if (error || !updated) {
      // Race condition — another request already incremented; re-fetch
      const { data: refetched } = await supabase
        .from("trial_sessions")
        .select("uses_count")
        .eq("id", session.id)
        .single();

      if (!refetched || refetched.uses_count >= TRIAL_MAX_USES) {
        return NextResponse.json({ error: "trial_exhausted" }, { status: 429 });
      }
    }
  } else {
    // Create a new session
    const freshId = crypto.randomUUID();
    const { data: created } = await supabase
      .from("trial_sessions")
      .insert({ session_id: freshId, ip_address: ip, uses_count: 1 })
      .select("id")
      .single();

    if (!created) {
      return NextResponse.json(
        { error: "Could not initialise trial session." },
        { status: 500 },
      );
    }
    newSessionId = freshId;
  }

  // ── Run extraction ─────────────────────────────────────────────────────────
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  let extracted;
  try {
    extracted = await extractInvoiceData(fileBuffer, file.type);
  } catch (err) {
    console.error("Extraction failed:", err);
    return NextResponse.json(
      { error: "Extraction failed. Please try a different file." },
      { status: 500 },
    );
  }

  // ── Re-read final uses count to report remaining ───────────────────────────
  const { data: finalSession } = await supabase
    .from("trial_sessions")
    .select("uses_count")
    .eq("session_id", newSessionId)
    .single();

  const usesCount = finalSession?.uses_count ?? TRIAL_MAX_USES;
  const remaining = Math.max(0, TRIAL_MAX_USES - usesCount);

  // ── Build response, set httpOnly cookie ───────────────────────────────────
  const response = NextResponse.json({ extracted, remaining });

  // httpOnly = JS cannot read or delete this cookie
  response.cookies.set("axion_trial_sid", newSessionId!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}

// GET — returns the current trial status without consuming a use.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const sessionId = cookieStore.get("axion_trial_sid")?.value ?? null;
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  if (sessionId) {
    const { data } = await supabase
      .from("trial_sessions")
      .select("uses_count")
      .eq("session_id", sessionId)
      .single();

    if (data) {
      return NextResponse.json({
        remaining: Math.max(0, TRIAL_MAX_USES - data.uses_count),
        max: TRIAL_MAX_USES,
      });
    }
  }

  // Check IP exhaustion
  const { data: ipSessions } = await supabase
    .from("trial_sessions")
    .select("uses_count")
    .eq("ip_address", ip);

  const totalIpUses = (ipSessions ?? []).reduce(
    (sum, s) => sum + s.uses_count,
    0,
  );

  return NextResponse.json({
    remaining: Math.max(0, TRIAL_MAX_USES - totalIpUses),
    max: TRIAL_MAX_USES,
  });
}
