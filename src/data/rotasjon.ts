import type { Vare } from '../types';
import { iDag, tilIsoDato } from '../utils/dato';

/**
 * Ruller tilbudene, så menyen ikke er lik hver dag:
 *  - «Redd maten»: hver dag får noen ferskvarer siste salgsdag i dag eller i morgen.
 *  - Ukens tilbud: hver kantine har ett tilbud som byttes hver mandag.
 *  - Varmdisken: fire av hovedrettene er med hver dag (tilbehøret er alltid der).
 *
 * Valget er "tilfeldig", men styrt av datoen: alle ser de samme tilbudene
 * samme dag, og de endrer seg ikke om du starter appen på nytt.
 * Studentpris på dagens rett og caffè latte er faste og røres ikke.
 */

/** Hvor mange «Redd maten»-varer hver kantine har. Kantiner som ikke står her, får 1–2. */
const ANTALL_REDD: Record<string, number> = {
  'p35-kantine': 3,
};

/** Rabatt på ukens tilbud */
const UKENS_RABATT = 0.2;

/** Hvor mange hovedretter varmdisken har om gangen */
const HOVEDRETTER_I_VARMDISKEN = 4;

export function rullerTilbud(grunnmeny: Vare[], dag: Date = iDag()): Vare[] {
  const dagens = lagTilfeldig(`dag-${tilIsoDato(dag)}`);
  const ukens = lagTilfeldig(`uke-${ukenavn(dag)}`);
  const endringer = new Map<string, Partial<Vare>>();

  const kantineIder = [...new Set(grunnmeny.map((v) => v.kantineId))];
  for (const kantineId of kantineIder) {
    // Varer som kan få tilbud: ikke dagens rett, varmdisk, kaffe på stempelkort eller varer med fast studentpris
    const kandidater = grunnmeny.filter(
      (v) => v.kantineId === kantineId && !v.dager && v.enhet !== 'hg' && !v.stempelkort && !v.tilbud,
    );

    // Ukens tilbud (samme hele uka)
    const ukensVare = stokk(
      kandidater.filter((v) => v.pris >= 25),
      ukens,
    )[0];
    if (ukensVare) {
      endringer.set(ukensVare.id, {
        tilbud: { tekst: 'Ukens tilbud', pris: Math.round(ukensVare.pris * (1 - UKENS_RABATT)) },
      });
    }

    // Redd maten (nytt hver dag). Den første går alltid ut i dag.
    const antall = ANTALL_REDD[kantineId] ?? 1 + Math.floor(dagens() * 2);
    const ferske = stokk(
      kandidater.filter((v) => v.ferskvare && v.id !== ukensVare?.id),
      dagens,
    ).slice(0, antall);
    ferske.forEach((vare, i) => {
      const dagerIgjen = i === 0 ? 0 : dagens() < 0.5 ? 0 : 1;
      endringer.set(vare.id, {
        bestFoer: tilIsoDato(leggTilDager(dag, dagerIgjen)),
        // Det er sjelden mange igjen av mat som snart går ut
        antallIgjen: Math.min(vare.antallIgjen, 2 + Math.floor(dagens() * 5)),
      });
    });
  }

  // Varmdisken: dagens utvalg av hovedretter, med minst én vegetarrett
  for (const vare of grunnmeny) {
    if (!vare.komponentvalg) continue;
    const hovedretter = vare.komponentvalg.filter((k) => !k.tilbehor);
    const tilbehor = vare.komponentvalg.filter((k) => k.tilbehor);
    const utvalg = stokk(hovedretter, dagens).slice(0, HOVEDRETTER_I_VARMDISKEN);
    if (!utvalg.some((k) => k.vegetar)) {
      const vegetar = hovedretter.find((k) => k.vegetar);
      if (vegetar) utvalg[utvalg.length - 1] = vegetar;
    }
    // Behold rekkefølgen fra menyen, så listen ser ryddig ut
    const valgt = hovedretter.filter((k) => utvalg.includes(k));
    endringer.set(vare.id, { komponentvalg: [...valgt, ...tilbehor] });
  }

  return grunnmeny.map((v) => {
    const endring = endringer.get(v.id);
    return endring ? { ...v, ...endring } : v;
  });
}

// ---------- Hjelpefunksjoner ----------

function leggTilDager(dato: Date, dager: number): Date {
  return new Date(dato.getFullYear(), dato.getMonth(), dato.getDate() + dager);
}

/** "2026-U43" – årstall og ukenummer (ISO-uke, starter mandag) */
function ukenavn(dato: Date): string {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
  const ukedag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - ukedag); // torsdagen i samme uke bestemmer året
  const aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const uke = Math.ceil(((d.getTime() - aarStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-U${uke}`;
}

/** Gjør en tekst om til et tall (samme tekst gir alltid samme tall). */
function tallFraTekst(tekst: string): number {
  let h = 2166136261;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Tilfeldige tall mellom 0 og 1 som alltid blir like for samme "frø" (mulberry32). */
function lagTilfeldig(fro: string): () => number {
  let a = tallFraTekst(fro);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stokker en liste (uten å endre originalen). */
function stokk<T>(liste: T[], tilfeldig: () => number): T[] {
  const kopi = [...liste];
  for (let i = kopi.length - 1; i > 0; i--) {
    const j = Math.floor(tilfeldig() * (i + 1));
    [kopi[i], kopi[j]] = [kopi[j], kopi[i]];
  }
  return kopi;
}
