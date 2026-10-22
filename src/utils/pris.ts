import type { Vare } from '../types';
import { dagerTil, iDag } from './dato';

/**
 * Datorabatt i prosent, basert på hvor mange dager det er til siste salgsdag.
 * 0 = siste salgsdag er i dag, 1 = i morgen.
 * Vil du endre rabattene, gjør du det her.
 */
export const DATORABATT_PROSENT: Record<number, number> = {
  0: 50,
  1: 30,
};

export type Prisgrunn = 'tilbud' | 'dato' | null;

export interface Prisinfo {
  /** Prisen kunden betaler */
  pris: number;
  /** Ordinær pris (for å vise gjennomstreket pris) */
  ordinaerPris: number;
  /** Hvorfor prisen er redusert, eller null */
  grunn: Prisgrunn;
  /** Tekst til merkelappen, f.eks. "-50 % · går ut i dag" */
  etikett?: string;
}

/**
 * Finner den laveste prisen en vare har akkurat nå.
 * Hvis både tilbud og datorabatt gjelder, får kunden den beste av dem
 * (rabattene legges ikke oppå hverandre).
 */
export function beregnPris(vare: Vare, dag: Date = iDag()): Prisinfo {
  let beste: Prisinfo = { pris: vare.pris, ordinaerPris: vare.pris, grunn: null };

  if (vare.tilbud && vare.tilbud.pris < beste.pris) {
    beste = {
      pris: vare.tilbud.pris,
      ordinaerPris: vare.pris,
      grunn: 'tilbud',
      etikett: vare.tilbud.tekst,
    };
  }

  if (vare.bestFoer) {
    const dager = dagerTil(vare.bestFoer, dag);
    const prosent = DATORABATT_PROSENT[dager];
    if (prosent) {
      const rabattertPris = Math.round(vare.pris * (1 - prosent / 100));
      if (rabattertPris < beste.pris) {
        beste = {
          pris: rabattertPris,
          ordinaerPris: vare.pris,
          grunn: 'dato',
          etikett: `-${prosent} % · ${dager === 0 ? 'går ut i dag' : 'går ut i morgen'}`,
        };
      }
    }
  }

  return beste;
}

/** True hvis siste salgsdag har passert, varen skal da ikke selges. */
export function erUtgaatt(vare: Vare, dag: Date = iDag()): boolean {
  return vare.bestFoer ? dagerTil(vare.bestFoer, dag) < 0 : false;
}

/** Formaterer et beløp, f.eks. 49 -> "49 kr". */
export function formaterPris(kroner: number): string {
  return `${kroner} kr`;
}
