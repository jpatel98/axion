import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  theme?: "dark" | "light";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "dark",
  className,
}: SectionHeadingProps) {
  const isLight = theme === "light";

  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="text-xs uppercase tracking-[0.2em]">
        <span aria-hidden="true" className="text-accent">
          ${" "}
        </span>
        <span className={isLight ? "text-slate-500" : "text-muted-strong"}>
          axion
        </span>
        <span className={isLight ? "text-slate-400" : "text-muted"}>
          {" "}--
        </span>
        <span className="text-accent">{eyebrow.toLowerCase()}</span>
      </p>
      <h2
        className={cn(
          "glow-text mt-4 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl",
          isLight ? "text-slate-950" : "text-white",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-4 text-sm leading-7 sm:text-base sm:leading-8",
          isLight ? "text-slate-600" : "text-muted-strong",
        )}
      >
        {description}
      </p>
      <div
        aria-hidden="true"
        className={cn(
          "mt-4 text-xs",
          isLight ? "text-slate-300" : "text-accent/20",
          align === "center" && "mx-auto max-w-xs",
        )}
      >
        ────────────────────────────
      </div>
    </div>
  );
}
