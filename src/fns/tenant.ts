import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { db } from "@/db/client";
import { clients, devices, documents, serviceEntries, tenants, users, visits } from "@/db/schema";
import { requireSessionUser } from "@/lib/session";
import { computeReviewStatus } from "@/config/tenant";
import { dbToDisplayServiceType, displayToDbServiceType, type DbServiceType } from "@/lib/service-type";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export const getClientDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await requireSessionUser("client");

  const [clientRow] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.userId, user.id), eq(clients.tenantId, user.tenantId)))
    .limit(1);
  if (!clientRow) throw new Error("Nie znaleziono danych klienta");

  const [tenantRow] = await db.select().from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
  const deviceRows = await db.select().from(devices).where(eq(devices.clientId, clientRow.id));
  const deviceIds = deviceRows.map((d) => d.id);

  const serviceRows = deviceIds.length
    ? await db.query.serviceEntries.findMany({
        where: (se, { inArray }) => inArray(se.deviceId, deviceIds),
        orderBy: (se, { desc }) => [desc(se.date)],
      })
    : [];

  const technicianIds = [...new Set(serviceRows.map((s) => s.technicianId).filter((v): v is string => !!v))];
  const technicianRows = technicianIds.length
    ? await db.query.users.findMany({ where: (u, { inArray }) => inArray(u.id, technicianIds) })
    : [];
  const technicianById = new Map(technicianRows.map((t) => [t.id, t]));

  const documentRows = await db.select().from(documents).where(eq(documents.clientId, clientRow.id));

  const overdueDevice = deviceRows.find(
    (d) => d.nextReviewDue && computeReviewStatus(d.nextReviewDue).status === "overdue",
  );
  const alert = overdueDevice
    ? {
        active: true,
        title: "Zaległy przegląd szczelności instalacji",
        message: `Twój obowiązkowy przegląd szczelności instalacji jest zaległy o ${
          computeReviewStatus(overdueDevice.nextReviewDue!).overdueDays
        } dni – umów wizytę, aby uniknąć ryzyka kontroli i utraty gwarancji`,
        ctaLabel: "Umów przegląd",
        overdueDays: computeReviewStatus(overdueDevice.nextReviewDue!).overdueDays ?? 0,
      }
    : { active: false, title: "", message: "", ctaLabel: "", overdueDays: 0 };

  return {
    company: {
      name: tenantRow.name,
      tagline: tenantRow.tagline ?? "Panel Klienta",
      logoUrl: tenantRow.logoUrl,
      phone: tenantRow.phone ?? "",
      email: tenantRow.email ?? "",
    },
    client: {
      firstName: user.firstName,
      lastName: user.lastName,
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

const clientUserAlias = alias(users, "client_user");

async function getTechnicianHeaderContext(userId: string, tenantId: string) {
  const [tenantRow] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const [technicianRow] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return {
    company: { name: tenantRow.name, logoUrl: tenantRow.logoUrl },
    technician: { firstName: technicianRow.firstName, lastName: technicianRow.lastName },
  };
}

export const getTodayVisits = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await requireSessionUser("technician");
  const header = await getTechnicianHeaderContext(user.id, user.tenantId);
  const rows = await db
    .select({
      id: visits.id,
      scheduledAt: visits.scheduledAt,
      plannedType: visits.plannedType,
      lastVisitNote: visits.lastVisitNote,
      croNumber: visits.croNumber,
      address: clients.address,
      clientFirstName: clientUserAlias.firstName,
      clientLastName: clientUserAlias.lastName,
      deviceModel: devices.model,
      deviceCategory: devices.category,
    })
    .from(visits)
    .innerJoin(clients, eq(visits.clientId, clients.id))
    .innerJoin(clientUserAlias, eq(clients.userId, clientUserAlias.id))
    .innerJoin(devices, eq(visits.deviceId, devices.id))
    .where(
      and(
        eq(visits.technicianId, user.id),
        gte(visits.scheduledAt, startOfToday()),
        lt(visits.scheduledAt, endOfToday()),
      ),
    )
    .orderBy(visits.scheduledAt);

  return {
    ...header,
    visits: rows.map((r) => ({
      id: r.id,
      time: formatTime(r.scheduledAt),
      clientName: `${r.clientFirstName} ${r.clientLastName}`,
      address: r.address,
      deviceModel: r.deviceModel,
      deviceCategory: r.deviceCategory,
      plannedType: dbToDisplayServiceType[r.plannedType],
      lastVisitNote: r.lastVisitNote ?? "",
      croNumber: r.croNumber ?? "—",
    })),
  };
});

export const getVisitDetail = createServerFn({ method: "GET" })
  .validator(z.object({ visitId: z.string() }))
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("technician");
    const header = await getTechnicianHeaderContext(user.id, user.tenantId);
    const [row] = await db
      .select({
        id: visits.id,
        scheduledAt: visits.scheduledAt,
        plannedType: visits.plannedType,
        lastVisitNote: visits.lastVisitNote,
        croNumber: visits.croNumber,
        address: clients.address,
        clientFirstName: clientUserAlias.firstName,
        clientLastName: clientUserAlias.lastName,
        deviceModel: devices.model,
        deviceCategory: devices.category,
      })
      .from(visits)
      .innerJoin(clients, eq(visits.clientId, clients.id))
      .innerJoin(clientUserAlias, eq(clients.userId, clientUserAlias.id))
      .innerJoin(devices, eq(visits.deviceId, devices.id))
      .where(and(eq(visits.id, data.visitId), eq(visits.technicianId, user.id)))
      .limit(1);

    if (!row) return { ...header, visit: null };

    return {
      ...header,
      visit: {
        id: row.id,
        time: formatTime(row.scheduledAt),
        clientName: `${row.clientFirstName} ${row.clientLastName}`,
        address: row.address,
        deviceModel: row.deviceModel,
        deviceCategory: row.deviceCategory,
        plannedType: dbToDisplayServiceType[row.plannedType],
        lastVisitNote: row.lastVisitNote ?? "",
        croNumber: row.croNumber ?? "—",
      },
    };
  });

