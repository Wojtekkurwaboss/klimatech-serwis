import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, CheckCircle2, Clock, FileCheck2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TechnicianHeader } from "@/components/panel/TechnicianHeader";
import { SignaturePad } from "@/components/panel/SignaturePad";
import { croRequiredTypes, serviceTypes, todayVisits, type ServiceType } from "@/config/tenant";

export const Route = createFileRoute("/technik/$visitId")({
  head: () => ({
    meta: [
      { title: "Szczegóły wizyty – Panel Technika KlimaTech Serwis" },
      {
        name: "description",
        content:
          "Zamknięcie wizyty serwisowej: typ czynności, notatka, zdjęcia przed/po, podpis klienta i wpis do CRO.",
      },
      { property: "og:title", content: "Szczegóły wizyty – Panel Technika" },
      {
        property: "og:description",
        content: "Formularz zamknięcia wizyty serwisowej KlimaTech Serwis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisitDetail,
});

function VisitDetail() {
  const { visitId } = Route.useParams();
  const navigate = useNavigate();
  const visit = useMemo(() => todayVisits.find((v) => v.id === visitId), [visitId]);

  const [type, setType] = useState<ServiceType>(visit?.plannedType ?? "przegląd");
  const [refrigerantKg, setRefrigerantKg] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<{ before: boolean; after: boolean }>({
    before: false,
    after: false,
  });
  const [signed, setSigned] = useState(false);
  const croAuto = croRequiredTypes.includes(type);
  const [croChecked, setCroChecked] = useState(croAuto);
  const [croTouched, setCroTouched] = useState(false);
  const croValue = croTouched ? croChecked : croAuto;

  if (!visit) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <TechnicianHeader backTo="/technik" />
        <p className="mx-auto max-w-2xl px-4 py-10 text-sm text-muted-foreground">
          Nie znaleziono wizyty.
        </p>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signed) {
      toast.error("Wymagany podpis klienta");
      return;
    }
    toast.success("Wizyta zamknięta", {
      description: croValue
        ? "Protokół zapisany, czynność oznaczona do wpisu w CRO."
        : "Protokół zapisany i wysłany do klienta.",
    });
    setTimeout(() => navigate({ to: "/technik" }), 900);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Toaster position="top-center" />
      <TechnicianHeader backTo="/technik" />

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-5 pb-28">
        <section className="rounded-xl border border-border bg-card p-4 shadow-panel">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-secondary px-2 py-1 font-display text-sm font-semibold tabular-nums text-brand">
              <Clock className="size-3.5" />
              {visit.time}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-semibold">{visit.clientName}</h1>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {visit.address}
              </p>
            </div>
          </div>
          <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Urządzenie</dt>
              <dd className="text-right font-medium">{visit.deviceModel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Nr CRO</dt>
              <dd className="text-right font-medium tabular-nums">{visit.croNumber}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-md bg-secondary/70 p-2 text-xs text-muted-foreground">
            Notatka z poprzedniej wizyty: {visit.lastVisitNote}
          </p>
        </section>

        <form onSubmit={submit} className="space-y-5">
          <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-panel">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              Zamknięcie wizyty
            </h2>

            <div className="space-y-2">
              <Label htmlFor="visit-type">Typ czynności</Label>
              <Select value={type} onValueChange={(v) => setType(v as ServiceType)}>
                <SelectTrigger id="visit-type" className="w-full">
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "uzupełnienie czynnika" && (
              <div className="space-y-2">
                <Label htmlFor="refrigerant">Ilość uzupełnionego czynnika (kg)</Label>
                <Input
                  id="refrigerant"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  required
                  value={refrigerantKg}
                  onChange={(e) => setRefrigerantKg(e.target.value)}
                  placeholder="np. 0,25"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="visit-note">Notatka serwisowa</Label>
              <Textarea
                id="visit-note"
                rows={4}
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Wykonane czynności, pomiary, zalecenia dla klienta…"
              />
            </div>

            <div className="space-y-2">
              <Label>Dokumentacja zdjęciowa</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["before", "after"] as const).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPhotos((p) => ({ ...p, [slot]: !p[slot] }))}
                    className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-xs ${
                      photos[slot]
                        ? "border-brand bg-secondary text-brand"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {photos[slot] ? (
                      <CheckCircle2 className="size-6" />
                    ) : (
                      <Camera className="size-6" />
                    )}
                    <span className="font-medium">
                      {slot === "before" ? "Zdjęcie: przed" : "Zdjęcie: po"}
                    </span>
                    <span>{photos[slot] ? "Dodano" : "Dodaj zdjęcie"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Podpis klienta</Label>
              <SignaturePad onChange={setSigned} />
            </div>

            <label
              className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                croValue ? "border-alert/40 bg-alert-soft" : "border-border bg-card"
              }`}
            >
              <Checkbox
                checked={croValue}
                onCheckedChange={(v) => {
                  setCroTouched(true);
                  setCroChecked(v === true);
                }}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-medium">
                  <FileCheck2 className="size-4 shrink-0" />
                  Ta czynność wymaga wpisu do Centralnego Rejestru Operatorów
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Zaznaczane automatycznie dla uzupełnienia czynnika i przeglądu szczelności.
                </span>
              </span>
            </label>
          </section>

          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
            <div className="mx-auto max-w-2xl">
              <Button type="submit" variant="alert" size="lg" className="w-full">
                Zamknij wizytę
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}