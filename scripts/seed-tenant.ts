/**
 * seed-tenant.ts — sparametryzowana wersja src/db/seed.ts dla jednej firmy.
 *
 * Wołany przez SOMI (leadgen/klimatech_bridge.py) przy wyborze leada z shortlisty.
 * Czyta JSON z stdin: {name, slug?, tagline?, phone?, email?, logoUrl?}.
 * Tworzy tenant + konto właściciela + technika + garść demo-klientów (ta sama
 * fikstura co src/db/seed.ts — branża HVAC pasuje niezależnie od tego, którą
 * konkretną firmę pitchujemy). Drukuje DOKŁADNIE JEDNĄ linię JSON na stdout:
 *   sukces:  {"ok": true, "tenantId", "slug", "ownerEmail", "ownerPassword"}
 *   konflikt slug: {"ok": false, "reason": "slug_exists"}
 *   inny błąd: {"ok": false, "reason": "error", "message": "..."}
 *
 * Użycie: echo '{"name":"Acme HVAC","slug":"acme-hvac"}' | npx tsx scripts/seed-tenant.ts
 */
import { randomBytes } from "node:crypto";
import { db } from "../src/db/client";
import { tenants, users, clients, devices, serviceEntries, visits } from "../src/db/schema";
import { auth } from "../src/lib/auth";

type Payload = {
  name: string;
  slug?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  city?: string;
};

/** Podmienia miasto w adresie demo-klienta ("ul. Sosnowa 8, Piaseczno" ->
 * "ul. Sosnowa 8, Gorlice"), zostawiając ulicę bez zmian — tak demo działa
 * lokalnie dla pitchowanej firmy bez wymyślania fałszywych, konkretnych
 * klientów (tych SOMI nie zna). Brak `city` w payloadzie -> adres bez zmian. */
