import type { Bestilling, Bestillingssteg } from '../types';

export interface Bestillingsstatus {
  steg: Bestillingssteg;
  tekst: string;
  ferdig: boolean;
}

/** Teksten studenten ser for hvert steg. */
export function statustekst(steg: Bestillingssteg, erHenting: boolean): string {
  switch (steg) {
    case 'mottatt':
      return 'Mottatt';
    case 'tilberedes':
      return 'Tilberedes';
    case 'klar':
      return erHenting ? 'Klar for henting' : 'På vei til deg';
    case 'utlevert':
      return erHenting ? 'Hentet' : 'Levert';
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

function simulertSteg(bestilling: Bestilling, naa: Date): Bestillingssteg {
  const minutterSiden = (naa.getTime() - new Date(bestilling.opprettet).getTime()) / 60_000;
  if (minutterSiden < 1) return 'mottatt';

  if (bestilling.leveringsmaate.type === 'henting') {
    const minutterTilHenting = (new Date(bestilling.leveringsmaate.hentetid).getTime() - naa.getTime()) / 60_000;
    if (minutterTilHenting > 0) return 'tilberedes';
    // Etter et par timer regner vi med at maten er hentet.
    return minutterTilHenting < -120 ? 'utlevert' : 'klar';
  }

  if (minutterSiden < 8) return 'tilberedes';
  if (minutterSiden < 12) return 'klar';
  return 'utlevert';
}
