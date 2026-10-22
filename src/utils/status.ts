import type { Bestilling } from '../types';

export interface Bestillingsstatus {
  tekst: string;
  ferdig: boolean;
}

/**
 * SIMULERT status for en bestilling, basert på hvor lang tid som har gått.
 * I en ekte app ville kantina oppdatert statusen via en server.
 */
export function hentStatus(bestilling: Bestilling, naa: Date = new Date()): Bestillingsstatus {
  const opprettet = new Date(bestilling.opprettet).getTime();
  const minutterSiden = (naa.getTime() - opprettet) / 60_000;

  if (bestilling.leveringsmaate.type === 'henting') {
    const hentetid = new Date(bestilling.leveringsmaate.hentetid).getTime();
    const minutterTilHenting = (hentetid - naa.getTime()) / 60_000;

    if (minutterSiden < 1) return { tekst: 'Mottatt', ferdig: false };
    if (minutterTilHenting > 0) return { tekst: 'Tilberedes', ferdig: false };
    return { tekst: 'Klar for henting', ferdig: true };
  }

  if (minutterSiden < 1) return { tekst: 'Mottatt', ferdig: false };
  if (minutterSiden < 8) return { tekst: 'Tilberedes', ferdig: false };
  if (minutterSiden < 12) return { tekst: 'På vei til deg', ferdig: false };
  return { tekst: 'Levert', ferdig: true };
}
