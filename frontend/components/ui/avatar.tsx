import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  className
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-md",
        className
      )}
    >
      {initials}
    </div>
  );
}
