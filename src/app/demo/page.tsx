import { cookies, headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { DemoForm } from "./demo-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TRIAL_MAX_USES = 3;
const MAX_SESSIONS_PER_IP = 4;

async function getTrialStatus(): Promise<{ remaining: number; max: number }> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const sessionId = cookieStore.get("axion_trial_sid")?.value ?? null;
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  // Cookie session takes priority
  if (sessionId) {
    const { data } = await supabase
      .from("trial_sessions")
      .select("uses_count")
      .eq("session_id", sessionId)
      .single();

    if (data) {
      return {
        remaining: Math.max(0, TRIAL_MAX_USES - data.uses_count),
        max: TRIAL_MAX_USES,
      };
    }
  }

  // Fall back to IP check
  const { data: ipSessions } = await supabase
    .from("trial_sessions")
    .select("uses_count")
    .eq("ip_address", ip);

  const totalIpUses = (ipSessions ?? []).reduce(
    (sum, s) => sum + s.uses_count,
    0,
  );
  const sessionCount = (ipSessions ?? []).length;

  if (sessionCount >= MAX_SESSIONS_PER_IP || totalIpUses >= TRIAL_MAX_USES) {
    return { remaining: 0, max: TRIAL_MAX_USES };
  }

  return {
    remaining: Math.max(0, TRIAL_MAX_USES - totalIpUses),
    max: TRIAL_MAX_USES,
  };
}

export default async function DemoPage() {
  const { remaining, max } = await getTrialStatus();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="font-semibold text-white text-lg">
              Axion Technologies
            </span>
            <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent">
              Invoice extraction demo
            </span>
          </Link>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">
            See it work on your invoice
          </h1>
          <p className="mt-2 text-sm text-muted">
            Upload any invoice — PDF or image — and watch the details get pulled
            out automatically. No signup, no credit card.
          </p>
        </div>

        <DemoForm initialRemaining={remaining} max={max} />

        <p className="mt-6 text-center text-xs text-muted">
          Files are processed and immediately discarded. Nothing is stored.
        </p>
      </div>
    </div>
  );
}
