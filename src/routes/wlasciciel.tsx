import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  CalendarClock,
  CalendarPlus,
  Clock,
  FileWarning,
  MapPin,
  Phone,
  UserPlus,
  UserRound,
  Wrench,
} from "lucide-react";
import { croRequiredTypes, formatPlDate, statusMeta, statusRank } from "@/config/tenant";
import { requireRole } from "@/lib/session";
import { getOwnerOverview } from "@/fns/tenant";
import { Button } from "@/components/ui/button";
import { AddClientDialog } from "@/components/panel/add-client-dialog";
import { AddTechnicianDialog } from "@/components/panel/add-technician-dialog";
import { AddDeviceDialog } from "@/components/panel/add-device-dialog";
import { ScheduleVisitDialog } from "@/components/panel/schedule-visit-dialog";

const description =
  "Panel właściciela KlimaTech Serwis: status zgodności klientów z obowiązkowymi przeglądami i grafik zespołu na dziś.";

export const Route = createFileRoute("/wlasciciel")({
  beforeLoad: () => requireRole("owner"),
  loader: () => getOwnerOverview(),
  head: ({ loaderData }) => {
    const title = `Panel Właściciela – ${loaderData?.company.name ?? "KlimaTech"}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const { company, technicians, clientsOverview } = Route.useLoaderData();
  const [sortAsc, setSortAsc] = useState(true);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addTechnicianOpen, setAddTechnicianOpen] = useState(false);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [addDeviceClientId, setAddDeviceClientId] = useState<string | undefined>(undefined);
  const [scheduleVisitOpen, setScheduleVisitOpen] = useState(false);
  const [scheduleVisitClientId, setScheduleVisitClientId] = useState<string | undefined>(undefined);
  const [scheduleVisitDeviceId, setScheduleVisitDeviceId] = useState<string | undefined>(undefined);

  const allTodayVisits = technicians.flatMap((t) => t.visits);
  const overdueCount = clientsOverview.filter((c) => c.status === "overdue").length;
  const upcomingCount = clientsOverview.filter((c) => c.status === "upcoming").length;
  const croTodayCount = allTodayVisits.filter((v) => croRequiredTypes.includes(v.plannedType)).length;

  const sortedClients = useMemo(() => {
    const copy = [...clientsOverview];
    copy.sort((a, b) => {
      const diff = statusRank[a.status] - statusRank[b.status];
      return sortAsc ? diff : -diff;
    });
    return copy;
  }, [sortAsc]);

  const tiles = [
    {
      icon: AlertTriangle,
      label: "Zaległe przeglądy",
      value: overdueCount,
      badgeClass: "bg-alert/15 text-alert",
    },
    {
      icon: CalendarClock,
      label: "Zbliżające się przeglądy (<14 dni)",
      value: upcomingCount,
      badgeClass: "bg-[oklch(0.88_0.13_85)] text-[oklch(0.32_0.09_75)]",
    },
    {
      icon: FileWarning,
      label: "Wymagane wpisy CRO dziś",
      value: croTodayCount,
      badgeClass: "bg-brand/10 text-brand",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="relative overflow-hidden bg-[image:var(--gradient-brand)] text-brand-foreground shadow-[var(--shadow-lift)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-9 w-auto" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-foreground/10 font-display text-lg font-bold">
                KT
              </span>
            )}
            <div className="leading-tight">
              <p className="font-display text-xl font-semibold tracking-tight">{company.name}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-brand-foreground/70">
                Panel Właściciela
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={`tel:${company.phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-2 text-brand-foreground/85 hover:text-brand-foreground sm:flex"
            >
              <Phone className="size-4" />
              {company.phone}
            </a>
            <span className="flex items-center gap-2 rounded-full bg-brand-foreground/10 px-3 py-1.5">
              <UserRound className="size-4" />
              Właściciel
            </span>
          </div>
        </div>
        <div className="h-[3px] w-full bg-[image:linear-gradient(90deg,transparent,oklch(0.73_0.145_62/0.7),transparent)]" />
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Przegląd firmy</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Status zgodności klientów z obowiązkowymi przeglądami i grafik zespołu na dziś
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddTechnicianOpen(true)}>
              <Wrench className="size-4" />
              Dodaj technika
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddClientOpen(true)}>
              <UserPlus className="size-4" />
              Dodaj klienta
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => {
                setScheduleVisitClientId(undefined);
                setScheduleVisitDeviceId(undefined);
                setScheduleVisitOpen(true);
              }}
            >
              <CalendarPlus className="size-4" />
              Zaplanuj wizytę
            </Button>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex min-w-0 items-start gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-panel transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${tile.badgeClass}`}>
                <tile.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-3xl font-semibold tabular-nums leading-none">
                  {tile.value}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{tile.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <section className="min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                Klienci
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddDeviceClientId(undefined);
                    setAddDeviceOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  + Dodaj urządzenie
                </button>
                <button
                  type="button"
                  onClick={() => setSortAsc((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ArrowUpDown className="size-3.5" />
                  Sortuj wg statusu {sortAsc ? "(najpilniejsze na górze)" : "(najpilniejsze na dole)"}
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-panel">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-semibold sm:px-5">Klient</th>
                      <th className="px-4 py-3 font-semibold sm:px-5">Urządzenie</th>
                      <th className="px-4 py-3 font-semibold sm:px-5">Ostatni przegląd</th>
                      <th className="px-4 py-3 font-semibold sm:px-5">Następny przegląd</th>
                      <th className="px-4 py-3 font-semibold sm:px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedClients.map((client) => {
                      const meta = statusMeta[client.status];
                      return (
                        <tr key={client.id} className="transition-colors hover:bg-accent/40">
                          <td className="px-4 py-3.5 font-medium sm:px-5">{client.clientName}</td>
                          <td className="px-4 py-3.5 text-muted-foreground sm:px-5">
                            {client.deviceModel}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-muted-foreground sm:px-5">
                            {formatPlDate(client.lastReview)}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums font-medium sm:px-5">
                            {formatPlDate(client.nextReviewDue)}
                          </td>
                          <td className="px-4 py-3.5 sm:px-5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                            >
                              {meta.label}
                              {client.status === "overdue" && client.overdueDays
                                ? ` · ${client.overdueDays} dni`
                                : ""}
                              {client.status === "upcoming" && client.dueInDays
                                ? ` · za ${client.dueInDays} dni`
                                : ""}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                Grafik zespołu – dziś
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScheduleVisitClientId(undefined);
                    setScheduleVisitDeviceId(undefined);
                    setScheduleVisitOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  + Zaplanuj wizytę
                </button>
                <button
                  type="button"
                  onClick={() => setAddTechnicianOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  + Dodaj technika
                </button>
              </div>
            </div>

            {technicians.length === 0 ? (
              <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-card p-5 text-center shadow-panel">
                <p className="text-sm text-muted-foreground">
                  Brak techników — dodaj pierwszego, aby zobaczyć grafik.
                </p>
                <Button variant="brand" size="sm" onClick={() => setAddTechnicianOpen(true)}>
                  <Wrench className="size-4" />
                  Dodaj technika
                </Button>
              </div>
            ) : (
              technicians.map((technician) => (
                <div
                  key={technician.id}
                  className="space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-panel"
                >
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-brand">
                      <UserRound className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {technician.firstName} {technician.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{technician.role}</p>
                    </div>
                    <span className="ml-auto shrink-0 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground">
                      {technician.visits.length} wizyt
                    </span>
                  </div>
                  {technician.visits.length === 0 ? (
                    <p className="py-2 text-center text-xs text-muted-foreground">Brak wizyt dziś</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {technician.visits.map((visit) => (
                        <li
                          key={visit.id}
                          className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3 text-sm"
                        >
                          <span className="flex shrink-0 items-center gap-1 rounded-md bg-card px-2 py-1 font-display text-xs font-semibold tabular-nums text-brand shadow-sm">
                            <Clock className="size-3.5" />
                            {visit.time}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{visit.clientName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              <MapPin className="mr-1 inline size-3 shrink-0" />
                              {visit.address}
                            </p>
                          </div>
                          {croRequiredTypes.includes(visit.plannedType) && (
                            <span className="shrink-0 rounded-full bg-alert/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-alert">
                              CRO
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      <AddClientDialog
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onAddDeviceRequested={(clientId) => {
          setAddDeviceClientId(clientId);
          setAddDeviceOpen(true);
        }}
      />
      <AddTechnicianDialog open={addTechnicianOpen} onOpenChange={setAddTechnicianOpen} />
      <AddDeviceDialog
        open={addDeviceOpen}
        onOpenChange={setAddDeviceOpen}
        preselectedClientId={addDeviceClientId}
        onScheduleVisitRequested={(clientId, deviceId) => {
          setScheduleVisitClientId(clientId);
          setScheduleVisitDeviceId(deviceId);
          setScheduleVisitOpen(true);
        }}
      />
      <ScheduleVisitDialog
        open={scheduleVisitOpen}
        onOpenChange={setScheduleVisitOpen}
        preselectedClientId={scheduleVisitClientId}
        preselectedDeviceId={scheduleVisitDeviceId}
      />

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <span>
            © {new Date().getFullYear()} {company.name}
          </span>
          <a href={`mailto:${company.email}`} className="hover:text-brand">
            {company.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
