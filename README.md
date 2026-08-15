<div align="center">

<img src="public/readme-banner.svg" alt="KLIMATECH — platforma SaaS dla firm HVAC" width="100%" />

# ❄️ KLIMATECH

### Platforma do zarządzania firmą serwisującą klimatyzację i pompy ciepła

**Klient • Serwisant • Właściciel — jeden system**

<br>

[🚀 **OTWÓRZ LIVE DEMO**](https://klimatech-repo.vercel.app)

<br>

</div>

---

## 💡 O projekcie

**KLIMATECH** to demonstracyjna platforma SaaS stworzona z myślą o firmach zajmujących się montażem i serwisem **klimatyzacji oraz pomp ciepła**.

Celem projektu jest zebranie najważniejszych procesów firmy serwisowej w jednym systemie — od zgłoszenia klienta, przez pracę serwisanta, aż po zarządzanie całą firmą przez właściciela.

System posiada **trzy oddzielne role użytkowników**, z których każda otrzymuje własny panel i funkcje dopasowane do swojej pracy.

---

# 👤 Panel Klienta

Klient otrzymuje własne miejsce do obsługi urządzeń i kontaktu z firmą.

### Najważniejsze możliwości:

* zgłaszanie awarii i problemów,
* podgląd aktualnych zgłoszeń,
* śledzenie statusu realizacji,
* historia serwisowa urządzeń,
* informacje o zaplanowanych wizytach,
* dane dotyczące posiadanych urządzeń,
* komunikacja z firmą serwisową.

---

# 🔧 Panel Serwisanta

Serwisant otrzymuje przejrzysty panel swojej codziennej pracy.

### Najważniejsze możliwości:

* lista przypisanych zleceń,
* dzienny harmonogram wizyt,
* dane klienta i lokalizacja,
* informacje o urządzeniu,
* historia wcześniejszych prac,
* checklisty wykonywanych czynności,
* notatki serwisowe,
* zmiana statusu realizacji zlecenia,
* dokumentowanie wykonanej pracy.

---

# 📊 Panel Właściciela

Panel właściciela pozwala zarządzać działalnością firmy z jednego miejsca.

### Najważniejsze możliwości:

* zarządzanie klientami,
* zarządzanie serwisantami,
* zarządzanie urządzeniami,
* tworzenie i przydzielanie zleceń,
* planowanie wizyt,
* kontrolowanie statusów realizacji,
* podgląd aktywności zespołu,
* historia wykonanych usług,
* statystyki i dane operacyjne firmy.

---

## 🔄 Jak wygląda cały proces?

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
Widzą historię wykonanej usługi
```

Wszystkie role działają w ramach jednego systemu.

---

# 🚀 Live Demo

Projekt jest dostępny online:

### 👉 https://klimatech-repo.vercel.app

Możesz przejść przez aplikację i zobaczyć sposób działania systemu z perspektywy różnych użytkowników.

---

# 🏢 Dla kogo powstał KLIMATECH?

Projekt został zaprojektowany przede wszystkim dla:

* firm instalujących klimatyzację,
* firm serwisujących klimatyzację,
* instalatorów pomp ciepła,
* firm HVAC,
* lokalnych firm posiadających kilku serwisantów,
* przedsiębiorstw chcących odejść od Excela, kartek i rozproszonych systemów.

---

# 🎯 Problem

W wielu małych i średnich firmach serwisowych informacje są rozdzielone pomiędzy:

* Excel,
* kalendarz,
* wiadomości,
* telefony,
* dokumenty papierowe,
* notatki pracowników.

Powoduje to problemy z kontrolowaniem zleceń, historią klientów i organizacją pracy serwisantów.

### KLIMATECH pokazuje, jak można połączyć te procesy w jednej aplikacji.

---

# 🧩 Architektura

Platforma została zaprojektowana jako aplikacja **multi-user / multi-role**, w której różne typy użytkowników korzystają z tego samego systemu, ale mają dostęp do innych funkcji.

```text
                 ┌─────────────────┐
                 │    KLIMATECH    │
                 └────────┬────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼

      👤 KLIENT      🔧 SERWISANT    📊 WŁAŚCICIEL

      Zgłoszenia      Zlecenia       Zarządzanie
      Urządzenia      Harmonogram    Klienci
      Historia        Realizacja     Zespół
      Wizyty          Dokumentacja   Statystyki
```

---

# 🛠️ Technologie

Projekt wykorzystuje nowoczesny stack aplikacji webowych:

### Frontend

* **React 19**
* **TypeScript**
* **TanStack Start**
* **TanStack Router**
* **TanStack Query**
* **Tailwind CSS**
* **Radix UI / shadcn-style components**
* **Lucide Icons**
* **Recharts**

### Backend / dane

* **TanStack Start — server functions / SSR**
* **Drizzle ORM**
* **Neon PostgreSQL**
* **Better Auth**
* **Zod**
* **Resend**

### Deployment

* **Vercel**
* **GitHub**

---

# 🗄️ Dane i bezpieczeństwo

Poufne dane konfiguracyjne nie są przechowywane bezpośrednio w kodzie aplikacji.

Konfiguracja środowiska wykorzystuje zmienne środowiskowe, między innymi:

```env
DATABASE_URL=
```

Pliki `.env` są wykluczone z repozytorium przez `.gitignore`.

---

# 💻 Uruchomienie lokalne

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/Wojtekkurwaboss/klimatech-serwis.git
```

### 2. Przejdź do katalogu

```bash
cd klimatech-serwis
```

### 3. Zainstaluj zależności

```bash
npm install
```

### 4. Skonfiguruj zmienne środowiskowe

Utwórz lokalny plik:

```text
.env.local
```

i dodaj wymagane zmienne środowiskowe.

### 5. Uruchom aplikację

```bash
npm run dev
```

---

# 📌 Status projektu

**KLIMATECH jest projektem demonstracyjnym / portfolio**, pokazującym koncepcję kompletnego systemu SaaS dla branży HVAC.

Projekt może być dalej rozwijany między innymi o:

* płatności i abonamenty,
* automatyczne przypomnienia,
* faktury,
* zaawansowane raporty,
* zarządzanie magazynem części,
* automatyzacje e-mail / SMS,
* integracje z zewnętrznymi systemami,
* aplikację mobilną dla serwisantów.

---

# 🤝 Wdrożenie dla firmy

System może stanowić bazę pod rozwiązanie dostosowane do konkretnej firmy serwisowej.

Możliwe jest między innymi dostosowanie:

* brandingu,
* funkcji,
* struktury użytkowników,
* procesów firmy,
* formularzy,
* paneli,
* automatyzacji,
* bazy klientów.

### Kontakt

📧 **[wojtekzieba.w@gmail.com](mailto:wojtekzieba.w@gmail.com)**

---

<div align="center">

### ❄️ KLIMATECH

**Nowoczesne zarządzanie firmą HVAC w jednym systemie.**

[🚀 Live Demo](https://klimatech-repo.vercel.app) • [💻 GitHub](https://github.com/Wojtekkurwaboss/klimatech-serwis)

</div>
