import { t } from '../i18n';
import type { Bestilling, Bestillingssteg } from '../types';

export interface Bestillingsstatus {
  steg: Bestillingssteg;
  tekst: string;
  ferdig: boolean;
}

/** Teksten studenten ser for hvert steg (på valgt språk). */
export function statustekst(steg: Bestillingssteg, erHenting: boolean): string {
  switch (steg) {
    case 'mottatt':
      return t('Mottatt');
    case 'tilberedes':
      return t('Tilberedes');
    case 'klar':
      return erHenting ? t('Klar for henting') : t('På vei til deg');
    case 'utlevert':
      return erHenting ? t('Hentet') : t('Levert');
  }
}

/**
 * Status for en bestilling.
 * Er status satt på bestillingen, brukes den.
 * Ellers SIMULERES status ut fra hvor lang tid som har gått.
 */
export function hentStatus(bestilling: Bestilling, naa: Date = new Date()): Bestillingsstatus {
  const erHenting = bestilling.leveringsmaate.type === 'henting';
  const steg = bestilling.status ?? simulertSteg(bestilling, naa);
  return {
    steg,
    tekst: statustekst(steg, erHenting),
    ferdig: steg === 'klar' || steg === 'utlevert',
  };
}

/**
 * Bestillinger studenten glemmer å bekrefte, arkiveres av seg selv
 * så mange timer etter at maten ble klar.
 */
export const AUTO_ARKIVER_TIMER = 3;

function simulertSteg(bestilling: Bestilling, naa: Date): Bestillingssteg {
  const minutterSiden = (naa.getTime() - new Date(bestilling.opprettet).getTime()) / 60_000;
  if (minutterSiden < 1) return 'mottatt';

  if (bestilling.leveringsmaate.type === 'henting') {
    const minutterTilHenting = (new Date(bestilling.leveringsmaate.hentetid).getTime() - naa.getTime()) / 60_000;
    if (minutterTilHenting > 0) return 'tilberedes';
    // Klar til studenten sveiper i kassa – eller arkiveres etter noen timer.
    return minutterTilHenting < -AUTO_ARKIVER_TIMER * 60 ? 'utlevert' : 'klar';
  }

  if (minutterSiden < 8) return 'tilberedes';
  // "På vei til deg" til studenten sveiper – eller arkiveres etter noen timer.
  return minutterSiden < 8 + AUTO_ARKIVER_TIMER * 60 ? 'klar' : 'utlevert';
}
