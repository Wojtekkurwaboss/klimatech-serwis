import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { clients, devices, documents, serviceEntries, tenants, users } from "@/db/schema";
import { computeReviewStatus } from "@/config/tenant";
import { dbToDisplayServiceType } from "@/lib/service-type";

/**
 * Publiczny, bezhasłowy podgląd panelu klienta dla danego tenanta (po slugu).
 * Świadomie BEZ requireSessionUser/requireRole — to jedyna funkcja w fns/,
 * którą wolno wołać bez sesji. Tylko odczyt, zero mutacji, żadnych danych
 * spoza jednego wskazanego tenanta. Używane przez /demo/$slug do wysyłki
 * klikalnego linku w outreachu (leadgen/klimatech_bridge.py) zamiast
 * loginu/hasła.
 */
export const getPublicDemoData = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const [tenantRow] = await db.select().from(tenants).where(eq(tenants.slug, data.slug)).limit(1);
    if (!tenantRow) return null;

    const company = {
      name: tenantRow.name,
      tagline: tenantRow.tagline ?? "Panel Klienta",
      logoUrl: tenantRow.logoUrl,
      phone: tenantRow.phone ?? "",
      email: tenantRow.email ?? "",
    };

    const [clientRow] = await db
      .select({
        id: clients.id,
        address: clients.address,
        clientNumber: clients.clientNumber,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(clients)
      .innerJoin(users, eq(clients.userId, users.id))
      .where(eq(clients.tenantId, tenantRow.id))
      .orderBy(clients.createdAt)
      .limit(1);

    if (!clientRow) {
      return {
        company,
        client: null,
        alert: { active: false, title: "", message: "", ctaLabel: "", overdueDays: 0 },
        devices: [],
        serviceHistory: [],
        documents: [],
      };
    }

    const deviceRows = await db.select().from(devices).where(eq(devices.clientId, clientRow.id));
    const deviceIds = deviceRows.map((d) => d.id);

    const serviceRows = deviceIds.length
      ? await db.query.serviceEntries.findMany({
          where: (se, { inArray }) => inArray(se.deviceId, deviceIds),
          orderBy: (se, { desc }) => [desc(se.date)],
        })
      : [];

    const technicianIds = [
      ...new Set(serviceRows.map((s) => s.technicianId).filter((v): v is string => !!v)),
    ];
    const technicianRows = technicianIds.length
      ? await db.query.users.findMany({ where: (u, { inArray }) => inArray(u.id, technicianIds) })
      : [];
    const technicianById = new Map(technicianRows.map((t) => [t.id, t]));

    const documentRows = await db
      .select()
      .from(documents)
      .where(eq(documents.clientId, clientRow.id));

    const overdueDevice = deviceRows.find(
      (d) => d.nextReviewDue && computeReviewStatus(d.nextReviewDue).status === "overdue",
    );
    const alert = overdueDevice
      ? {
          active: true,
          title: "Zaległy przegląd szczelności instalacji",
          message: `Obowiązkowy przegląd szczelności instalacji jest zaległy o ${
            computeReviewStatus(overdueDevice.nextReviewDue!).overdueDays
          } dni – umów wizytę, aby uniknąć ryzyka kontroli i utraty gwarancji`,
          ctaLabel: "Umów przegląd",
          overdueDays: computeReviewStatus(overdueDevice.nextReviewDue!).overdueDays ?? 0,
        }
      : { active: false, title: "", message: "", ctaLabel: "", overdueDays: 0 };

    return {
      company,
      client: {
        firstName: clientRow.firstName,
        lastName: clientRow.lastName,
        address: clientRow.address,
        clientNumber: clientRow.clientNumber,
      },
      alert,
      devices: deviceRows.map((d) => ({
        id: d.id,
        model: d.model,
        category: d.category,
        installedAt: d.installedAt,
        warrantyUntil: d.warrantyUntil ?? "",
        warrantyActive: d.warrantyActive,
        croNumber: d.croNumber ?? "",
        refrigerant: d.refrigerant ?? "",
        location: d.location ?? "",
      })),
      serviceHistory: serviceRows.map((s) => {
        const tech = s.technicianId ? technicianById.get(s.technicianId) : undefined;
        return {
          id: s.id,
          date: s.date,
          type: dbToDisplayServiceType[s.type],
          description: s.description,
          technician: tech ? `${tech.firstName[0]}. ${tech.lastName}` : undefined,
          protocolUrl: s.protocolUrl ?? "#",
        };
      }),
      documents: documentRows.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description ?? "",
        fileUrl: d.fileUrl,
        fileType: d.fileType,
      })),
    };
  });
