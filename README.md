# Kantina – kantineapp for OsloMet-studenter

En mobilapp der studenter kan velge kantine ut fra hvilket bygg de er i, se menyen med priser og tilbud, og finne varer som er rabattert fordi datoen nærmer seg. Appen lar dem også reservere mat de henter selv, eller bestille mat levert dit de sitter.

> **Prototype:** Kantiner, menyer og priser er eksempeldata. Bestillinger lagres bare i minnet på telefonen, og statusen på bestillingen er simulert. Ingen betaling eller server er koblet til ennå.

## Funksjoner

- Velg kantine, gruppert etter campus og bygg, med åpningstider og «Åpent nå»
- Meny gruppert etter kategori, med filter for «Tilbud og rabatt»
- Automatisk **datorabatt**: 50 % siste salgsdag, 30 % dagen før (endres i `src/utils/pris.ts`)
- Faste **tilbud** per vare
- Handlekurv med antall, lagerbegrensning og «du sparer»
- **Hent selv** med valgt hentetid, eller **lever til meg** med plassering
- Kvittering med hentekode og bestillingsoversikt
- **Min Side** (ikon øverst til høyre): profil, mine bestillinger, allergier og kosthold, favorittkantine
- Menyen markerer varer som ikke passer kostholdet ditt, og har filteret «Passer for meg»
- Innlogging kreves for å bestille. Innlogging og preferanser lagres på telefonen
- **Søk** i menyen og **ukemeny** med dagvelger (mandag–fredag) og dagens varmrett
- **«Hvor fullt er det?»** – travelhet time for time, med tips om roligste tidspunkt
- **Kaffekort** (10. kaffe gratis) og **matsvinn-teller** på Min side
- **Varsel** på startsiden når favorittkantina har «Redd maten»-tilbud
- **Bestill igjen** og **tilbakemelding** (1–5 stjerner) på tidligere bestillinger
- **Mørk modus** og tekststørrelse følger telefonens innstillinger
- Bestillinger lagres på enheten

## Innlogging med Feide

Appen bruker foreløpig **demo-innlogging** med en testbruker. Koden for ekte Feide (OpenID Connect med PKCE) ligger klar i `src/auth/`. Slik slår du den på:

1. Registrer tjenesten i [Feides kundeportal](https://kunde.feide.no) og legg til en OIDC-konfigurasjon.
2. Legg inn redirect-URL-en appen skriver ut i terminalen (`Feide redirect URI: …`).
3. Slå på «Feide test users» for testing. OsloMet må aktivere tjenesten før ekte studenter kan logge inn.
4. Lim inn client ID i `src/auth/feide.ts`.
5. Bruk en development build (`npx expo run:ios`), siden Expo Go ikke støtter appens egen URL (`kantineapp://`).

Se [Feides dokumentasjon](https://docs.feide.no/reference/oauth_oidc/openid_connect_details.html).

## Teknologi

- [Expo](https://expo.dev) og React Native med TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for navigasjon (filbasert: hver fil i `app/` er en skjerm)
- React Context og `useReducer` for handlekurven

## Mappestruktur

```
app/                      Skjermer (Expo Router)
  _layout.tsx             Navigasjon og felles oppsett
  index.tsx               Velg kantine
  kantine/[id].tsx        Menyen til én kantine
  handlekurv.tsx          Handlekurv og bestilling
  bestillinger/index.tsx  Mine bestillinger
  bestillinger/[id].tsx   Kvittering og status
src/
  components/             Gjenbrukbare UI-komponenter
  context/                Handlekurv og bestillinger (global state)
  data/                   Eksempeldata: kantiner og varer
  hooks/                  Egne React-hooks
  utils/                  Dato, pris og status
  theme.ts                Farger, avstander og tekststiler
  types.ts                Datatyper
```

## Kom i gang

Du trenger [Node.js](https://nodejs.org) (LTS-versjonen), [VS Code](https://code.visualstudio.com) og appen **Expo Go** på telefonen (App Store / Google Play).

```bash
npm install
npx expo start
```

Skann QR-koden med kameraet (iPhone) eller i Expo Go (Android). Telefonen og PC-en må være på samme nettverk.

## Videre arbeid

- [ ] Backend/database for menyer, lager og bestillinger (f.eks. Supabase eller Firebase)
- [ ] Ekte Feide-innlogging (se over)
- [ ] Betaling (f.eks. Vipps)
- [ ] Egen app for kantinepersonalet som oppdaterer status
