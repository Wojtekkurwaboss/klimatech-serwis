import { CalendarCheck, FileBadge, Snowflake, ShieldCheck, MapPin } from "lucide-react";
import { formatPlDate, type DeviceInfo } from "@/config/tenant";

export function DeviceCard({ device }: { device: DeviceInfo }) {
  const rows = [
    { icon: CalendarCheck, label: "Data montażu", value: formatPlDate(device.installedAt) },
    { icon: Snowflake, label: "Czynnik chłodniczy", value: device.refrigerant },
    { icon: FileBadge, label: "Nr w Centralnym Rejestrze Operatorów", value: device.croNumber },
    { icon: MapPin, label: "Lokalizacja", value: device.location },
  ];

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-panel">
      <header className="bg-brand px-5 py-4 text-brand-foreground sm:px-6">
        <p className="font-display text-xs uppercase tracking-[0.18em] text-brand-foreground/70">
          {device.category}
        </p>
        <h2 className="font-display text-2xl font-semibold">{device.model}</h2>
      </header>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 px-5 py-3 sm:px-6">
            <row.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium tabular-nums">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
      <footer className="flex items-center gap-3 border-t border-border bg-success-soft px-5 py-4 sm:px-6">
        <ShieldCheck className="size-5 text-success" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Gwarancja {device.warrantyActive ? "aktywna" : "nieaktywna"}
          </p>
          <p className="text-sm text-muted-foreground">
            ważna do {formatPlDate(device.warrantyUntil)}
          </p>
        </div>
      </footer>
    </article>
  );
}