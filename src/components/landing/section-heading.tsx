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
      <p
        className={cn(
          "font-mono text-[0.72rem] uppercase tracking-[0.32em]",
          isLight ? "text-slate-500" : "text-accent",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl",
          isLight ? "text-slate-950" : "text-white",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-5 text-base leading-8 sm:text-lg",
          isLight ? "text-slate-600" : "text-muted-strong",
        )}
      >
        {description}
      </p>
    </div>
  );
}
