import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { extractInvoiceData } from "@/lib/invoice-extract";
import { sendInvoiceNotification } from "@/lib/invoice-email";

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /api/upload
// Multipart form: token, vendor_name, vendor_email, file
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const token = form.get("token");
  const vendorName = form.get("vendor_name");
  const vendorEmail = form.get("vendor_email");
  const file = form.get("file");

  if (
    typeof token !== "string" ||
    typeof vendorName !== "string" ||
    typeof vendorEmail !== "string" ||
    !(file instanceof File)
  ) {
    return NextResponse.json(
      { error: "Missing required fields: token, vendor_name, vendor_email, file" },
      { status: 400 },
    );
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

  // Validate the token
  const { data: link, error: linkError } = await supabase
    .from("vendor_links")
    .select("id, label, operator_email, expires_at")
    .eq("token", token)
    .single();

  if (linkError || !link) {
    return NextResponse.json(
      { error: "This upload link is invalid." },
      { status: 404 },
    );
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This upload link has expired." },
      { status: 410 },
    );
  }

  // Upload file to Supabase Storage
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${link.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload failed:", uploadError);
    return NextResponse.json(
      { error: "Failed to store the file. Please try again." },
      { status: 500 },
    );
  }

  // Extract invoice data with Gemini
  let extracted;
  try {
    extracted = await extractInvoiceData(fileBuffer, file.type);
  } catch (err) {
    console.error("Extraction failed:", err);
    // Continue without extracted data — don't block the upload
    extracted = {
      vendor_name: null,
      invoice_number: null,
      invoice_date: null,
      due_date: null,
      line_items: [],
      subtotal: null,
      tax: null,
      total: null,
      currency: null,
      notes: null,
    };
  }

  // Persist the upload record
  const { error: dbError } = await supabase.from("invoice_uploads").insert({
    vendor_link_id: link.id,
    vendor_name: vendorName,
    vendor_email: vendorEmail,
    file_path: storagePath,
    file_name: file.name,
    extracted_data: extracted,
  });

  if (dbError) {
    console.error("DB insert failed:", dbError);
    // Not fatal — email will still go out
  }

  // Generate a 7-day signed URL for the download link in the email
  const { data: signedUrlData } = await supabase.storage
    .from("invoices")
    .createSignedUrl(storagePath, 7 * 24 * 3600);

  const fileUrl = signedUrlData?.signedUrl ?? "";

  // Send email to operator
  try {
    await sendInvoiceNotification({
      operatorEmail: link.operator_email,
      label: link.label,
      vendorName,
      vendorEmail,
      fileName: file.name,
      fileUrl,
      extracted,
    });
  } catch (err) {
    console.error("Email send failed:", err);
    // Still return success to the vendor — the file is safely stored
  }

  return NextResponse.json({ status: "success" });
}
