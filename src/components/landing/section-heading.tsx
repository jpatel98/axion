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
      <p className={cn(
        "text-sm font-semibold uppercase tracking-[0.1em]",
        isLight ? "text-blue-600" : "text-accent",
      )}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl",
          isLight ? "text-slate-950" : "text-white",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-4 text-base leading-7 sm:text-lg sm:leading-8",
          isLight ? "text-slate-600" : "text-muted-strong",
        )}
      >
        {description}
      </p>
    </div>
  );
}
