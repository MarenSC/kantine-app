import { oversettelser } from './oversettelser';

/**
 * Enkel oversettelse: Den norske teksten er "nøkkelen", og
 * oversettelsene ligger i oversettelser.ts.
 *
 * Bruk:  t('Handlekurv')               -> "Cart" på engelsk
 *        t('{antall} igjen', { antall }) -> "3 left"
 *
 * Mangler en oversettelse, vises den norske teksten.
 */

export type Spraak = 'nb' | 'en' | 'es' | 'de' | 'fr';

export const spraakvalg: { kode: Spraak; navn: string; locale: string }[] = [
  { kode: 'nb', navn: 'Norsk', locale: 'nb-NO' },
  { kode: 'en', navn: 'English', locale: 'en-GB' },
  { kode: 'es', navn: 'Español', locale: 'es-ES' },
  { kode: 'de', navn: 'Deutsch', locale: 'de-DE' },
  { kode: 'fr', navn: 'Français', locale: 'fr-FR' },
];

let aktivtSpraak: Spraak = 'nb';
const varslet = new Set<string>();

/** Settes av InnstillingerContext når studenten velger språk. */
export function settAktivtSpraak(spraak: Spraak) {
  aktivtSpraak = spraak;
}

export function aktivtSpraakkode(): Spraak {
  return aktivtSpraak;
}

/** F.eks. "en-GB", brukes til å formatere datoer. */
export function locale(): string {
  return spraakvalg.find((s) => s.kode === aktivtSpraak)?.locale ?? 'nb-NO';
}

/** Oversetter en norsk tekst til valgt språk. */
export function t(tekst: string, verdier?: Record<string, string | number>): string {
  let resultat = tekst;
  if (aktivtSpraak !== 'nb') {
    const oversatt = oversettelser[tekst]?.[aktivtSpraak];
    if (oversatt) {
      resultat = oversatt;
    } else if (__DEV__ && !varslet.has(tekst)) {
      varslet.add(tekst);
      console.warn(`Mangler oversettelse (${aktivtSpraak}): "${tekst}"`);
    }
  }
  if (!verdier) return resultat;
  return resultat.replace(/\{(\w+)\}/g, (hele, navn: string) => (navn in verdier ? String(verdier[navn]) : hele));
}
