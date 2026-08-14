import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, like, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { clients, devices, users, visits } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireSessionUser } from "@/lib/session";
import { displayToDbServiceType } from "@/lib/service-type";

function generateTempPassword() {
  return crypto.randomBytes(9).toString("base64url");
}

function friendlySignUpError(err: unknown, fallback: string): Error {
  const message = err instanceof Error ? err.message : "";
  if (/already exists/i.test(message)) {
    return new Error("Konto z tym adresem e-mail już istnieje.");
  }
  return new Error(fallback);
}

const addClientSchema = z.object({
  firstName: z.string().min(1, "Podaj imię"),
  lastName: z.string().min(1, "Podaj nazwisko"),
  email: z.string().email("Nieprawidłowy adres e-mail"),
  phone: z.string().optional(),
  address: z.string().min(3, "Podaj adres"),
});

export const addClient = createServerFn({ method: "POST" })
  .validator(addClientSchema)
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("owner");
    const tempPassword = generateTempPassword();

    let newUserId: string;
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: tempPassword,
          name: `${data.firstName} ${data.lastName}`,
          role: "client",
          tenantId: user.tenantId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      });
      newUserId = result.user.id;
    } catch (err) {
      throw friendlySignUpError(err, "Nie udało się utworzyć konta klienta. Spróbuj ponownie.");
    }

    const year = new Date().getFullYear();
    const countRows = await db
      .select({ value: count() })
      .from(clients)
      .where(and(eq(clients.tenantId, user.tenantId), like(clients.clientNumber, `KL-${year}-%`)));
    const existingCount = countRows[0]?.value ?? 0;
    const clientNumber = `KL-${year}-${String(existingCount + 1).padStart(4, "0")}`;

    try {
      const [clientRow] = await db
        .insert(clients)
        .values({ tenantId: user.tenantId, userId: newUserId, address: data.address, clientNumber })
        .returning();
      return { clientId: clientRow.id, clientNumber, email: data.email, tempPassword };
    } catch (err) {
      await db.delete(users).where(eq(users.id, newUserId));
      throw new Error("Nie udało się utworzyć klienta. Spróbuj ponownie.");
    }
  });

const addTechnicianSchema = z.object({
  firstName: z.string().min(1, "Podaj imię"),
  lastName: z.string().min(1, "Podaj nazwisko"),
  email: z.string().email("Nieprawidłowy adres e-mail"),
  phone: z.string().optional(),
  certNumber: z.string().optional(),
});

export const addTechnician = createServerFn({ method: "POST" })
  .validator(addTechnicianSchema)
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("owner");
    const tempPassword = generateTempPassword();

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: tempPassword,
          name: `${data.firstName} ${data.lastName}`,
          role: "technician",
          tenantId: user.tenantId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          certNumber: data.certNumber,
        },
      });
      return { userId: result.user.id, email: data.email, tempPassword };
    } catch (err) {
      throw friendlySignUpError(err, "Nie udało się utworzyć konta technika. Spróbuj ponownie.");
    }
  });

const addDeviceSchema = z.object({
  clientId: z.string().uuid("Wybierz klienta"),
  model: z.string().min(1, "Podaj model"),
  category: z.string().min(1, "Podaj kategorię"),
  installedAt: z.string().min(1, "Podaj datę instalacji"),
  warrantyUntil: z.string().optional(),
  warrantyActive: z.boolean().default(false),
  croNumber: z.string().optional(),
  refrigerant: z.string().optional(),
  location: z.string().optional(),
});

export const addDevice = createServerFn({ method: "POST" })
  .validator(addDeviceSchema)
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("owner");

    const [clientRow] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, data.clientId), eq(clients.tenantId, user.tenantId)))
      .limit(1);
    if (!clientRow) throw new Error("Nie znaleziono klienta");

    const [deviceRow] = await db
      .insert(devices)
      .values({
        tenantId: user.tenantId,
        clientId: data.clientId,
        model: data.model,
        category: data.category,
        installedAt: data.installedAt,
        warrantyUntil: data.warrantyUntil || null,
        warrantyActive: data.warrantyActive,
        croNumber: data.croNumber || null,
        refrigerant: data.refrigerant || null,
        location: data.location || null,
        lastReviewAt: null,
        nextReviewDue: null,
      })
      .returning();

    return { deviceId: deviceRow.id };
  });

export const getOwnerClients = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await requireSessionUser("owner");

  const rows = await db
    .select({
      id: clients.id,
      address: clients.address,
      clientNumber: clients.clientNumber,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .where(eq(clients.tenantId, user.tenantId));

  return rows;
});

const getClientDevicesSchema = z.object({ clientId: z.string().uuid() });

export const getClientDevices = createServerFn({ method: "GET" })
  .validator(getClientDevicesSchema)
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("owner");

    const [clientRow] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, data.clientId), eq(clients.tenantId, user.tenantId)))
      .limit(1);
    if (!clientRow) throw new Error("Nie znaleziono klienta");

    const rows = await db
      .select({
        id: devices.id,
        model: devices.model,
        category: devices.category,
        croNumber: devices.croNumber,
      })
      .from(devices)
      .where(eq(devices.clientId, data.clientId));

    return rows;
  });

export const getOwnerTechnicians = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await requireSessionUser("owner");

  const rows = await db
    .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(and(eq(users.tenantId, user.tenantId), eq(users.role, "technician")));

  return rows;
});

const scheduleVisitSchema = z.object({
  clientId: z.string().uuid("Wybierz klienta"),
  deviceId: z.string().uuid("Wybierz urządzenie"),
  technicianId: z.string().min(1, "Wybierz technika"),
  scheduledAt: z.string().min(1, "Podaj datę i godzinę"),
  plannedType: z.enum(["montaż", "przegląd", "naprawa", "uzupełnienie czynnika"]),
  note: z.string().optional(),
});

export const scheduleVisit = createServerFn({ method: "POST" })
  .validator(scheduleVisitSchema)
  .handler(async ({ data }) => {
    const { user } = await requireSessionUser("owner");

    const [clientRow] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, data.clientId), eq(clients.tenantId, user.tenantId)))
      .limit(1);
    if (!clientRow) throw new Error("Nie znaleziono klienta");

    const [deviceRow] = await db
      .select()
      .from(devices)
      .where(and(eq(devices.id, data.deviceId), eq(devices.clientId, data.clientId)))
      .limit(1);
    if (!deviceRow) throw new Error("Nie znaleziono urządzenia u tego klienta");

    const [technicianRow] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, data.technicianId), eq(users.tenantId, user.tenantId), eq(users.role, "technician")))
      .limit(1);
    if (!technicianRow) throw new Error("Nie znaleziono technika");

    const [visitRow] = await db
      .insert(visits)
      .values({
        tenantId: user.tenantId,
        clientId: data.clientId,
        deviceId: data.deviceId,
        technicianId: data.technicianId,
        scheduledAt: new Date(data.scheduledAt),
        plannedType: displayToDbServiceType[data.plannedType],
        lastVisitNote: data.note || null,
        croNumber: deviceRow.croNumber,
        status: "scheduled",
      })
      .returning();

    return { visitId: visitRow.id };
  });
