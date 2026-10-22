import type { Bygg, Campus, Kantine } from '../types';

/**
 * EKSEMPELDATA – kantinenavn, plassering og åpningstider er laget for
 * prototypen og må byttes ut med riktig informasjon.
 * På sikt bør dette hentes fra en server/database i stedet.
 */

export const campuser: Campus[] = [
  { id: 'pilestredet', navn: 'Campus Pilestredet' },
  { id: 'kjeller', navn: 'Campus Kjeller' },
];

export const bygg: Bygg[] = [
  { id: 'p35', navn: 'Pilestredet 35', kortnavn: 'P35', campusId: 'pilestredet' },
  { id: 'p46', navn: 'Pilestredet 46', kortnavn: 'P46', campusId: 'pilestredet' },
  { id: 'p52', navn: 'Pilestredet 52', kortnavn: 'P52', campusId: 'pilestredet' },
  { id: 'kjeller', navn: 'Kjeller', kortnavn: 'KJ', campusId: 'kjeller' },
];

export const kantiner: Kantine[] = [
  {
    id: 'p35-kantine',
    navn: 'Kantina P35',
    byggId: 'p35',
    plassering: '1. etasje',
    aapner: '08:00',
    stenger: '16:00',
    leveringTilBord: true,
  },
  {
    id: 'p35-kaffebar',
    navn: 'Kaffebaren P35',
    byggId: 'p35',
    plassering: 'Ved biblioteket, 2. etasje',
    aapner: '08:00',
    stenger: '18:00',
    leveringTilBord: false,
  },
  {
    id: 'p46-kafe',
    navn: 'Kafé P46',
    byggId: 'p46',
    plassering: 'Inngangsplan',
    aapner: '08:30',
    stenger: '15:30',
    leveringTilBord: true,
  },
  {
    id: 'p52-kantine',
    navn: 'Kantina P52',
    byggId: 'p52',
    plassering: 'Underetasjen',
    aapner: '10:00',
    stenger: '14:30',
    leveringTilBord: true,
  },
  {
    id: 'kjeller-kantine',
    navn: 'Kantina Kjeller',
    byggId: 'kjeller',
    plassering: 'Hovedbygget, 1. etasje',
    aapner: '08:00',
    stenger: '15:00',
    leveringTilBord: false,
  },
];

export function hentKantine(id: string): Kantine | undefined {
  return kantiner.find((k) => k.id === id);
}

export function hentBygg(id: string): Bygg | undefined {
  return bygg.find((b) => b.id === id);
}

export function byggPaaCampus(campusId: string): Bygg[] {
  return bygg.filter((b) => b.campusId === campusId);
}

export function kantinerIBygg(byggId: string): Kantine[] {
  return kantiner.filter((k) => k.byggId === byggId);
}
