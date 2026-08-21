import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Phone, Sparkles, UserRound } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/panel/AlertBanner";
import { DeviceCard } from "@/components/panel/DeviceCard";
import { ServiceTimeline } from "@/components/panel/ServiceTimeline";
import { DocumentsList } from "@/components/panel/DocumentsList";
import { toast } from "sonner";
import { getPublicDemoData } from "@/fns/public-demo";

const description =
  "Podgląd panelu klienta — demo przygotowane specjalnie dla tej firmy, bez logowania.";

export const Route = createFileRoute("/demo/$slug")({
  loader: ({ params }) => getPublicDemoData({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const title = loaderData
      ? `Demo panelu – ${loaderData.company.name}`
      : "Demo panelu – Klimatech";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: PublicDemo,
});

function PublicDemo() {
  const data = Route.useLoaderData();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
        <p className="text-center text-sm text-muted-foreground">
          Nie znaleziono tego demo. Sprawdź, czy link jest poprawny.
        </p>
      </div>
    );
  }

  const { company, client, alert, devices, serviceHistory, documents } = data;

  const demoOnly = () =>
    toast.info("To jest wersja demo", {
      description: "W pełnej wersji ta akcja trafia bezpośrednio do Waszego zespołu serwisowego.",
    });

  return (
    <div className="min-h-screen bg-background font-sans">
      <Toaster position="top-center" />

      <div className="border-b border-border bg-secondary/60 px-4 py-2.5 text-center text-xs font-medium text-muted-foreground sm:px-6">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-brand" />
          To jest spersonalizowane demo panelu dla {company.name} — bez logowania, do samodzielnego
          przeglądania.
        </span>
      </div>

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
              <span className="flex size-10 items-center justify-center rounded-xl bg-[image:linear-gradient(145deg,oklch(1_0_0/0.16),oklch(1_0_0/0.04))] font-display text-lg font-bold shadow-inner ring-1 ring-white/15">
                {company.name.slice(0, 2).toUpperCase()}
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
            {company.phone && (
              <span className="hidden items-center gap-2 text-brand-foreground/85 sm:flex">
                <Phone className="size-4" />
                {company.phone}
              </span>
            )}
            {client && (
              <span className="flex items-center gap-2 rounded-full bg-brand-foreground/10 px-3 py-1.5">
                <UserRound className="size-4" />
                {client.firstName} {client.lastName}
              </span>
            )}
          </div>
        </div>
        <div className="h-[3px] w-full bg-[image:linear-gradient(90deg,transparent,oklch(0.73_0.145_62/0.7),transparent)]" />
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {client && (
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Dzień dobry, {client.firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Klient nr {client.clientNumber} · {client.address}
            </p>
          </div>
        )}

        {alert.active && (
          <AlertBanner
            title={alert.title}
            message={alert.message}
            ctaLabel={alert.ctaLabel}
            onCta={demoOnly}
          />
        )}

        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 space-y-8">
            <section className="min-w-0 space-y-4">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                Urządzenia
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
                W pełnej wersji klient stąd zgłasza awarię ze zdjęciem i dostaje odpowiedź od
                zespołu serwisowego.
              </p>
              <Button variant="outline" className="w-full" onClick={demoOnly}>
                Zgłoś awarię (demo)
              </Button>
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
            © {new Date().getFullYear()} {company.name} · demo przygotowane przez Klimatech
          </span>
          {company.email && (
            <a href={`mailto:${company.email}`} className="hover:text-brand">
              {company.email}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
