import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Phone, UserRound } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AlertBanner } from "@/components/panel/AlertBanner";
import { DeviceCard } from "@/components/panel/DeviceCard";
import { ServiceTimeline } from "@/components/panel/ServiceTimeline";
import { DocumentsList } from "@/components/panel/DocumentsList";
import { FailureReportDialog } from "@/components/panel/FailureReportDialog";
import { tenantConfig } from "@/config/tenant";
import { toast } from "sonner";

const title = `Panel Klienta – ${tenantConfig.company.name}`;
const description =
  "Panel klienta serwisu klimatyzacji i pomp ciepła: przeglądy, historia serwisowa, dokumenty CRO i zgłaszanie awarii.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  const { company, client, alert, devices, serviceHistory, documents } = tenantConfig;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Toaster position="top-center" />

      <header className="relative overflow-hidden bg-[image:var(--gradient-brand)] text-brand-foreground shadow-[var(--shadow-lift)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="h-9 w-auto" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-xl bg-[image:linear-gradient(145deg,oklch(1_0_0/0.16),oklch(1_0_0/0.04))] font-display text-lg font-bold shadow-inner ring-1 ring-white/15">
                KT
              </span>
            )}
            <div className="leading-tight">
              <p className="font-display text-xl font-semibold tracking-tight">{company.name}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-brand-foreground/70">
                {company.tagline}
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
              {client.firstName} {client.lastName}
            </span>
          </div>
        </div>
        <div className="h-[3px] w-full bg-[image:linear-gradient(90deg,transparent,oklch(0.73_0.145_62/0.7),transparent)]" />
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Dzień dobry, {client.firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Klient nr {client.clientNumber} · {client.address}
          </p>
        </div>

        {alert.active && (
          <AlertBanner
            title={alert.title}
            message={alert.message}
            ctaLabel={alert.ctaLabel}
            onCta={() =>
              toast.success("Prośba o termin przeglądu wysłana", {
                description: "Skontaktujemy się, aby potwierdzić dogodny termin wizyty.",
              })
            }
          />
        )}

        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 space-y-8">
            <section className="min-w-0 space-y-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                Twoje urządzenia
              </h2>
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </section>

            <section className="min-w-0 space-y-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                Historia serwisów
              </h2>
              <ServiceTimeline entries={serviceHistory} />
            </section>
          </div>

          <div className="min-w-0 space-y-8">
            <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-panel">
              <div className="flex items-center gap-2 text-brand">
                <CalendarClock className="size-5" />
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                  Szybkie akcje
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Awaria urządzenia? Opisz problem i dołącz zdjęcie – przyspieszy to diagnozę.
              </p>
              <FailureReportDialog />
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                Dokumenty
              </h2>
              <DocumentsList documents={documents} />
            </section>
          </div>
        </div>
      </main>

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
