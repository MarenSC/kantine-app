/**
 * EKSEMPELDATA – hvor fullt det typisk er i kantina gjennom dagen (0–100).
 * I en ekte app kunne dette komme fra kassasystemet eller antall bestillinger.
 */

/** Typisk mønster for en hverdag, time for time fra 08 til 17. */
const grunnmonster: Record<number, number> = {
  8: 20,
  9: 30,
  10: 40,
  11: 75,
  12: 100,
  13: 80,
  14: 45,
  15: 30,
  16: 20,
  17: 10,
};

/** Noen kantiner er mer populære enn andre. */
const faktor: Record<string, number> = {
  'p35-kantine': 1,
  'p35-kaffebar': 0.7,
  'p46-kafe': 0.6,
  'p52-kantine': 0.85,
  'kjeller-kantine': 0.5,
};

export interface Timeverdi {
  time: number;
  /** 0–100 */
  nivaa: number;
}

/** Travelhet time for time for en kantine, innenfor åpningstiden. */
export function travelhetGjennomDagen(kantineId: string, aapner: string, stenger: string): Timeverdi[] {
  const fra = Number(aapner.split(':')[0]);
  const til = Number(stenger.split(':')[0]);
  const f = faktor[kantineId] ?? 0.7;
  return Object.entries(grunnmonster)
    .map(([time, nivaa]) => ({ time: Number(time), nivaa: Math.round(nivaa * f) }))
    .filter((t) => t.time >= fra && t.time <= til);
}

/** Kort beskrivelse av et travelhetsnivå (norsk – oversettes ved visning). */
export function travelhetTekst(nivaa: number): string {
  if (nivaa >= 70) return 'Travelt';
  if (nivaa >= 40) return 'Litt travelt';
  return 'Rolig';
}
