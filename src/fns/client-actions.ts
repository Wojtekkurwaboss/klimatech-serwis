import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { clients, tenants } from "@/db/schema";
import { requireSessionUser } from "@/lib/session";
import { sendEmail } from "@/lib/email";

async function getClientContext(userId: string, tenantId: string) {
  const [clientRow] = await db.select().from(clients).where(eq(clients.userId, userId)).limit(1);
  const [tenantRow] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!clientRow) throw new Error("Nie znaleziono danych klienta");
  if (!tenantRow?.email) throw new Error("Firma nie ma ustawionego adresu e-mail do zgłoszeń.");
  return { clientRow, tenantRow };
}

export const requestReview = createServerFn({ method: "POST" }).handler(async () => {
  const { user } = await requireSessionUser("client");
  const { clientRow, tenantRow } = await getClientContext(user.id, user.tenantId);

  await sendEmail(
    tenantRow.email!,
    `Prośba o termin przeglądu — ${user.firstName} ${user.lastName}`,
    `<p>Klient <strong>${user.firstName} ${user.lastName}</strong> (nr ${clientRow.clientNumber}, ${clientRow.address}) prosi o umówienie terminu obowiązkowego przeglądu.</p>`,
  );

  return { ok: true };
});

const reportFailureSchema = z.object({
  description: z.string().min(1, "Opisz problem"),
  fileName: z.string().optional(),
});

export const reportFailure = createServerFn({ method: "POST" })
  .validator(reportFailureSchema)
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("client");
    const { clientRow, tenantRow } = await getClientContext(user.id, user.tenantId);

    await sendEmail(
      tenantRow.email!,
      `Zgłoszenie awarii — ${user.firstName} ${user.lastName}`,
      `<p>Klient <strong>${user.firstName} ${user.lastName}</strong> (nr ${clientRow.clientNumber}, ${clientRow.address}) zgłasza awarię:</p>
<p>${data.description}</p>
${data.fileName ? `<p>Nazwa załączonego pliku (bez podglądu — apka nie ma jeszcze skonfigurowanego przechowywania plików): ${data.fileName}</p>` : ""}`,
    );

    return { ok: true };
  });
