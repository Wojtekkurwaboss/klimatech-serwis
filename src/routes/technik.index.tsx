import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, ChevronRight, StickyNote } from "lucide-react";
import { TechnicianHeader } from "@/components/panel/TechnicianHeader";
import { todayVisits } from "@/config/tenant";

const title = "Panel Technika – KlimaTech Serwis";
const description =
  "Mobilny panel technika KlimaTech Serwis: lista wizyt na dziś, notatki z poprzednich wizyt i zamykanie zleceń.";

export const Route = createFileRoute("/technik/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TechnicianVisits,
});

function TechnicianVisits() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <TechnicianHeader />
      <main className="mx-auto max-w-2xl px-4 py-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h1 className="truncate font-display text-2xl font-semibold tracking-tight">
            Wizyty na dziś
          </h1>
          <span className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
            {todayVisits.length} wizyt
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {todayVisits.map((visit) => (
            <li key={visit.id}>
              <Link
                to="/technik/$visitId"
                params={{ visitId: visit.id }}
                className="block rounded-xl border border-border bg-card p-4 shadow-panel transition-colors active:bg-accent/50"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-secondary px-2 py-1 font-display text-sm font-semibold tabular-nums text-brand">
                    <Clock className="size-3.5" />
                    {visit.time}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{visit.clientName}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      {visit.address}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">{visit.deviceModel}</p>
                <p className="text-xs text-muted-foreground">{visit.deviceCategory}</p>
                <p className="mt-2 flex gap-2 rounded-md bg-secondary/70 p-2 text-xs text-muted-foreground">
                  <StickyNote className="mt-0.5 size-3.5 shrink-0" />
                  <span className="min-w-0">{visit.lastVisitNote}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}