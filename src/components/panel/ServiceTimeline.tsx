import { FileText, Wrench, ClipboardCheck, Droplets, HardHat } from "lucide-react";
import { formatPlDate, type ServiceEntry, type ServiceType } from "@/config/tenant";

const typeMeta: Record<ServiceType, { icon: typeof Wrench; className: string }> = {
  "montaż": { icon: HardHat, className: "bg-brand text-brand-foreground" },
  "przegląd": { icon: ClipboardCheck, className: "bg-accent text-accent-foreground" },
  "naprawa": { icon: Wrench, className: "bg-alert text-alert-foreground" },
  "uzupełnienie czynnika": { icon: Droplets, className: "bg-secondary text-secondary-foreground" },
};

export function ServiceTimeline({ entries }: { entries: ServiceEntry[] }) {
  return (
    <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-border">
      {entries.map((entry) => {
        const meta = typeMeta[entry.type];
        return (
          <li key={entry.id} className="relative flex gap-4">
            <span
              className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full shadow-md ring-4 ring-background ${meta.className}`}
            >
              <meta.icon className="size-4" />
            </span>
            <div className="flex-1 rounded-xl border border-border/70 bg-card p-4 shadow-panel transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-semibold uppercase tracking-wide">
                    {entry.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPlDate(entry.date)}
                    {entry.technician ? ` · technik ${entry.technician}` : ""}
                  </p>
                </div>
                <a
                  href={entry.protocolUrl}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-accent"
                >
                  <FileText className="size-3.5" />
                  Protokół PDF
                </a>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}