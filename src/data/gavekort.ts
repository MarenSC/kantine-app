/**
 * EKSEMPELDATA – gavekort for prototypen.
 * I en ekte app ville kodene blitt sjekket mot en server (f.eks. SiO sitt kassesystem).
 */

/** Gyldige demokoder og beløpet de er verdt. Hver kode kan bare brukes én gang. */
export const DEMO_GAVEKORT: Record<string, number> = {
  KANTINA100: 100,
  BURSDAG250: 250,
  JUL500: 500,
};

/** Koden som vises som tips på Min side */
export const DEMO_TIPS_KODE = 'BURSDAG250';

/** Demobrukeren starter med et gavekort på dette beløpet, så saldoen kan vises med en gang. */
export const STARTSALDO_DEMO = 200;

/** "bursdag-250 " -> "BURSDAG250" */
export function normaliserKode(kode: string): string {
  return kode.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
