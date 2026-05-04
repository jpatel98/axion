import { NextResponse } from "next/server";
import {
  normalizeLeadForm,
  validateLeadForm,
  type LeadSubmitResult,
} from "@/lib/lead";

const webhookUrl = process.env.LEAD_WEBHOOK_URL;
const webhookSecret = process.env.LEAD_WEBHOOK_SECRET;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json<LeadSubmitResult>(
      {
        status: "error",
        message: "We could not read the form submission. Please try again.",
      },
      { status: 400 },
    );
  }

  const values = normalizeLeadForm(payload);
  const fieldErrors = validateLeadForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json<LeadSubmitResult>(
      {
        status: "error",
        message: "Please review the form and try again.",
        fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!webhookUrl) {
    return NextResponse.json<LeadSubmitResult>(
      {
        status: "error",
        message:
          "Lead capture is temporarily unavailable. Please use booking or email for now.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret
          ? { "x-axion-webhook-secret": webhookSecret }
          : undefined),
      },
      body: JSON.stringify({
        source: "axiontechnologies.ca",
        submittedAt: new Date().toISOString(),
        lead: values,
        context: {
          userAgent: request.headers.get("user-agent"),
          referer: request.headers.get("referer"),
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json<LeadSubmitResult>(
        {
          status: "error",
          message:
            "We could not send the form right now. Please use booking or email instead.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json<LeadSubmitResult>({
      status: "success",
      message:
        "Thanks. Your assessment intake was sent successfully. We will follow up shortly.",
    });
  } catch {
    return NextResponse.json<LeadSubmitResult>(
      {
        status: "error",
        message:
          "We could not send the form right now. Please use booking or email instead.",
      },
      { status: 502 },
    );
  }
}
