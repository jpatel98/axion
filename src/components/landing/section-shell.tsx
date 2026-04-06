import { cn } from "@/lib/utils";

type SectionShellProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

type SectionInnerProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionShell({
  children,
  className,
  id,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-24", className)}>
      {children}
    </section>
  );
}

export function SectionInner({ children, className }: SectionInnerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
