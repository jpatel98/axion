import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/links
// Protected by OPERATOR_SECRET header.
// Body: { label: string; operator_email: string; expires_in_days?: number }
// Returns: { token: string; url: string }

export async function POST(request: Request) {
  const secret = request.headers.get("x-operator-secret");
  if (!secret || secret !== process.env.OPERATOR_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).label !== "string" ||
    typeof (body as Record<string, unknown>).operator_email !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required fields: label, operator_email" },
      { status: 400 },
    );
  }

  const { label, operator_email, expires_in_days } = body as {
    label: string;
    operator_email: string;
    expires_in_days?: number;
  };

  const expires_at =
    typeof expires_in_days === "number" && expires_in_days > 0
      ? new Date(Date.now() + expires_in_days * 86_400_000).toISOString()
      : null;

  const { data, error } = await supabase
    .from("vendor_links")
    .insert({ label, operator_email, expires_at })
    .select("token")
    .single();

  if (error || !data) {
    console.error("Failed to create vendor link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 },
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://axiontechnologies.ca";

  return NextResponse.json({
    token: data.token,
    url: `${siteUrl}/upload/${data.token}`,
  });
}
