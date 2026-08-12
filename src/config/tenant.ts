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

export const tenantConfig = {
  company: {
    name: "KlimaTech Serwis",
    tagline: "Panel Klienta",
    // Wgraj logo do src/assets i ustaw ścieżkę, aby zastąpić wersję tekstową.
    logoUrl: null as string | null,
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
    active: true,
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