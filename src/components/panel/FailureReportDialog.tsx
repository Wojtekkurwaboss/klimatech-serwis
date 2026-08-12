import { useState } from "react";
import { ImagePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function FailureReportDialog() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Zgłoszenie awarii wysłane", {
      description: "Serwisant skontaktuje się z Tobą w ciągu 24 godzin.",
    });
    setOpen(false);
    setDescription("");
    setFileName(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand" size="lg" className="w-full">
          Zgłoś awarię
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Zgłoszenie awarii</DialogTitle>
          <DialogDescription>
            Opisz problem i dodaj zdjęcie – ułatwi to diagnozę przed wizytą serwisanta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="failure-description">Opis problemu</Label>
            <Textarea
              id="failure-description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Np. jednostka wewnętrzna głośno pracuje i kapie z niej woda…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="failure-photo">Zdjęcie (opcjonalnie)</Label>
            <label
              htmlFor="failure-photo"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground transition-colors hover:bg-accent/50"
            >
              <ImagePlus className="size-5" />
              {fileName ?? "Wybierz zdjęcie z urządzenia"}
            </label>
            <input
              id="failure-photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="alert">
              <Send className="size-4" />
              Wyślij zgłoszenie
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}