const closeVisitSchema = z.object({
  visitId: z.string(),
  type: z.enum(["montaż", "przegląd", "naprawa", "uzupełnienie czynnika"]),
  refrigerantKg: z.string().optional(),
  note: z.string().min(1),
  photoBefore: z.boolean(),
  photoAfter: z.boolean(),
  signed: z.boolean(),
  croRequired: z.boolean(),
});

export const closeVisit = createServerFn({ method: "POST" })
  .validator(closeVisitSchema)
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("technician");
    const [visit] = await db
      .select()
      .from(visits)
      .where(and(eq(visits.id, data.visitId), eq(visits.technicianId, user.id)))
      .limit(1);
    if (!visit) throw new Error("Nie znaleziono wizyty");

    const dbType: DbServiceType = displayToDbServiceType[data.type];
    const today = new Date().toISOString().slice(0, 10);

    await db.transaction(async (tx) => {
      await tx
        .update(visits)
        .set({
          status: "completed",
          closedAt: new Date(),
          refrigerantKg: data.refrigerantKg || null,
          closeNote: data.note,
          photoBefore: data.photoBefore,
          photoAfter: data.photoAfter,
          signed: data.signed,
          croRequired: data.croRequired,
        })
        .where(eq(visits.id, data.visitId));

      await tx.insert(serviceEntries).values({
        tenantId: visit.tenantId,
        deviceId: visit.deviceId,
        visitId: visit.id,
        date: today,
        type: dbType,
        description: data.note,
        technicianId: user.id,
        protocolUrl: `#protokol-${visit.id}`,
      });

      if (dbType === "przeglad") {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        await tx
          .update(devices)
          .set({ lastReviewAt: today, nextReviewDue: nextYear.toISOString().slice(0, 10) })
          .where(eq(devices.id, visit.deviceId));
      }
    });

    return { ok: true };
  });

export const getOwnerOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await requireSessionUser("owner");
  const [tenantRow] = await db.select().from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);

  const clientRows = await db
    .select({
      clientId: clients.id,
      clientFirstName: clientUserAlias.firstName,
      clientLastName: clientUserAlias.lastName,
      deviceId: devices.id,
      deviceModel: devices.model,
      deviceCategory: devices.category,
      lastReviewAt: devices.lastReviewAt,
      nextReviewDue: devices.nextReviewDue,
    })
    .from(clients)
    .innerJoin(clientUserAlias, eq(clients.userId, clientUserAlias.id))
    .leftJoin(devices, eq(devices.clientId, clients.id))
    .where(eq(clients.tenantId, user.tenantId));

  const clientsOverviewData = clientRows
    .filter((r) => r.deviceId && r.nextReviewDue)
    .map((r) => {
      const { status, overdueDays, dueInDays } = computeReviewStatus(r.nextReviewDue!);
      return {
        id: r.deviceId!,
        clientName: `${r.clientFirstName} ${r.clientLastName}`,
        deviceModel: r.deviceModel!,
        deviceCategory: r.deviceCategory!,
        lastReview: r.lastReviewAt ?? "",
        nextReviewDue: r.nextReviewDue!,
        status,
        overdueDays,
        dueInDays,
      };
    });

  const technicianRows = await db
    .select()
    .from(users)
    .where(and(eq(users.tenantId, user.tenantId), eq(users.role, "technician")));
  const technicianIds = technicianRows.map((t) => t.id);

  const visitRows = technicianIds.length
    ? await db
        .select({
          id: visits.id,
          scheduledAt: visits.scheduledAt,
          plannedType: visits.plannedType,
          address: clients.address,
          technicianId: visits.technicianId,
          clientFirstName: clientUserAlias.firstName,
          clientLastName: clientUserAlias.lastName,
        })
        .from(visits)
        .innerJoin(clients, eq(visits.clientId, clients.id))
        .innerJoin(clientUserAlias, eq(clients.userId, clientUserAlias.id))
        .where(
          and(
            inArray(visits.technicianId, technicianIds),
            gte(visits.scheduledAt, startOfToday()),
            lt(visits.scheduledAt, endOfToday()),
          ),
        )
        .orderBy(visits.scheduledAt)
    : [];

  const visitsByTechnician = new Map<string, typeof visitRows>();
  for (const v of visitRows) {
    const list = visitsByTechnician.get(v.technicianId) ?? [];
    list.push(v);
    visitsByTechnician.set(v.technicianId, list);
  }

  const technicians = technicianRows.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    role: "Technik serwisu",
    visits: (visitsByTechnician.get(t.id) ?? []).map((v) => ({
      id: v.id,
      time: formatTime(v.scheduledAt),
      clientName: `${v.clientFirstName} ${v.clientLastName}`,
      address: v.address,
      plannedType: dbToDisplayServiceType[v.plannedType],
    })),
  }));

  return {
    company: {
      name: tenantRow.name,
      logoUrl: tenantRow.logoUrl,
      phone: tenantRow.phone ?? "",
      email: tenantRow.email ?? "",
    },
    technicians,
    clientsOverview: clientsOverviewData,
  };
});
