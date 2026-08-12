import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertBanner({
  title,
  message,
  ctaLabel,
  onCta,
}: {
  title: string;
  message: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <section
      role="alert"
      className="rounded-xl border-l-[5px] border-alert bg-[image:linear-gradient(120deg,var(--alert-soft)_0%,oklch(0.97_0.02_60)_100%)] p-5 shadow-[var(--shadow-lift)] sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[image:linear-gradient(145deg,oklch(0.78_0.15_62),oklch(0.68_0.14_60))] text-alert-foreground shadow-md ring-1 ring-black/5">
          <AlertTriangle className="size-6" />
        </div>
        <div className="flex-1">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-alert">
            {title}
          </p>
          <p className="mt-1 text-base font-medium leading-snug text-foreground">{message}</p>
        </div>
        <Button variant="alert" size="lg" className="shrink-0" onClick={onCta}>
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}