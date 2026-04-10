import { supabase } from "@/lib/supabase";
import { UploadForm } from "./upload-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function VendorUploadPage({ params }: Props) {
  const { token } = await params;

  const { data: link } = await supabase
    .from("vendor_links")
    .select("label, expires_at")
    .eq("token", token)
    .single();

  if (!link) {
    return (
      <Shell>
        <ErrorCard
          title="Link not found"
          message="This upload link doesn't exist. Please ask your contact for a valid link."
        />
      </Shell>
    );
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return (
      <Shell>
        <ErrorCard
          title="Link expired"
          message="This upload link has expired. Please ask your contact for a new one."
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <UploadForm token={token} label={link.label} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-semibold text-white text-lg">
            Axion Technologies
          </span>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-accent">
            Vendor Invoice Portal
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-strong p-8 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}
