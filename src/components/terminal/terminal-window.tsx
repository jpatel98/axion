import { cn } from "@/lib/utils";

type TerminalWindowProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function TerminalWindow({
  title,
  children,
  className,
}: TerminalWindowProps) {
  return (
    <div
      className={cn("overflow-hidden border border-accent/20 bg-[#030508]", className)}
    >
      <div className="flex items-center gap-2 border-b border-accent/10 bg-accent/[0.03] px-4 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs tracking-wider text-muted">
          {title}
        </span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}
