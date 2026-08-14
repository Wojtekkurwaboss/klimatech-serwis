import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addClient } from "@/fns/owner-management";

const schema = z.object({
  firstName: z.string().min(1, "Podaj imię"),
  lastName: z.string().min(1, "Podaj nazwisko"),
  email: z.string().email("Nieprawidłowy adres e-mail"),
  phone: z.string().optional(),
  address: z.string().min(3, "Podaj adres"),
});

type SuccessResult = { clientId: string; clientNumber: string; email: string; tempPassword: string };

export function AddClientDialog({
  open,
  onOpenChange,
  onAddDeviceRequested,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDeviceRequested: (clientId: string) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);
  const [copied, setCopied] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", address: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    try {
      const res = await addClient({ data: values });
      setResult(res);
      router.invalidate();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Nie udało się utworzyć klienta. Spróbuj ponownie.");
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setTimeout(() => {
        form.reset();
        setResult(null);
        setServerError(null);
        setCopied(false);
      }, 200);
    }
  }

  async function copyPassword() {
    if (!result) return;
    await navigator.clipboard.writeText(result.tempPassword);
    setCopied(true);
    toast.success("Skopiowano hasło");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {!result ? (
          <>
            <DialogHeader>
              <DialogTitle>Dodaj klienta</DialogTitle>
              <DialogDescription>Utworzysz konto klienta i wpis w bazie firmy.</DialogDescription>
            </DialogHeader>
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imię</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nazwisko</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Input placeholder="ul. Przykładowa 1, Warszawa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Tworzenie klienta…" : "Dodaj klienta"}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Klient dodany</DialogTitle>
              <DialogDescription>
                Przekaż poniższe dane klientowi — zaloguje się i będzie mógł zmienić hasło przez „Zapomniałem hasła”.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Numer klienta</span>
                <span className="font-medium tabular-nums">{result.clientNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">E-mail</span>
                <span className="font-medium">{result.email}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Hasło tymczasowe</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-card px-2 py-1 font-mono text-xs">{result.tempPassword}</code>
                  <Button type="button" size="icon" variant="outline" onClick={copyPassword}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                type="button"
                variant="brand"
                className="flex-1"
                onClick={() => {
                  onAddDeviceRequested(result.clientId);
                  handleOpenChange(false);
                }}
              >
                Dodaj urządzenie temu klientowi
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
                Zamknij
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
