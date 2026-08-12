# KlimaTech Serwis — Panel Klienta / Technika / Właściciela

Demonstracyjna aplikacja webowa dla firm serwisujących klimatyzację i pompy ciepła. Trzy panele w jednym systemie:

- **Panel Klienta** (`/`) — historia serwisowa urządzenia, status gwarancji, przypomnienia o obowiązkowych przeglądach szczelności (zgodność z rejestrem CRO), zgłaszanie awarii, dokumenty do pobrania.
- **Panel Technika** (`/technik`) — lista wizyt na dziś, zamykanie zlecenia z notatką, dokumentacją zdjęciową i podpisem klienta.
- **Panel Właściciela** (`/wlasciciel`) — status zgodności wszystkich klientów z obowiązkowymi przeglądami, statystyki ryzyka, grafik zespołu.

## Dane firmy i klienta

Wszystkie dane (nazwa firmy, branding, klienci, urządzenia, historia serwisowa) znajdują się w jednym pliku: `src/config/tenant.ts`. Dzięki temu panel można spersonalizować pod inną firmę bez zmian w kodzie widoków.

## Uruchomienie lokalne

Wymagany Node.js.

```sh
npm install
npm run dev
```

Aplikacja wystartuje pod `http://localhost:8080`.

## Build produkcyjny

```sh
npm run build
npm run preview
```

## Stos technologiczny

TanStack Start (React, SSR) + Vite + Tailwind CSS + shadcn/ui.
