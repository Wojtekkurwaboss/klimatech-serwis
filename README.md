# KlimaTech Client Hub

> Zbuduj aplikację webową "Panel Klienta KlimaTech Serwis" dla firmy serwisującej klimatyzację i pompy ciepła. Styl: profesjonalny, techniczny, granat (#0F3D5C) + biel + pomarańczowy akcent (#F2994A) na alertach. Logo jako tekst "KlimaTech Serwis" w nagłówku (miejsce na wgranie prawdziwego logo później).

>

> Strona główna po zalogowaniu klienta (Anna Kowalska) pokazuje:

> 1. Duży baner alertowy na górze: "Twój obowiązkowy przegląd szczelności instalacji jest zaległy o 12 dni – umów wizytę, aby uniknąć ryzyka kontroli i utraty gwarancji" (kolor czerwony/pomarańczowy, przycisk "Umów przegląd").

> 2. Kartę urządzenia: model (Daikin 3,5kW), data montażu, status gwarancji (aktywna do 2027-04-10), numer w Centralnym Rejestrze Operatorów (przykładowy).

> 3. Historię serwisów w formie listy/timeline: data, typ czynności (montaż / przegląd / naprawa / uzupełnienie czynnika), krótki opis, ikona "protokół PDF" przy każdym wpisie.

> 4. Przycisk "Zgłoś awarię" otwierający prosty formularz (opis problemu + zdjęcie).

> 5. Sekcję "Dokumenty" z listą: Karta Urządzenia (CRO), Protokół montażu, Certyfikat gwarancji – jako linki/pliki placeholder.

>

> Dane trzymaj w jednym pliku konfiguracyjnym (nazwa firmy, kolory, dane klienta, urządzenia, historia serwisów) tak, żeby dało się je łatwo podmienić dla innej firmy i innego klienta bez przepisywania widoków.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/79fa9987-1ec0-470d-a8c1-9c7af2af19be).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
