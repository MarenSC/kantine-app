import type { Kategori, Vare } from '../types';
import { datoOmDager } from '../utils/dato';

/**
 * EKSEMPELDATA – menyer og priser for prototypen.
 * `bestFoer` regnes ut fra dagens dato, slik at det alltid finnes
 * varer med datorabatt når du tester appen.
 */

export const kategorinavn: Record<Kategori, string> = {
  varmmat: 'Varmmat',
  smorbrod: 'Smørbrød og baguetter',
  salat: 'Salater',
  bakevarer: 'Bakevarer',
  snacks: 'Snacks',
  drikke: 'Drikke',
};

/** Rekkefølgen kategoriene vises i på menyen */
export const kategoriRekkefolge: Kategori[] = [
  'varmmat',
  'smorbrod',
  'salat',
  'bakevarer',
  'snacks',
  'drikke',
];

export const varer: Vare[] = [
  // ---------- Kantina P35 ----------
  {
    id: 'p35-dagens',
    kantineId: 'p35-kantine',
    navn: 'Dagens middag: kyllinggryte',
    beskrivelse: 'Kyllinggryte med ris og salat',
    kategori: 'varmmat',
    pris: 89,
    tilbud: { tekst: 'Studenttilbud', pris: 69 },
    allergener: ['melk'],
    antallIgjen: 25,
  },
  {
    id: 'p35-suppe',
    kantineId: 'p35-kantine',
    navn: 'Tomatsuppe',
    beskrivelse: 'Med brød og smør',
    kategori: 'varmmat',
    pris: 55,
    vegetar: true,
    allergener: ['gluten', 'melk'],
    antallIgjen: 15,
  },
  {
    id: 'p35-baguette-skinke',
    kantineId: 'p35-kantine',
    navn: 'Baguette med skinke og ost',
    beskrivelse: 'Grovbaguette med salat og dressing',
    kategori: 'smorbrod',
    pris: 65,
    bestFoer: datoOmDager(0),
    allergener: ['gluten', 'melk', 'egg'],
    antallIgjen: 4,
  },
  {
    id: 'p35-cesar',
    kantineId: 'p35-kantine',
    navn: 'Cæsarsalat',
    beskrivelse: 'Kylling, romanosalat, parmesan og krutonger',
    kategori: 'salat',
    pris: 85,
    bestFoer: datoOmDager(1),
    allergener: ['gluten', 'melk', 'egg', 'fisk'],
    antallIgjen: 6,
  },
  {
    id: 'p35-yoghurt',
    kantineId: 'p35-kantine',
    navn: 'Yoghurt med müsli',
    beskrivelse: 'Gresk yoghurt med bær og müsli',
    kategori: 'snacks',
    pris: 39,
    bestFoer: datoOmDager(3),
    vegetar: true,
    allergener: ['melk', 'havre'],
    antallIgjen: 10,
  },
  {
    id: 'p35-vann',
    kantineId: 'p35-kantine',
    navn: 'Farris 0,5 l',
    beskrivelse: 'Mineralvann',
    kategori: 'drikke',
    pris: 29,
    allergener: [],
    antallIgjen: 40,
  },

  // ---------- Kaffebaren P35 ----------
  {
    id: 'kb-kaffe',
    kantineId: 'p35-kaffebar',
    navn: 'Kaffe',
    beskrivelse: 'Filterkaffe, påfyll inkludert',
    kategori: 'drikke',
    pris: 25,
    allergener: [],
    antallIgjen: 200,
  },
  {
    id: 'kb-latte',
    kantineId: 'p35-kaffebar',
    navn: 'Caffè latte',
    beskrivelse: 'Velg mellom kumelk og havremelk',
    kategori: 'drikke',
    pris: 45,
    tilbud: { tekst: 'Studentpris', pris: 35 },
    allergener: ['melk'],
    antallIgjen: 200,
  },
  {
    id: 'kb-kanelbolle',
    kantineId: 'p35-kaffebar',
    navn: 'Kanelbolle',
    beskrivelse: 'Nybakt hver morgen',
    kategori: 'bakevarer',
    pris: 39,
    bestFoer: datoOmDager(0),
    vegetar: true,
    allergener: ['gluten', 'melk', 'egg'],
    antallIgjen: 8,
  },
  {
    id: 'kb-croissant',
    kantineId: 'p35-kaffebar',
    navn: 'Croissant med ost og skinke',
    beskrivelse: 'Varmes ved bestilling',
    kategori: 'bakevarer',
    pris: 49,
    allergener: ['gluten', 'melk'],
    antallIgjen: 12,
  },

  // ---------- Kafé P46 ----------
  {
    id: 'p46-wrap',
    kantineId: 'p46-kafe',
    navn: 'Falafelwrap',
    beskrivelse: 'Falafel, hummus, grønnsaker og tahinidressing',
    kategori: 'smorbrod',
    pris: 75,
    bestFoer: datoOmDager(1),
    vegetar: true,
    allergener: ['gluten', 'sesam'],
    antallIgjen: 7,
  },
  {
    id: 'p46-pasta',
    kantineId: 'p46-kafe',
    navn: 'Pastasalat med kylling',
    beskrivelse: 'Pesto, soltørkede tomater og ruccola',
    kategori: 'salat',
    pris: 79,
    tilbud: { tekst: 'Ukens tilbud', pris: 65 },
    allergener: ['gluten', 'melk', 'nøtter'],
    antallIgjen: 9,
  },
  {
    id: 'p46-smoothie',
    kantineId: 'p46-kafe',
    navn: 'Smoothie',
    beskrivelse: 'Mango og pasjonsfrukt',
    kategori: 'drikke',
    pris: 49,
    bestFoer: datoOmDager(0),
    vegetar: true,
    allergener: [],
    antallIgjen: 5,
  },
  {
    id: 'p46-sjokolade',
    kantineId: 'p46-kafe',
    navn: 'Sjokoladebar',
    beskrivelse: 'Melkesjokolade 60 g',
    kategori: 'snacks',
    pris: 25,
    allergener: ['melk', 'soya'],
    antallIgjen: 30,
  },

  // ---------- Kantina P52 ----------
  {
    id: 'p52-taco',
    kantineId: 'p52-kantine',
    navn: 'Tacotallerken',
    beskrivelse: 'Kjøttdeig eller bønner, tortilla og tilbehør',
    kategori: 'varmmat',
    pris: 95,
    tilbud: { tekst: 'Ukens middag', pris: 79 },
    allergener: ['gluten', 'melk'],
    antallIgjen: 20,
  },
  {
    id: 'p52-sushi',
    kantineId: 'p52-kantine',
    navn: 'Sushi, 8 biter',
    beskrivelse: 'Laks og avokado',
    kategori: 'varmmat',
    pris: 99,
    bestFoer: datoOmDager(0),
    allergener: ['fisk', 'soya', 'sesam'],
    antallIgjen: 3,
  },
  {
    id: 'p52-iste',
    kantineId: 'p52-kantine',
    navn: 'Iste fersken',
    beskrivelse: '0,5 l',
    kategori: 'drikke',
    pris: 32,
    allergener: [],
    antallIgjen: 25,
  },

  // ---------- Kantina Kjeller ----------
  {
    id: 'kj-lapskaus',
    kantineId: 'kjeller-kantine',
    navn: 'Lapskaus',
    beskrivelse: 'Med flatbrød',
    kategori: 'varmmat',
    pris: 79,
    allergener: ['gluten', 'selleri'],
    antallIgjen: 18,
  },
  {
    id: 'kj-rundstykke',
    kantineId: 'kjeller-kantine',
    navn: 'Rundstykke med egg og kaviar',
    beskrivelse: 'Grovt rundstykke',
    kategori: 'smorbrod',
    pris: 45,
    bestFoer: datoOmDager(1),
    allergener: ['gluten', 'egg', 'fisk', 'melk'],
    antallIgjen: 6,
  },
  {
    id: 'kj-eple',
    kantineId: 'kjeller-kantine',
    navn: 'Eple',
    beskrivelse: 'Norske epler',
    kategori: 'snacks',
    pris: 12,
    vegetar: true,
    allergener: [],
    antallIgjen: 50,
  },
  {
    id: 'kj-kaffe',
    kantineId: 'kjeller-kantine',
    navn: 'Kaffe',
    beskrivelse: 'Filterkaffe',
    kategori: 'drikke',
    pris: 22,
    allergener: [],
    antallIgjen: 200,
  },
];

export function hentVare(id: string): Vare | undefined {
  return varer.find((v) => v.id === id);
}

export function varerIKantine(kantineId: string): Vare[] {
  return varer.filter((v) => v.kantineId === kantineId);
}
