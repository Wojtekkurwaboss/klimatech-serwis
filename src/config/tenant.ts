/**
 * Jedyne miejsce z danymi firmy i klienta.
 * Podmień zawartość tego pliku, aby uruchomić panel dla innej firmy/klienta.
 */

export type ServiceType = "montaż" | "przegląd" | "naprawa" | "uzupełnienie czynnika";

export interface ServiceEntry {
  id: string;
  date: string;
  type: ServiceType;
  description: string;
  technician?: string;
  protocolUrl: string;
}

export interface DeviceInfo {
  id: string;
  model: string;
  category: string;
  installedAt: string;
  warrantyUntil: string;
  warrantyActive: boolean;
  croNumber: string;
  refrigerant: string;
  location: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  fileType: string;
}

export interface Visit {
  id: string;
  time: string;
  clientName: string;
  address: string;
  deviceModel: string;
  deviceCategory: string;
  plannedType: ServiceType;
  lastVisitNote: string;
  croNumber: string;
}

export const technician = {
  firstName: "Marek",
  lastName: "Nowak",
  role: "Technik serwisu",
  certNumber: "F-GAZ/PL/2019/88213",
};

export const todayVisits: Visit[] = [
  {
    id: "v1",
    time: "08:30",
    clientName: "Anna Kowalska",
    address: "ul. Kwiatowa 14/3, Warszawa",
    deviceModel: "Daikin Perfera 3,5 kW",
    deviceCategory: "Klimatyzacja split",
    plannedType: "przegląd",
    lastVisitNote: "Wykryto minimalny ubytek czynnika – sprawdzić szczelność złączek.",
    croNumber: "CRO/2023/PL/0045128",
  },
  {
    id: "v2",
    time: "10:00",
    clientName: "Piotr Lewandowski",
    address: "ul. Sosnowa 8, Piaseczno",
    deviceModel: "Mitsubishi MSZ-AP 2,5 kW",
    deviceCategory: "Klimatyzacja split",
    plannedType: "naprawa",
    lastVisitNote: "Klient zgłaszał hałas jednostki zewnętrznej przy starcie.",
    croNumber: "CRO/2022/PL/0031907",
  },
  {
    id: "v3",
    time: "11:45",
    clientName: "Biuro Rachunkowe Saldo",
    address: "al. Niepodległości 120, Warszawa",
    deviceModel: "LG Multi V S 12 kW",
    deviceCategory: "System multi-split",
    plannedType: "uzupełnienie czynnika",
    lastVisitNote: "Ciśnienie poniżej normy, zalecane uzupełnienie R410A.",
    croNumber: "CRO/2021/PL/0018442",
  },
  {
    id: "v4",
    time: "14:15",
    clientName: "Katarzyna Wiśniewska",
    address: "ul. Polna 3, Konstancin",
    deviceModel: "Panasonic Aquarea 9 kW",
    deviceCategory: "Pompa ciepła",
    plannedType: "przegląd",
    lastVisitNote: "Po sezonie grzewczym – kontrola zasobnika i pracy sprężarki.",
    croNumber: "CRO/2024/PL/0057110",
  },
  {
    id: "v5",
    time: "16:00",
    clientName: "Tomasz Dąbrowski",
    address: "ul. Wierzbowa 21, Józefosław",
    deviceModel: "Samsung Wind-Free 5,0 kW",
    deviceCategory: "Klimatyzacja split",
    plannedType: "montaż",
    lastVisitNote: "Nowa instalacja – przygotowana trasa chłodnicza i przepust.",
    croNumber: "—",
  },
];

export type ReviewStatus = "overdue" | "upcoming" | "ok";

export interface ClientOverview {
  id: string;
  clientName: string;
  deviceModel: string;
  deviceCategory: string;
  lastReview: string;
  nextReviewDue: string;
  status: ReviewStatus;
  /** Dni po terminie (tylko dla statusu "overdue"). */
  overdueDays?: number;
  /** Dni do terminu (tylko dla statusu "upcoming"). */
  dueInDays?: number;
}

/** Ranga pilności do sortowania — im mniejsza, tym pilniejsze. */
export const statusRank: Record<ReviewStatus, number> = { overdue: 0, upcoming: 1, ok: 2 };

/** Oblicza status przeglądu na podstawie daty następnego przeglądu (runtime, nie ze statycznych danych). */
export function computeReviewStatus(
  nextReviewDue: string,
  now: Date = new Date(),
): { status: ReviewStatus; overdueDays?: number; dueInDays?: number } {
  const due = new Date(nextReviewDue);
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { status: "overdue", overdueDays: -diffDays };
  if (diffDays <= 14) return { status: "upcoming", dueInDays: diffDays };
  return { status: "ok" };
}

export const statusMeta: Record<ReviewStatus, { label: string; className: string }> = {
  overdue: { label: "Zaległy", className: "bg-alert/15 text-alert border border-alert/30" },
  upcoming: {
    label: "Zbliża się",
    className: "bg-[oklch(0.85_0.14_85)] text-[oklch(0.32_0.09_75)] border border-[oklch(0.7_0.14_80)]/40",
  },
  ok: { label: "Aktualny", className: "bg-success-soft text-success border border-success/25" },
};

