-- Run this in your Supabase project's SQL editor.

-- 1. Vendor links — each row represents a unique upload URL given to a vendor.
create table if not exists vendor_links (
  id            uuid primary key default gen_random_uuid(),
  token         uuid unique not null default gen_random_uuid(),
  label         text not null,           -- human label so you know which link is which
  operator_email text not null,          -- where to send invoice notifications
  created_at    timestamptz not null default now(),
  expires_at    timestamptz             -- null = never expires
);

-- 2. Invoice uploads — one row per file a vendor submits.
create table if not exists invoice_uploads (
  id              uuid primary key default gen_random_uuid(),
  vendor_link_id  uuid not null references vendor_links(id) on delete cascade,
  vendor_name     text not null,
  vendor_email    text not null,
  file_path       text not null,   -- path inside the "invoices" storage bucket
  file_name       text not null,   -- original filename shown in emails
  extracted_data  jsonb,           -- parsed invoice fields from Gemini
  uploaded_at     timestamptz not null default now()
);

-- 3. Free trial sessions — tracks usage per visitor to enforce the trial limit.
--    The server sets an httpOnly cookie (axion_trial_sid) as the primary key.
--    IP address is a secondary check in case cookies are cleared.
create table if not exists trial_sessions (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid unique not null,
  ip_address  text,
  uses_count  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 4. Storage bucket — create a PRIVATE bucket named "invoices" via the Supabase
--    dashboard (Storage → New bucket → name: invoices, Public: OFF).
--    The server uses the service role key so it can bypass RLS.
