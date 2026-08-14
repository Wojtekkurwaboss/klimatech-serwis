import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { addDevice, getOwnerClients } from "@/fns/owner-management";

const schema = z.object({
  clientId: z.string().uuid("Wybierz klienta"),
  model: z.string().min(1, "Podaj model"),
  category: z.string().min(1, "Podaj kategorię"),
  installedAt: z.string().min(1, "Podaj datę instalacji"),
  warrantyUntil: z.string().optional(),
  warrantyActive: z.boolean(),
  croNumber: z.string().optional(),
  refrigerant: z.string().optional(),
  location: z.string().optional(),
});

const emptyValues: z.infer<typeof schema> = {
  clientId: "",
  model: "",
  category: "",
  installedAt: "",
  warrantyUntil: "",
  warrantyActive: false,
  croNumber: "",
  refrigerant: "",
  location: "",
};

export function AddDeviceDialog({
  open,
  onOpenChange,
  preselectedClientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId: string | undefined;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [comboOpen, setComboOpen] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const clientsQuery = useQuery({
    queryKey: ["owner-clients"],
    queryFn: () => getOwnerClients(),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      form.reset({ ...emptyValues, clientId: preselectedClientId ?? "" });
      setServerError(null);
    }
  }, [open, preselectedClientId]);

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    try {
      await addDevice({ data: values });
      toast.success("Urządzenie dodane");
      router.invalidate();
      onOpenChange(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Nie udało się dodać urządzenia. Spróbuj ponownie.");
    }
  }

  const clients = clientsQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj urządzenie</DialogTitle>
          <DialogDescription>Przypisz nowe urządzenie do istniejącego klienta.</DialogDescription>
        </DialogHeader>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {clients.length === 0 && !clientsQuery.isLoading ? (
          <Alert>
            <AlertDescription>Najpierw dodaj klienta — dopiero wtedy możesz przypisać mu urządzenie.</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => {
                  const selected = clients.find((c) => c.id === field.value);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Klient</FormLabel>
                      <Popover open={comboOpen} onOpenChange={setComboOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between font-normal"
                            >
                              {selected
                                ? `${selected.firstName} ${selected.lastName} — ${selected.clientNumber}`
                                : "Wybierz klienta"}
                              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Szukaj klienta…" />
                            <CommandList>
                              <CommandEmpty>Brak wyników.</CommandEmpty>
                              <CommandGroup>
                                {clients.map((c) => (
                                  <CommandItem
                                    key={c.id}
                                    value={`${c.firstName} ${c.lastName} ${c.clientNumber}`}
                                    onSelect={() => {
                                      field.onChange(c.id);
                                      setComboOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn("size-4", field.value === c.id ? "opacity-100" : "opacity-0")}
                                    />
                                    {c.firstName} {c.lastName} — {c.clientNumber}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="np. Daikin Perfera 3,5 kW" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategoria</FormLabel>
                      <FormControl>
                        <Input placeholder="np. Klimatyzacja split" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="installedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data instalacji</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warrantyUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gwarancja do (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="warrantyActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer font-normal">Gwarancja aktywna</FormLabel>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="croNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer CRO (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="CRO/2026/PL/…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="refrigerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Czynnik (opcjonalnie)</FormLabel>
                      <FormControl>
                        <Input placeholder="np. R32 · 1,15 kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokalizacja (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input placeholder="np. Salon, parter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Dodawanie…" : "Dodaj urządzenie"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
