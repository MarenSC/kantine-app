/**
 * Farger, avstander og runding samlet på ett sted.
 * Endre her, så endres utseendet i hele appen.
 */

export const farger = {
  primaer: '#0B5D5B',
  primaerLys: '#E3F1F0',
  tekst: '#1B1F23',
  tekstDempet: '#5B6670',
  bakgrunn: '#F6F7F8',
  kort: '#FFFFFF',
  kant: '#E2E5E8',
  tilbud: '#B4232C',
  tilbudLys: '#FDECEC',
  dato: '#8A5200',
  datoLys: '#FFF3DC',
  suksess: '#1E7B3A',
  suksessLys: '#E5F4E9',
  deaktivert: '#A9B1B8',
} as const;

export const avstand = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  s: 8,
  m: 12,
  l: 16,
  rund: 999,
} as const;

export const skrift = {
  tittel: { fontSize: 22, fontWeight: '700' as const, color: farger.tekst },
  overskrift: { fontSize: 17, fontWeight: '600' as const, color: farger.tekst },
  brodtekst: { fontSize: 15, color: farger.tekst },
  liten: { fontSize: 13, color: farger.tekstDempet },
};
