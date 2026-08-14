import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { serviceTypes } from "@/config/tenant";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientDevices, getOwnerClients, getOwnerTechnicians, scheduleVisit } from "@/fns/owner-management";

const schema = z.object({
  clientId: z.string().uuid("Wybierz klienta"),
  deviceId: z.string().uuid("Wybierz urządzenie"),
  technicianId: z.string().min(1, "Wybierz technika"),
  scheduledAt: z.string().min(1, "Podaj datę i godzinę"),
  plannedType: z.enum(["montaż", "przegląd", "naprawa", "uzupełnienie czynnika"]),
  note: z.string().optional(),
});

const emptyValues: z.infer<typeof schema> = {
  clientId: "",
  deviceId: "",
  technicianId: "",
  scheduledAt: "",
  plannedType: "przegląd",
  note: "",
};

export function ScheduleVisitDialog({
  open,
  onOpenChange,
  preselectedClientId,
  preselectedDeviceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId: string | undefined;
  preselectedDeviceId: string | undefined;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [comboOpen, setComboOpen] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const clientId = form.watch("clientId");

  const clientsQuery = useQuery({
    queryKey: ["owner-clients"],
    queryFn: () => getOwnerClients(),
    enabled: open,
  });
  const devicesQuery = useQuery({
    queryKey: ["client-devices", clientId],
    queryFn: () => getClientDevices({ data: { clientId } }),
    enabled: open && !!clientId,
  });
  const techniciansQuery = useQuery({
    queryKey: ["owner-technicians"],
    queryFn: () => getOwnerTechnicians(),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        ...emptyValues,
        clientId: preselectedClientId ?? "",
        deviceId: preselectedDeviceId ?? "",
      });
      setServerError(null);
    }
  }, [open, preselectedClientId, preselectedDeviceId]);

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    try {
      await scheduleVisit({ data: values });
      toast.success("Wizyta zaplanowana");
      router.invalidate();
      onOpenChange(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Nie udało się zaplanować wizyty. Spróbuj ponownie.");
    }
  }

  const clients = clientsQuery.data ?? [];
  const devices = devicesQuery.data ?? [];
  const technicians = techniciansQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zaplanuj wizytę</DialogTitle>
          <DialogDescription>Przypisz technika do klienta na wybrany termin.</DialogDescription>
        </DialogHeader>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {technicians.length === 0 && !techniciansQuery.isLoading ? (
          <Alert>
            <AlertDescription>Najpierw dodaj technika — dopiero wtedy możesz zaplanować wizytę.</AlertDescription>
          </Alert>
        ) : clients.length === 0 && !clientsQuery.isLoading ? (
          <Alert>
            <AlertDescription>Najpierw dodaj klienta — dopiero wtedy możesz zaplanować wizytę.</AlertDescription>
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
                                      form.setValue("deviceId", "");
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

              <FormField
                control={form.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urządzenie</FormLabel>
                    {clientId && devices.length === 0 && !devicesQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Ten klient nie ma urządzeń — dodaj urządzenie najpierw.
                      </p>
                    ) : (
                      <Select value={field.value} onValueChange={field.onChange} disabled={!clientId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={clientId ? "Wybierz urządzenie" : "Najpierw wybierz klienta"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {devices.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.model} ({d.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technik</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz technika" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technicians.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.firstName} {t.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data i godzina</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plannedType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ czynności</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notatka dla technika (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Planowanie…" : "Zaplanuj wizytę"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
