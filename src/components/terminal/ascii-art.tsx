import { cn } from "@/lib/utils";

type AsciiArtProps = {
  art: string;
  label: string;
  className?: string;
  mobileHidden?: boolean;
};

export function AsciiArt({
  art,
  label,
  className,
  mobileHidden = true,
}: AsciiArtProps) {
  return (
    <pre
      aria-hidden="true"
      role="img"
      aria-label={label}
      className={cn(
        "select-none text-accent/80 leading-none",
        mobileHidden && "hidden md:block",
        className,
      )}
    >
      {art}
    </pre>
  );
}
