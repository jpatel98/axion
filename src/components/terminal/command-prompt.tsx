import { cn } from "@/lib/utils";

type CommandPromptProps = {
  command: string;
  className?: string;
};

export function CommandPrompt({ command, className }: CommandPromptProps) {
  return (
    <span className={cn("text-xs uppercase tracking-[0.2em]", className)}>
      <span aria-hidden="true" className="text-accent">
        ${" "}
      </span>
      <span className="text-muted-strong">axion</span>
      <span className="text-muted"> --</span>
      <span className="text-accent">{command}</span>
    </span>
  );
}
