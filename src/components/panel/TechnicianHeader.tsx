import { Link } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";

export function TechnicianHeader({
  backTo,
  company,
  technician,
}: {
  backTo?: string;
  company: { name: string; logoUrl: string | null };
  technician: { firstName: string; lastName: string };
}) {
  return (
    <header className="sticky top-0 z-20 bg-[image:var(--gradient-brand)] text-brand-foreground shadow-[var(--shadow-lift)]">
      <div className="mx-auto grid max-w-2xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        {backTo ? (
          <Link
            to="/technik"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-foreground/10 transition-colors hover:bg-brand-foreground/20"
            aria-label="Wróć do listy wizyt"
          >
            <ArrowLeft className="size-4" />
          </Link>
        ) : company.logoUrl ? (
          <img src={company.logoUrl} alt={company.name} className="size-9 shrink-0 rounded-lg" />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-foreground/10 font-display text-sm font-bold ring-1 ring-white/10">
            KT
          </span>
        )}
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-base font-semibold">{company.name}</p>
          <p className="truncate text-[11px] uppercase tracking-[0.2em] text-brand-foreground/70">
            Panel Technika
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-foreground/10 px-2.5 py-1 text-xs">
          <UserRound className="size-3.5" />
          {technician.firstName} {technician.lastName}
        </span>
      </div>
    </header>
  );
}
