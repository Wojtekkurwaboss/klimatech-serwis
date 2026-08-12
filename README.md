<p align="center">
  <img src="public/readme-banner.svg" alt="KlimaTech Serwis — Panel Klienta, Technika i Właściciela" width="100%" />
</p>

<h3 align="center">Ile razy w tym roku zapomnieliście o terminie obowiązkowego przeglądu szczelności instalacji u klienta?</h3>

<p align="center">
  Ta aplikacja pilnuje tego za Was. Zero excela, zero karteczek, zero "chyba umówiłem tego klienta".
</p>

<p align="center">
  <a href="https://klimatech-repo.vercel.app"><strong>→ Zobacz działające demo</strong></a>
</p>

---

## Co to jest

Gotowy system dla firm serwisujących **klimatyzację i pompy ciepła** — trzy panele w jednym produkcie:

| Panel | Do czego służy |
|---|---|
| **Panel Klienta** | Historia serwisowa urządzenia, status gwarancji, automatyczne przypomnienie o obowiązkowym przeglądzie (z jasno pokazanym ryzykiem kontroli/kary), zgłaszanie awarii, dokumenty do pobrania. |
| **Panel Technika** | Grafik wizyt na dziś, zamykanie zlecenia z notatką, dokumentacją zdjęciową i podpisem klienta na miejscu. |
| **Panel Właściciela** | Status zgodności wszystkich klientów z przeglądami w jednym miejscu, statystyki ryzyka, grafik zespołu. |

Demo pokazuje przykładową firmę (KlimaTech Serwis) z przykładowymi klientami — dokładnie tak będzie wyglądać u Ciebie, tylko z Twoim brandingiem i Twoimi danymi.

## Dla kogo to jest

Jeśli prowadzisz firmę instalującą lub serwisującą klimatyzację/pompy ciepła i:
- gubisz terminy przeglądów szczelności i boisz się kontroli,
- prowadzisz historię klientów w Excelu albo na kartkach,
- Twoi technicy dzwonią do biura żeby sprawdzić co było u klienta ostatnim razem,

...to ten system rozwiązuje dokładnie ten problem.

## Personalizacja pod Twoją firmę

Robię darmową personalizację demo pod Wasz branding (logo, kolory, nazwa firmy) i przykładowe dane — żebyście zobaczyli dokładnie jak to będzie wyglądać u Was, zanim cokolwiek zapłacicie.

**Napisz: [wojtekzieba.w@gmail.com](mailto:wojtekzieba.w@gmail.com)**

---

## Dla developerów

Stos: TanStack Start (React, SSR) + Vite + Tailwind CSS + shadcn/ui. Wszystkie dane firmy/klientów w jednym pliku `src/config/tenant.ts` — łatwa personalizacja bez zmian w kodzie widoków.

```sh
npm install
npm run dev
```

Aplikacja wystartuje pod `http://localhost:8080`.
