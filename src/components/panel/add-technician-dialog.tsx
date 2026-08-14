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
import { addTechnician } from "@/fns/owner-management";

const schema = z.object({
  firstName: z.string().min(1, "Podaj imię"),
  lastName: z.string().min(1, "Podaj nazwisko"),
  email: z.string().email("Nieprawidłowy adres e-mail"),
  phone: z.string().optional(),
  certNumber: z.string().optional(),
});

type SuccessResult = { userId: string; email: string; tempPassword: string };

export function AddTechnicianDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);
  const [copied, setCopied] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", certNumber: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    try {
      const res = await addTechnician({ data: values });
      setResult(res);
      router.invalidate();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Nie udało się utworzyć technika. Spróbuj ponownie.");
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
              <DialogTitle>Dodaj technika</DialogTitle>
              <DialogDescription>Utworzysz konto technika w zespole tej firmy.</DialogDescription>
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
                  name="certNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer certyfikatu F-gaz (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="F-GAZ/PL/2019/88213" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Tworzenie konta…" : "Dodaj technika"}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Technik dodany</DialogTitle>
              <DialogDescription>
                Przekaż poniższe dane technikowi — zaloguje się i będzie mógł zmienić hasło przez „Zapomniałem hasła”.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Zamknij
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