export const clientsOverview: ClientOverview[] = [
  {
    id: "co-1",
    clientName: "Anna Kowalska",
    deviceModel: "Daikin Perfera 3,5 kW",
    deviceCategory: "Klimatyzacja split",
    lastReview: "2026-08-12",
    nextReviewDue: "2027-08-12",
    status: "ok",
  },
  {
    id: "co-2",
    clientName: "Piotr Lewandowski",
    deviceModel: "Mitsubishi MSZ-AP 2,5 kW",
    deviceCategory: "Klimatyzacja split",
    lastReview: "2024-08-02",
    nextReviewDue: "2025-08-07",
    status: "overdue",
    overdueDays: 5,
  },
  {
    id: "co-3",
    clientName: "Biuro Rachunkowe Saldo",
    deviceModel: "LG Multi V S 12 kW",
    deviceCategory: "System multi-split",
    lastReview: "2024-08-20",
    nextReviewDue: "2025-08-18",
    status: "upcoming",
    dueInDays: 6,
  },
  {
    id: "co-4",
    clientName: "Katarzyna Wiśniewska",
    deviceModel: "Panasonic Aquarea 9 kW",
    deviceCategory: "Pompa ciepła",
    lastReview: "2025-02-10",
    nextReviewDue: "2026-02-12",
    status: "ok",
  },
  {
    id: "co-5",
    clientName: "Tomasz Dąbrowski",
    deviceModel: "Samsung Wind-Free 5,0 kW",
    deviceCategory: "Klimatyzacja split",
    lastReview: "2025-08-12",
    nextReviewDue: "2026-08-12",
    status: "ok",
  },
];

export const serviceTypes: ServiceType[] = [
  "przegląd",
  "naprawa",
  "uzupełnienie czynnika",
  "montaż",
];

/** Czynności wymagające wpisu do Centralnego Rejestru Operatorów. */
export const croRequiredTypes: ServiceType[] = ["uzupełnienie czynnika", "przegląd"];

export const tenantConfig = {
  company: {
    name: "KlimaTech Serwis",
    tagline: "Panel Klienta",
    // Podmień plik w public/ (lub wgraj nowy do src/assets) i zaktualizuj ścieżkę.
    logoUrl: "/logo-klimatech.svg" as string | null,
    phone: "+48 22 000 12 34",
    email: "serwis@klimatech.pl",
  },
  client: {
    firstName: "Anna",
    lastName: "Kowalska",
    address: "ul. Kwiatowa 14/3, 02-345 Warszawa",
    clientNumber: "KL-2023-0481",
  },
  alert: {
    active: false,
    title: "Zaległy przegląd szczelności instalacji",
    message:
      "Twój obowiązkowy przegląd szczelności instalacji jest zaległy o 12 dni – umów wizytę, aby uniknąć ryzyka kontroli i utraty gwarancji",
    ctaLabel: "Umów przegląd",
    overdueDays: 12,
  },
  devices: [
    {
      id: "dev-1",
      model: "Daikin Perfera 3,5 kW",
      category: "Klimatyzacja split",
      installedAt: "2023-04-10",
      warrantyUntil: "2027-04-10",
      warrantyActive: true,
      croNumber: "CRO/2023/PL/0045128",
      refrigerant: "R32 · 1,15 kg",
      location: "Salon, parter",
    },
  ] satisfies DeviceInfo[],
  serviceHistory: [
    {
      id: "srv-5",
      date: "2026-08-12",
      type: "przegląd",
      description: "Przegląd okresowy szczelności instalacji: kontrola złączek, brak wykrytych nieszczelności. Instalacja zgodna z wymogami F-gaz.",
      technician: "M. Nowak",
      protocolUrl: "#protokol-2026-08-12",
    },
    {
      id: "srv-4",
      date: "2025-06-18",
      type: "uzupełnienie czynnika",
      description: "Uzupełnienie czynnika R32 o 0,15 kg po wykryciu minimalnego ubytku.",
      technician: "M. Nowak",
      protocolUrl: "#protokol-2025-06-18",
    },
    {
      id: "srv-3",
      date: "2025-05-22",
      type: "naprawa",
      description: "Wymiana czujnika temperatury jednostki wewnętrznej, test szczelności.",
      technician: "M. Nowak",
      protocolUrl: "#protokol-2025-05-22",
    },
    {
      id: "srv-2",
      date: "2024-05-14",
      type: "przegląd",
      description: "Przegląd okresowy: czyszczenie filtrów, kontrola ciśnień, dezynfekcja parownika.",
      technician: "P. Zielińska",
      protocolUrl: "#protokol-2024-05-14",
    },
    {
      id: "srv-1",
      date: "2023-04-10",
      type: "montaż",
      description: "Montaż jednostki Daikin Perfera 3,5 kW wraz z instalacją chłodniczą i odbiorem.",
      technician: "P. Zielińska",
      protocolUrl: "#protokol-2023-04-10",
    },
  ] satisfies ServiceEntry[],
  documents: [
    {
      id: "doc-1",
      name: "Karta Urządzenia (CRO)",
      description: "Wpis w Centralnym Rejestrze Operatorów – CRO/2023/PL/0045128",
      fileUrl: "#karta-urzadzenia-cro",
      fileType: "PDF",
    },
    {
      id: "doc-2",
      name: "Protokół montażu",
      description: "Protokół odbioru instalacji z dnia 10.04.2023",
      fileUrl: "#protokol-montazu",
      fileType: "PDF",
    },
    {
      id: "doc-3",
      name: "Certyfikat gwarancji",
      description: "Gwarancja producenta ważna do 10.04.2027",
      fileUrl: "#certyfikat-gwarancji",
      fileType: "PDF",
    },
  ] satisfies DocumentItem[],
};

export const formatPlDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" });