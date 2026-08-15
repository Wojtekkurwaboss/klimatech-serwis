import { db } from "./client";
import { tenants, users, clients, devices, serviceEntries, visits, documents } from "./schema";
import { auth } from "@/lib/auth";

const DEMO_PASSWORD = "KlimaTechDemo2026!";

async function seed() {
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "KlimaTech Serwis",
      slug: "klimatech-demo",
      tagline: "Panel Klienta",
      logoUrl: "/logo-klimatech.svg",
      phone: "+48 22 000 12 34",
      email: "serwis@klimatech.pl",
    })
    .onConflictDoNothing({ target: tenants.slug })
    .returning();

  if (!tenant) {
    console.log("Seed tenant already exists (slug klimatech-demo) — skipping.");
    return;
  }

  const ownerSignUp = await auth.api.signUpEmail({
    body: {
      email: "wlasciciel@klimatech-demo.pl",
      password: DEMO_PASSWORD,
      name: "Właściciel KlimaTech",
      role: "owner",
      tenantId: tenant.id,
      firstName: "Właściciel",
      lastName: "KlimaTech",
    },
  });
  const ownerUser = { id: ownerSignUp.user.id };

  const technicianSignUp = await auth.api.signUpEmail({
    body: {
      email: "marek.nowak@klimatech-demo.pl",
      password: DEMO_PASSWORD,
      name: "Marek Nowak",
      role: "technician",
      tenantId: tenant.id,
      firstName: "Marek",
      lastName: "Nowak",
      certNumber: "F-GAZ/PL/2019/88213",
    },
  });
  const technicianUser = { id: technicianSignUp.user.id };

  const clientSignUp = await auth.api.signUpEmail({
    body: {
      email: "anna.kowalska@klimatech-demo.pl",
      password: DEMO_PASSWORD,
      name: "Anna Kowalska",
      role: "client",
      tenantId: tenant.id,
      firstName: "Anna",
      lastName: "Kowalska",
    },
  });
  const clientUser = { id: clientSignUp.user.id };

  const [client] = await db
    .insert(clients)
    .values({
      tenantId: tenant.id,
      userId: clientUser.id,
      address: "ul. Kwiatowa 14/3, 02-345 Warszawa",
      clientNumber: "KL-2023-0481",
    })
    .returning();

  const [device] = await db
    .insert(devices)
    .values({
      tenantId: tenant.id,
      clientId: client.id,
      model: "Daikin Perfera 3,5 kW",
      category: "Klimatyzacja split",
      installedAt: "2023-04-10",
      warrantyUntil: "2027-04-10",
      warrantyActive: true,
      croNumber: "CRO/2023/PL/0045128",
      refrigerant: "R32 · 1,15 kg",
      location: "Salon, parter",
      lastReviewAt: "2026-08-12",
      nextReviewDue: "2027-08-12",
    })
    .returning();

  await db.insert(serviceEntries).values([
    {
      tenantId: tenant.id,
      deviceId: device.id,
      date: "2023-04-10",
      type: "montaz",
      description: "Montaż jednostki Daikin Perfera 3,5 kW wraz z instalacją chłodniczą i odbiorem.",
      technicianId: null,
      protocolUrl: "#protokol-2023-04-10",
    },
    {
      tenantId: tenant.id,
      deviceId: device.id,
      date: "2024-05-14",
      type: "przeglad",
      description: "Przegląd okresowy: czyszczenie filtrów, kontrola ciśnień, dezynfekcja parownika.",
      technicianId: null,
      protocolUrl: "#protokol-2024-05-14",
    },
    {
      tenantId: tenant.id,
      deviceId: device.id,
      date: "2025-05-22",
      type: "naprawa",
      description: "Wymiana czujnika temperatury jednostki wewnętrznej, test szczelności.",
      technicianId: technicianUser.id,
      protocolUrl: "#protokol-2025-05-22",
    },
    {
      tenantId: tenant.id,
      deviceId: device.id,
      date: "2025-06-18",
      type: "uzupelnienie_czynnika",
      description: "Uzupełnienie czynnika R32 o 0,15 kg po wykryciu minimalnego ubytku.",
      technicianId: technicianUser.id,
      protocolUrl: "#protokol-2025-06-18",
    },
    {
      tenantId: tenant.id,
      deviceId: device.id,
      date: "2026-08-12",
      type: "przeglad",
      description:
        "Przegląd okresowy szczelności instalacji: kontrola złączek, brak wykrytych nieszczelności. Instalacja zgodna z wymogami F-gaz.",
      technicianId: technicianUser.id,
      protocolUrl: "#protokol-2026-08-12",
    },
  ]);

  await db.insert(documents).values([
    {
      tenantId: tenant.id,
      clientId: client.id,
      name: "Karta Urządzenia (CRO)",
      description: "Wpis w Centralnym Rejestrze Operatorów – CRO/2023/PL/0045128",
      fileUrl: "#karta-urzadzenia-cro",
      fileType: "PDF",
    },
    {
      tenantId: tenant.id,
      clientId: client.id,
      name: "Protokół montażu",
      description: "Protokół odbioru instalacji z dnia 10.04.2023",
      fileUrl: "#protokol-montazu",
      fileType: "PDF",
    },
    {
      tenantId: tenant.id,
      clientId: client.id,
      name: "Certyfikat gwarancji",
      description: "Gwarancja producenta ważna do 10.04.2027",
      fileUrl: "#certyfikat-gwarancji",
      fileType: "PDF",
    },
  ]);

  // Remaining demo clients from tenant.ts's todayVisits/clientsOverview (no client-panel
  // login for these — technician/owner-panel data only, same as the original static demo).
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
    {
      name: "Tomasz Dąbrowski",
      address: "ul. Wierzbowa 21, Józefosław",
      device: { model: "Samsung Wind-Free 5,0 kW", category: "Klimatyzacja split", croNumber: null },
      visit: { time: "16:00", plannedType: "montaz" as const, note: "Nowa instalacja – przygotowana trasa chłodnicza i przepust." },
      review: { lastReviewAt: "2025-08-12", nextReviewDue: "2026-08-12" },
    },
  ];

  let seq = 2;
  for (const row of otherClientsSeed) {
    const seedUserId = `seed-client-${seq}`;
    const [otherClientUser] = await db
      .insert(users)
      .values({
        id: seedUserId,
        name: row.name,
        email: `${seedUserId}@klimatech-demo.pl`,
        role: "client",
        tenantId: tenant.id,
        firstName: row.name.split(" ")[0],
        lastName: row.name.split(" ").slice(1).join(" ") || row.name,
      })
      .returning();

    const [otherClient] = await db
      .insert(clients)
      .values({
        tenantId: tenant.id,
        userId: otherClientUser.id,
        address: row.address,
        clientNumber: `KL-2023-${1000 + seq}`,
      })
      .returning();

    const [otherDevice] = await db
      .insert(devices)
      .values({
        tenantId: tenant.id,
        clientId: otherClient.id,
        model: row.device.model,
        category: row.device.category,
        installedAt: row.review.lastReviewAt,
        warrantyActive: false,
        croNumber: row.device.croNumber,
        lastReviewAt: row.review.lastReviewAt,
        nextReviewDue: row.review.nextReviewDue,
      })
      .returning();

    await db.insert(visits).values({
      tenantId: tenant.id,
      clientId: otherClient.id,
      deviceId: otherDevice.id,
      technicianId: technicianUser.id,
      scheduledAt: new Date(`${new Date().toISOString().slice(0, 10)}T${row.visit.time}:00`),
      plannedType: row.visit.plannedType,
      lastVisitNote: row.visit.note,
      croNumber: row.device.croNumber,
    });

    seq += 1;
  }

  // Anna Kowalska's own visit (client #1), completed today per the resolved-overdue-review flow.
  await db.insert(visits).values({
    tenantId: tenant.id,
    clientId: client.id,
    deviceId: device.id,
    technicianId: technicianUser.id,
    scheduledAt: new Date(`${new Date().toISOString().slice(0, 10)}T08:30:00`),
    plannedType: "przeglad",
    lastVisitNote: "Wykryto minimalny ubytek czynnika – sprawdzić szczelność złączek.",
    croNumber: device.croNumber,
    status: "completed",
    closedAt: new Date(),
  });

  console.log(`Seeded tenant "${tenant.slug}" (${tenant.id}) with owner/technician/5 clients.`);
  console.log(`Demo login password for all three role accounts: ${DEMO_PASSWORD}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
