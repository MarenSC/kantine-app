/**
 * Hjelpefunksjoner for datoer og klokkeslett.
 * Vi jobber med lokal tid (telefonens tidssone) for å unngå
 * at datoer "hopper" en dag pga. UTC.
 */

const MS_PER_DAG = 24 * 60 * 60 * 1000;

/** Dagens dato, klokken 00:00 lokal tid. */
export function iDag(): Date {
  const naa = new Date();
  return new Date(naa.getFullYear(), naa.getMonth(), naa.getDate());
}

/** Gjør om en Date til "YYYY-MM-DD". */
export function tilIsoDato(dato: Date): string {
  const aar = dato.getFullYear();
  const maaned = String(dato.getMonth() + 1).padStart(2, '0');
  const dag = String(dato.getDate()).padStart(2, '0');
  return `${aar}-${maaned}-${dag}`;
}

/** Gjør om "YYYY-MM-DD" til en Date (lokal tid, 00:00). */
export function fraIsoDato(isoDato: string): Date {
  const [aar, maaned, dag] = isoDato.split('-').map(Number);
  return new Date(aar, maaned - 1, dag);
}

/** Datoen om `dager` dager fra i dag, som "YYYY-MM-DD". */
export function datoOmDager(dager: number): string {
  const dato = iDag();
  dato.setDate(dato.getDate() + dager);
  return tilIsoDato(dato);
}

/**
 * Antall dager fra `fra` til `isoDato`.
 * 0 = i dag, 1 = i morgen, -1 = i går.
 * Math.round håndterer overgang til/fra sommertid.
 */
export function dagerTil(isoDato: string, fra: Date = iDag()): number {
  return Math.round((fraIsoDato(isoDato).getTime() - fra.getTime()) / MS_PER_DAG);
}

/** "HH:MM" -> minutter siden midnatt */
function tilMinutter(klokke: string): number {
  const [timer, minutter] = klokke.split(':').map(Number);
  return timer * 60 + minutter;
}

/** Sjekker om et tidspunkt er innenfor åpningstiden. */
export function erAapen(aapner: string, stenger: string, naa: Date = new Date()): boolean {
  const minutterNaa = naa.getHours() * 60 + naa.getMinutes();
  return minutterNaa >= tilMinutter(aapner) && minutterNaa < tilMinutter(stenger);
}

/** Formaterer et tidspunkt som "HH:MM". */
export function klokkeslett(dato: Date): string {
  const timer = String(dato.getHours()).padStart(2, '0');
  const minutter = String(dato.getMinutes()).padStart(2, '0');
  return `${timer}:${minutter}`;
}

/** Legger til minutter på et tidspunkt. */
export function leggTilMinutter(dato: Date, minutter: number): Date {
  return new Date(dato.getTime() + minutter * 60 * 1000);
}

const UKEDAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];

/** Ukedag som tall: 1 = mandag … 7 = søndag. */
export function ukedag(dato: Date): number {
  return dato.getDay() === 0 ? 7 : dato.getDay();
}

/** "mandag", "tirsdag", … */
export function ukedagsnavn(dato: Date): string {
  return UKEDAGER[dato.getDay()];
}

/**
 * De neste fem hverdagene (mandag–fredag), fra og med i dag.
 * Brukes i dagvelgeren for ukemenyen.
 */
export function nesteHverdager(antall = 5, fra: Date = iDag()): Date[] {
  const dager: Date[] = [];
  const dato = new Date(fra);
  while (dager.length < antall) {
    if (ukedag(dato) <= 5) dager.push(new Date(dato));
    dato.setDate(dato.getDate() + 1);
  }
  return dager;
}
