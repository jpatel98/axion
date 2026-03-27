import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold",
        variant === "primary" &&
          "bg-white text-slate-950 hover:-translate-y-0.5 hover:bg-accent/90",
        variant === "secondary" &&
          "border border-white/12 bg-white/[0.02] text-white hover:border-accent/50 hover:bg-white/[0.06]",
        className,
      )}
    >
      {children}
    </a>
  );
}
