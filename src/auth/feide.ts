/**
 * Innstillinger for innlogging med Feide (OpenID Connect).
 *
 * Så lenge `clientId` er tom, bruker appen DEMO-innlogging med en testbruker.
 * For å slå på ekte Feide:
 *  1. Registrer appen i Feides kundeportal (https://kunde.feide.no) og legg til
 *     en OIDC-konfigurasjon med redirect-URL-en appen skriver ut i terminalen
 *     ("Feide redirect URI: ...").
 *  2. Slå på "Feide test users" i kundeportalen for å teste.
 *  3. Lim inn client ID-en under.
 *  4. Bygg en development build (npx expo run:ios), siden Expo Go ikke
 *     kan bruke appens egen URL-adresse (kantineapp://).
 *
 * Merk: Hvis Feide krever "client secret" for tjenesten, må bytte av kode mot
 * token skje på en server, ikke i appen. Hemmeligheter skal aldri ligge i appen.
 *
 * Dokumentasjon: https://docs.feide.no/reference/oauth_oidc/openid_connect_details.html
 */
export const FEIDE_CONFIG = {
  clientId: '',
  issuer: 'https://auth.dataporten.no',
  scopes: ['openid', 'profile', 'email'],
  /** Må være lik "scheme" i app.json */
  scheme: 'kantineapp',
} as const;

export const feideErKonfigurert = FEIDE_CONFIG.clientId.length > 0;
