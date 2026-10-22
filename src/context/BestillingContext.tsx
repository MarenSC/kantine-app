import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { hentVare } from '../data/varer';
import type { Bestilling, Handlekurvlinje, Leveringsmaate, Vare } from '../types';
import { beregnPris, type Prisinfo } from '../utils/pris';

/**
 * Holder styr på handlekurven og bestillingene i hele appen.
 *
 * Handlekurven kan bare inneholde varer fra ÉN kantine om gangen,
 * siden studenten henter/får levert fra ett sted.
 *
 * Merk: Data lagres foreløpig bare i minnet, og forsvinner når appen lukkes.
 */

// ---------- State og actions ----------

interface State {
  kurvKantineId: string | null;
  kurv: Handlekurvlinje[];
  bestillinger: Bestilling[];
}

type Action =
  | { type: 'LEGG_TIL'; vare: Vare }
  | { type: 'SETT_ANTALL'; vareId: string; antall: number }
  | { type: 'TOM_KURV' }
  | { type: 'LEGG_INN_BESTILLING'; bestilling: Bestilling };

const startState: State = {
  kurvKantineId: null,
  kurv: [],
  bestillinger: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LEGG_TIL': {
      const { vare } = action;
      // Ny kantine? Da starter vi en ny kurv.
      const kurv = state.kurvKantineId === vare.kantineId ? state.kurv : [];
      const eksisterende = kurv.find((l) => l.vareId === vare.id);
      const naavaerendeAntall = eksisterende?.antall ?? 0;

      if (naavaerendeAntall >= vare.antallIgjen) return state; // ikke flere på lager

      const nyKurv = eksisterende
        ? kurv.map((l) => (l.vareId === vare.id ? { ...l, antall: l.antall + 1 } : l))
        : [...kurv, { vareId: vare.id, antall: 1 }];

      return { ...state, kurvKantineId: vare.kantineId, kurv: nyKurv };
    }

    case 'SETT_ANTALL': {
      const vare = hentVare(action.vareId);
      const maks = vare?.antallIgjen ?? 0;
      const antall = Math.max(0, Math.min(action.antall, maks));
      const kurv =
        antall === 0
          ? state.kurv.filter((l) => l.vareId !== action.vareId)
          : state.kurv.map((l) => (l.vareId === action.vareId ? { ...l, antall } : l));

      return { ...state, kurv, kurvKantineId: kurv.length > 0 ? state.kurvKantineId : null };
    }

    case 'TOM_KURV':
      return { ...state, kurv: [], kurvKantineId: null };

    case 'LEGG_INN_BESTILLING':
      return {
        ...state,
        kurv: [],
        kurvKantineId: null,
        bestillinger: [action.bestilling, ...state.bestillinger],
      };

    default:
      return state;
  }
}

// ---------- Hjelpefunksjoner ----------

function lagId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function lagHentekode(): string {
  return String(Math.floor(100 + Math.random() * 900)); // tresifret kode, 100–999
}

// ---------- Context ----------

export interface KurvVare {
  vare: Vare;
  antall: number;
  prisinfo: Prisinfo;
  linjesum: number;
}

interface BestillingContextVerdi {
  kurvKantineId: string | null;
  kurvVarer: KurvVare[];
  antallIKurv: number;
  totalpris: number;
  /** Hvor mye studenten sparer på tilbud og datorabatt */
  spart: number;
  bestillinger: Bestilling[];
  antallAvVare: (vareId: string) => number;
  leggTil: (vare: Vare) => void;
  settAntall: (vareId: string, antall: number) => void;
  tomKurv: () => void;
  /** Sender bestillingen og returnerer id-en til den nye bestillingen */
  sendBestilling: (leveringsmaate: Leveringsmaate, kommentar?: string) => string | null;
  hentBestilling: (id: string) => Bestilling | undefined;
}

const BestillingContext = createContext<BestillingContextVerdi | null>(null);

export function BestillingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, startState);

  const kurvVarer = useMemo<KurvVare[]>(
    () =>
      state.kurv.flatMap((linje) => {
        const vare = hentVare(linje.vareId);
        if (!vare) return [];
        const prisinfo = beregnPris(vare);
        return [{ vare, antall: linje.antall, prisinfo, linjesum: prisinfo.pris * linje.antall }];
      }),
    [state.kurv],
  );

  const antallIKurv = kurvVarer.reduce((sum, k) => sum + k.antall, 0);
  const totalpris = kurvVarer.reduce((sum, k) => sum + k.linjesum, 0);
  const spart = kurvVarer.reduce(
    (sum, k) => sum + (k.prisinfo.ordinaerPris - k.prisinfo.pris) * k.antall,
    0,
  );

  const antallAvVare = useCallback(
    (vareId: string) => state.kurv.find((l) => l.vareId === vareId)?.antall ?? 0,
    [state.kurv],
  );

  const leggTil = useCallback((vare: Vare) => dispatch({ type: 'LEGG_TIL', vare }), []);

  const settAntall = useCallback(
    (vareId: string, antall: number) => dispatch({ type: 'SETT_ANTALL', vareId, antall }),
    [],
  );

  const tomKurv = useCallback(() => dispatch({ type: 'TOM_KURV' }), []);

  const sendBestilling = useCallback(
    (leveringsmaate: Leveringsmaate, kommentar?: string) => {
      if (!state.kurvKantineId || kurvVarer.length === 0) return null;

      const bestilling: Bestilling = {
        id: lagId(),
        kantineId: state.kurvKantineId,
        linjer: kurvVarer.map((k) => ({
          vareId: k.vare.id,
          navn: k.vare.navn,
          antall: k.antall,
          stykkpris: k.prisinfo.pris,
        })),
        totalpris,
        leveringsmaate,
        kommentar: kommentar?.trim() || undefined,
        opprettet: new Date().toISOString(),
        hentekode: lagHentekode(),
      };

      dispatch({ type: 'LEGG_INN_BESTILLING', bestilling });
      return bestilling.id;
    },
    [state.kurvKantineId, kurvVarer, totalpris],
  );

  const hentBestilling = useCallback(
    (id: string) => state.bestillinger.find((b) => b.id === id),
    [state.bestillinger],
  );

  const verdi: BestillingContextVerdi = {
    kurvKantineId: state.kurvKantineId,
    kurvVarer,
    antallIKurv,
    totalpris,
    spart,
    bestillinger: state.bestillinger,
    antallAvVare,
    leggTil,
    settAntall,
    tomKurv,
    sendBestilling,
    hentBestilling,
  };

  return <BestillingContext.Provider value={verdi}>{children}</BestillingContext.Provider>;
}

/** Bruk denne i komponenter for å få tilgang til handlekurv og bestillinger. */
export function useBestilling(): BestillingContextVerdi {
  const context = useContext(BestillingContext);
  if (!context) {
    throw new Error('useBestilling må brukes inni <BestillingProvider>');
  }
  return context;
}
