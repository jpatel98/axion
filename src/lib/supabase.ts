import { createClient } from "@supabase/supabase-js";

// Server-side only — uses service role key which bypasses RLS.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface VendorLink {
  id: string;
  token: string;
  label: string;
  operator_email: string;
  created_at: string;
  expires_at: string | null;
}

export interface InvoiceUpload {
  id: string;
  vendor_link_id: string;
  vendor_name: string;
  vendor_email: string;
  file_path: string;
  file_name: string;
  extracted_data: Record<string, unknown> | null;
  uploaded_at: string;
}
