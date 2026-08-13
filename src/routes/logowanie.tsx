import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { roleHomeRoute } from "@/lib/session";
import type { Role } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Nieprawidłowy adres e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});

export const Route = createFileRoute("/logowanie")({
  component: LogowaniePage,
});

function LogowaniePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    const { data, error } = await authClient.signIn.email(values);
    if (error || !data) {
      setServerError("Nieprawidłowy e-mail lub hasło.");
      return;
    }
    const role = (data.user as unknown as { role: Role }).role;
    navigate({ to: roleHomeRoute(role) });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Zaloguj się</CardTitle>
          <CardDescription>Panel Klienta, Technika i Właściciela — jedno logowanie.</CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logowanie…" : "Zaloguj się"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <Link to="/zapomnialem-hasla" className="underline">
              Zapomniałem hasła
            </Link>
            <Link to="/rejestracja" className="underline">
              Załóż konto firmy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