function localizeAddress(address: string, city?: string): string {
  if (!city) return address;
  const idx = address.lastIndexOf(",");
  return idx === -1 ? `${address}, ${city}` : `${address.slice(0, idx)}, ${city}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // usuń diakrytyki (ł nie jest tu NFD, ale resztę łapie)
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function genPassword(): string {
  return `Klt${randomBytes(9).toString("base64url")}!`;
}

async function readStdin(): Promise<Payload> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

async function main() {
  const payload = await readStdin();
  if (!payload.name || !payload.name.trim()) {
    throw new Error("payload.name is required");
  }

  const baseSlug = payload.slug?.trim() || slugify(payload.name);
  const slug = baseSlug || `firma-${Date.now()}`;

  const [tenant] = await db
    .insert(tenants)
    .values({
      name: payload.name,
      slug,
      tagline: payload.tagline || "Panel Klienta",
      logoUrl: payload.logoUrl || "/logo-klimatech.svg",
      phone: payload.phone || null,
      email: payload.email || null,
    })
    .onConflictDoNothing({ target: tenants.slug })
    .returning();

  if (!tenant) {
    console.log(JSON.stringify({ ok: false, reason: "slug_exists" }));
    return;
  }

  const ownerPassword = genPassword();
  const ownerEmail = `wlasciciel@${slug}.demo.klimatech.pl`;

  const ownerSignUp = await auth.api.signUpEmail({
    body: {
      email: ownerEmail,
      password: ownerPassword,
      name: `Właściciel ${payload.name}`,
      role: "owner",
      tenantId: tenant.id,
      firstName: "Właściciel",
      lastName: payload.name,
    },
  });
  const ownerUser = { id: ownerSignUp.user.id };

  const technicianSignUp = await auth.api.signUpEmail({
    body: {
      email: `technik@${slug}.demo.klimatech.pl`,
      password: ownerPassword,
      name: "Marek Nowak",
      role: "technician",
      tenantId: tenant.id,
      firstName: "Marek",
      lastName: "Nowak",
      certNumber: "F-GAZ/PL/2019/88213",
    },
  });
  const technicianUser = { id: technicianSignUp.user.id };
  void ownerUser;

  // Ta sama fikstura demo-klientów co src/db/seed.ts (branża HVAC, uniwersalna
  // dla dowolnej firmy klimatyzacyjnej/serwisowej, którą pitchujemy).
  const otherClientsSeed = [
    {
      name: "Piotr Lewandowski",
      address: "ul. Sosnowa 8, Piaseczno",
      device: { model: "Mitsubishi MSZ-AP 2,5 kW", category: "Klimatyzacja split", croNumber: "CRO/2022/PL/0031907" },
      visit: { time: "10:00", plannedType: "naprawa" as const, note: "Klient zgłaszał hałas jednostki zewnętrznej przy starcie." },
      review: { lastReviewAt: "2024-08-02", nextReviewDue: "2025-08-07" },
    },
    {
      name: "Biuro Rachunkowe Saldo",
      address: "al. Niepodległości 120, Warszawa",
      device: { model: "LG Multi V S 12 kW", category: "System multi-split", croNumber: "CRO/2021/PL/0018442" },
      visit: { time: "11:45", plannedType: "uzupelnienie_czynnika" as const, note: "Ciśnienie poniżej normy, zalecane uzupełnienie R410A." },
      review: { lastReviewAt: "2024-08-20", nextReviewDue: "2025-08-18" },
    },
    {
      name: "Katarzyna Wiśniewska",
      address: "ul. Polna 3, Konstancin",
      device: { model: "Panasonic Aquarea 9 kW", category: "Pompa ciepła", croNumber: "CRO/2024/PL/0057110" },
      visit: { time: "14:15", plannedType: "przeglad" as const, note: "Po sezonie grzewczym – kontrola zasobnika i pracy sprężarki." },
      review: { lastReviewAt: "2025-02-10", nextReviewDue: "2026-02-12" },
    },
  ];

  let seq = 1;
  for (const row of otherClientsSeed) {
    const seedUserId = `seed-${slug}-${seq}`;
    const [rowUser] = await db
      .insert(users)
      .values({
        id: seedUserId,
        name: row.name,
        email: `${seedUserId}@${slug}.demo.klimatech.pl`,
        role: "client",
        tenantId: tenant.id,
        firstName: row.name.split(" ")[0],
        lastName: row.name.split(" ").slice(1).join(" ") || row.name,
      })
      .returning();

    const [rowClient] = await db
      .insert(clients)
      .values({
        tenantId: tenant.id,
        userId: rowUser.id,
        address: localizeAddress(row.address, payload.city),
        clientNumber: `KL-DEMO-${1000 + seq}`,
      })
      .returning();

    const [rowDevice] = await db
      .insert(devices)
      .values({
        tenantId: tenant.id,
        clientId: rowClient.id,
        model: row.device.model,
        category: row.device.category,
        installedAt: row.review.lastReviewAt,
        warrantyActive: false,
        croNumber: row.device.croNumber,
        lastReviewAt: row.review.lastReviewAt,
        nextReviewDue: row.review.nextReviewDue,
      })
      .returning();

    await db.insert(serviceEntries).values({
      tenantId: tenant.id,
      deviceId: rowDevice.id,
      date: row.review.lastReviewAt,
      type: row.visit.plannedType,
      description: row.visit.note,
      technicianId: technicianUser.id,
      protocolUrl: `#protokol-${seedUserId}`,
    });

    await db.insert(visits).values({
      tenantId: tenant.id,
      clientId: rowClient.id,
      deviceId: rowDevice.id,
      technicianId: technicianUser.id,
      scheduledAt: new Date(`${new Date().toISOString().slice(0, 10)}T${row.visit.time}:00`),
      plannedType: row.visit.plannedType,
      lastVisitNote: row.visit.note,
      croNumber: row.device.croNumber,
    });

    seq += 1;
  }

  console.log(
    JSON.stringify({
      ok: true,
      tenantId: tenant.id,
      slug: tenant.slug,
      ownerEmail,
      ownerPassword,
    }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(JSON.stringify({ ok: false, reason: "error", message: String(err?.message || err) }));
    process.exit(1);
  });
