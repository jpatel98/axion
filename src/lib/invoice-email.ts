import { Resend } from "resend";
import type { ExtractedInvoice } from "./invoice-extract";

const resend = new Resend(process.env.RESEND_API_KEY!);

function fmt(n: number | null, currency: string | null): string {
  if (n == null) return "—";
  const symbol = currency && currency.length <= 3 ? `${currency} ` : "";
  return `${symbol}${n.toFixed(2)}`;
}

function buildHtml(opts: {
  label: string;
  vendorName: string;
  vendorEmail: string;
  fileName: string;
  fileUrl: string;
  extracted: ExtractedInvoice;
}): string {
  const { label, vendorName, vendorEmail, fileName, fileUrl, extracted } = opts;
  const c = extracted.currency;

  const lineItemsHtml =
    extracted.line_items.length > 0
      ? `
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:7px 10px;border:1px solid #e5e7eb;text-align:left;">Description</th>
            <th style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;">Qty</th>
            <th style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;">Unit Price</th>
            <th style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${extracted.line_items
            .map(
              (item) => `
          <tr>
            <td style="padding:7px 10px;border:1px solid #e5e7eb;">${item.description}</td>
            <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;">${item.quantity ?? "—"}</td>
            <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;">${fmt(item.unit_price, c)}</td>
            <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;">${fmt(item.amount, c)}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>`
      : `<p style="font-size:13px;color:#6b7280;">No line items extracted.</p>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#111827;max-width:620px;margin:0 auto;padding:32px 24px;">
  <div style="border-left:4px solid #7dd3fc;padding-left:16px;margin-bottom:28px;">
    <p style="margin:0 0 2px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Vendor Invoice Portal</p>
    <h1 style="margin:0;font-size:22px;font-weight:700;">New Invoice Received</h1>
    <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">Link: <strong>${label}</strong></p>
  </div>

  <table style="width:100%;font-size:14px;margin-bottom:24px;border-collapse:collapse;">
    <tr><td style="padding:5px 0;color:#6b7280;width:140px;vertical-align:top;">Submitted by</td><td><strong>${vendorName}</strong> &lt;${vendorEmail}&gt;</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;vertical-align:top;">Vendor on invoice</td><td>${extracted.vendor_name ?? vendorName}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;vertical-align:top;">Invoice #</td><td>${extracted.invoice_number ?? "—"}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;vertical-align:top;">Invoice date</td><td>${extracted.invoice_date ?? "—"}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;vertical-align:top;">Due date</td><td>${extracted.due_date ?? "—"}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;vertical-align:top;">Total</td><td><strong style="font-size:18px;">${fmt(extracted.total, c)}</strong></td></tr>
  </table>

  <h2 style="font-size:14px;font-weight:600;margin-bottom:6px;">Line Items</h2>
  ${lineItemsHtml}

  ${
    extracted.notes
      ? `<p style="font-size:13px;color:#374151;margin-top:16px;"><strong>Notes:</strong> ${extracted.notes}</p>`
      : ""
  }

  <div style="margin-top:28px;padding:16px;background:#f9fafb;border-radius:8px;font-size:13px;border:1px solid #e5e7eb;">
    <p style="margin:0 0 8px;"><strong>Original file:</strong> ${fileName}</p>
    <a href="${fileUrl}" style="color:#0284c7;font-weight:500;">Download Invoice ↗</a>
    <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Download link valid for 7 days.</p>
  </div>

  <p style="margin-top:36px;font-size:12px;color:#9ca3af;">Axion Technologies · Vendor Invoice Portal</p>
</body>
</html>`;
}

export async function sendInvoiceNotification(opts: {
  operatorEmail: string;
  label: string;
  vendorName: string;
  vendorEmail: string;
  fileName: string;
  fileUrl: string;
  extracted: ExtractedInvoice;
}) {
  const { operatorEmail, vendorName, extracted } = opts;

  const subject = [
    `Invoice from ${vendorName}`,
    extracted.invoice_number ? `#${extracted.invoice_number}` : null,
    extracted.total != null ? `— ${fmt(extracted.total, extracted.currency)}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Axion Invoices <onboarding@resend.dev>",
    to: operatorEmail,
    subject,
    html: buildHtml(opts),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
