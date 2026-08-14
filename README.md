<p align="center">
  <img src="public/readme-banner.svg" alt="KlimaTech Serwis — Panel Klienta, Technika i Właściciela" width="100%" />
</p>

<h3 align="center">Ile razy w tym roku zapomnieliście o terminie obowiązkowego przeglądu szczelności instalacji u klienta?</h3>

<p align="center">
  Ta aplikacja pilnuje tego za Was. Zero excela, zero karteczek, zero "chyba umówiłem tego klienta".
</p>

<p align="center">
  <a href="https://klimatech-repo.vercel.app/rejestracja"><strong>→ Załóż darmowe konto i wypróbuj</strong></a>
</p>

---

## Co to jest

Gotowy system SaaS dla firm serwisujących **klimatyzację i pompy ciepła** — trzy panele w jednym produkcie:

| Panel | Do czego służy |
|---|---|
| **Panel Właściciela** | Dodajesz klientów, urządzenia i techników, planujesz wizyty, widzisz status zgodności całej firmy z przeglądami jednym rzutem oka. |
| **Panel Technika** | Grafik wizyt na dziś, zamykanie zlecenia z notatką, dokumentacją zdjęciową i podpisem klienta na miejscu. |
| **Panel Klienta** | Historia serwisowa urządzenia, status gwarancji, automatyczne przypomnienie o obowiązkowym przeglądzie, zgłaszanie awarii. |

To nie jest statyczne demo — zarejestruj firmę, dodaj pierwszego klienta i technika, i od razu masz działający system.

## Dla kogo to jest

Jeśli prowadzisz firmę instalującą lub serwisującą klimatyzację/pompy ciepła i:
- gubisz terminy przeglądów szczelności i boisz się kontroli,
- prowadzisz historię klientów w Excelu albo na kartkach,
- Twoi technicy dzwonią do biura żeby sprawdzić co było u klienta ostatnim razem,

...to ten system rozwiązuje dokładnie ten problem.

## Jak zacząć

1. [Załóż konto firmy](https://klimatech-repo.vercel.app/rejestracja) — 2 minuty, za darmo
2. Dodaj pierwszego klienta, urządzenie i technika z panelu właściciela
3. Zaplanuj pierwszą wizytę — technik od razu zobaczy ją w swoim grafiku

## Wdrożenie pod Twoją firmę

Chcesz własny branding, import istniejącej bazy klientów albo pomoc z wdrożeniem?

**Napisz: [wojtekzieba.w@gmail.com](mailto:wojtekzieba.w@gmail.com)**

---

## Dla developerów

Stos: TanStack Start (React, SSR) + Vite + Tailwind CSS + shadcn/ui + Drizzle ORM + better-auth + Neon Postgres. Wszystkie dane firmy w bazie, konfiguracja per-tenant automatyczna po rejestracji.

```sh
npm install
npm run dev
```

Aplikacja wystartuje pod `http://localhost:8080`.
