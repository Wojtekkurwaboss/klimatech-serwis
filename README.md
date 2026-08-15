<p align="center">
  <img src="public/klimatech-github-social-preview.jpg" alt="KLIMATECH — platforma SaaS dla firm HVAC" width="100%" />
</p>

<div align="center">

# ❄️ KLIMATECH

### Platforma SaaS do zarządzania firmą HVAC

**Panel klienta • Panel serwisanta • Panel właściciela**

<br>

[🚀 **ZOBACZ LIVE DEMO — 3 ROLE**](https://klimatech-repo.vercel.app/logowanie)

</div>

---

## 💡 Czym jest KLIMATECH?

**KLIMATECH** to demonstracyjna aplikacja SaaS stworzona dla firm zajmujących się montażem i serwisem klimatyzacji oraz pomp ciepła.

System łączy w jednym miejscu trzy najważniejsze strony całego procesu:

* 👤 **Klienta**
* 🔧 **Serwisanta**
* 📊 **Właściciela firmy**

Celem projektu jest uproszczenie obsługi zgłoszeń, planowania wizyt, realizacji zleceń oraz zarządzania firmą serwisową.

---

## 👤 Panel Klienta

Klient otrzymuje własny panel, w którym może:

* zgłaszać awarie i problemy,
* sprawdzać status zgłoszenia,
* przeglądać zaplanowane wizyty,
* śledzić historię serwisową urządzeń,
* przeglądać swoje urządzenia,
* komunikować się z firmą serwisową.

---

## 🔧 Panel Serwisanta

Serwisant otrzymuje panel dopasowany do codziennej pracy w terenie.

Może między innymi:

* przeglądać przypisane zlecenia,
* sprawdzać harmonogram dnia,
* otwierać szczegóły wizyty,
* przeglądać dane klienta,
* sprawdzać historię urządzenia,
* prowadzić checklistę wykonanych prac,
* dodawać notatki,
* aktualizować status realizacji.

---

## 📊 Panel Właściciela

Właściciel firmy otrzymuje centralny panel zarządzania.

Może:

* zarządzać klientami,
* zarządzać serwisantami,
* zarządzać urządzeniami,
* tworzyć i przypisywać zlecenia,
* planować wizyty,
* kontrolować statusy zleceń,
* monitorować aktywność zespołu,
* analizować dane i statystyki firmy.

---

## 🔄 Jak działa system?

```text
KLIENT
   ↓
Tworzy zgłoszenie
   ↓
WŁAŚCICIEL / BIURO
   ↓
Planuje wizytę i przypisuje serwisanta
   ↓
SERWISANT
   ↓
Realizuje zlecenie
   ↓
Aktualizuje status i dokumentację
   ↓
KLIENT + WŁAŚCICIEL
   ↓
Mają dostęp do historii wykonanej usługi
```

---

# 🚀 Live Demo

Aplikacja posiada przygotowane **trzy konta demonstracyjne**, dzięki którym można zobaczyć cały system z perspektywy klienta, serwisanta oraz właściciela firmy.

### 👉 [OTWÓRZ DEMO](https://klimatech-repo.vercel.app/logowanie)

Nie trzeba tworzyć konta ani konfigurować firmy.

Wystarczy zalogować się kolejno na poniższe konta:

| Rola              | E-mail                            | Hasło                |
| ----------------- | --------------------------------- | -------------------- |
| 📊 **Właściciel** | `wlasciciel@klimatech-demo.pl`    | `KlimaTechDemo2026!` |
| 🔧 **Serwisant**  | `marek.nowak@klimatech-demo.pl`   | `KlimaTechDemo2026!` |
| 👤 **Klient**     | `anna.kowalska@klimatech-demo.pl` | `KlimaTechDemo2026!` |

### Co warto zobaczyć?

**📊 Zaloguj się jako właściciel**, aby zobaczyć zarządzanie firmą, klientami, zespołem, zleceniami i statystykami.

**🔧 Zaloguj się jako serwisant**, aby zobaczyć harmonogram, przypisane zlecenia, dane klientów i proces realizacji pracy.

**👤 Zaloguj się jako klient**, aby zobaczyć zgłoszenia, wizyty, urządzenia i historię kontaktu z serwisem.

> Konta oraz dane znajdujące się w wersji demonstracyjnej służą wyłącznie do prezentacji działania systemu.

---

## 🎯 Dla kogo?

KLIMATECH został zaprojektowany z myślą o:

* firmach HVAC,
* firmach montujących klimatyzację,
* serwisach klimatyzacji,
* instalatorach pomp ciepła,
* firmach posiadających kilku serwisantów,
* przedsiębiorstwach chcących uporządkować obsługę klientów i zleceń.

---

## 🧩 Trzy role — jeden system

| Rola              | Główne funkcje                                        |
| ----------------- | ----------------------------------------------------- |
| 👤 **Klient**     | Zgłoszenia, wizyty, urządzenia, historia, komunikacja |
| 🔧 **Serwisant**  | Harmonogram, zlecenia, realizacja, dokumentacja       |
| 📊 **Właściciel** | Klienci, zespół, zlecenia, statystyki, zarządzanie    |

---

## 🛠️ Technologie

### Frontend

* React
* TypeScript
* TanStack Start
* TanStack Router
* TanStack Query
* Tailwind CSS
* Radix UI
* Lucide Icons
* Recharts

### Backend i dane

* TanStack Start
* Drizzle ORM
* Neon PostgreSQL
* Better Auth
* Zod
* Resend

### Deployment

* Vercel
* GitHub

---

## 🔐 Bezpieczeństwo

Poufne dane aplikacji są przechowywane w zmiennych środowiskowych.

Przykład:

```env
DATABASE_URL=
```

Pliki `.env` oraz `.env*` są wykluczone z repozytorium przez `.gitignore`.

---

## 💻 Uruchomienie lokalne

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/Wojtekkurwaboss/klimatech-serwis.git
```

### 2. Przejdź do projektu

```bash
cd klimatech-serwis
```

### 3. Zainstaluj zależności

```bash
npm install
```

### 4. Dodaj zmienne środowiskowe

Utwórz:

```text
.env.local
```

i dodaj wymagane dane konfiguracyjne.

### 5. Uruchom aplikację

```bash
npm run dev
```

---

## 📌 Status projektu

KLIMATECH jest obecnie **projektem demonstracyjnym i portfolio** pokazującym koncepcję rozbudowanej platformy SaaS dla branży HVAC.

Projekt może zostać dalej rozwinięty między innymi o:

* 💳 abonamenty i płatności,
* 🔔 automatyczne przypomnienia,
* 📱 aplikację mobilną dla serwisantów,
* 📦 magazyn części,
* 📄 faktury i dokumenty,
* 📲 powiadomienia SMS,
* 📧 automatyzacje e-mail,
* 📈 bardziej rozbudowane raporty,
* 🔌 integracje z innymi systemami.

---

## 🤝 Wdrożenie dla firmy

Platforma może być dalej dostosowywana pod potrzeby konkretnej firmy HVAC.

Możliwe jest dostosowanie:

* brandingu,
* funkcjonalności,
* paneli użytkowników,
* procesów firmy,
* automatyzacji,
* formularzy,
* raportów,
* struktury klientów i pracowników.

### 📧 Kontakt

**[wojtekzieba.w@gmail.com](mailto:wojtekzieba.w@gmail.com)**

---

<div align="center">

## ❄️ KLIMATECH

**Klient. Serwisant. Właściciel. Jeden system.**

[🚀 Live Demo](https://klimatech-repo.vercel.app/logowanie) • [💻 GitHub](https://github.com/Wojtekkurwaboss/klimatech-serwis)

</div>
