import { varer } from '../data/varer';
import { t } from '../i18n';
import type { Preferanser, Vare } from '../types';

/** Alle allergener som finnes i menyene, sortert alfabetisk. */
export const alleAllergener: string[] = [...new Set(varer.flatMap((v) => v.allergener))].sort((a, b) =>
  a.localeCompare(b, 'nb'),
);

/**
 * Finner ut om en vare passer for studenten.
 * Returnerer en advarselstekst, eller null hvis varen passer.
 */
export function kostholdsadvarsel(vare: Vare, preferanser: Preferanser): string | null {
  const treff = vare.allergener.filter((a) => preferanser.allergener.includes(a));
  const deler: string[] = [];

  if (treff.length > 0) deler.push(t('Inneholder {allergener}', { allergener: treff.map((a) => t(a)).join(', ') }));
  if (preferanser.vegetar && !vare.vegetar) deler.push(t('Ikke vegetar'));

  return deler.length > 0 ? deler.join(' · ') : null;
}

/** True hvis studenten har lagt inn noen kostholdsvalg. */
export function harKostholdsvalg(preferanser: Preferanser): boolean {
  return preferanser.vegetar || preferanser.allergener.length > 0;
}
