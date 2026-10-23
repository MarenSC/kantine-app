import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';

import { hentVare } from '../data/varer';
import type {
  Bestilling,
  Handlekurvlinje,
  Leveringsmaate,
  Tilbakemelding,
  Vare,
} from '../types';
import { beregnPris, erUtgaatt, type Prisinfo } from '../utils/pris';

/**
 * Holder styr på handlekurven og bestillingene i hele appen.
 *
 * - Handlekurven kan bare inneholde varer fra ÉN kantine om gangen.
 * - Bestillingene lagres på enheten (AsyncStorage), så de huskes neste gang.
 */

const LAGRINGSNOKKEL = 'kantina:bestillinger:v1';

/** Antall stempler som trengs for en gratis kaffe */
export const STEMPLER_FOR_GRATIS = 10;

// ---------- State og actions ----------

interface State {
  kurvKantineId: string | null;
  kurv: Handlekurvlinje[];
  bestillinger: Bestilling[];
}

type Action =
  | { type: 'LEGG_TIL'; vare: Vare; variant?: string }
  | { type: 'SETT_ANTALL'; vareId: string; variant?: string; antall: number }
  | { type: 'TOM_KURV' }
  | { type: 'ERSTATT_KURV'; kantineId: string; linjer: Handlekurvlinje[] }
  | { type: 'LEGG_INN_BESTILLING'; bestilling: Bestilling }
  | { type: 'LAST_INN'; bestillinger: Bestilling[] }
  | { type: 'OPPDATER_BESTILLING'; id: string; endring: Partial<Bestilling> };

const startState: State = {
  kurvKantineId: null,
  kurv: [],
  bestillinger: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LEGG_TIL': {
      const { vare, variant } = action;
      // Ny kantine? Da starter vi en ny kurv.
      const kurv = state.kurvKantineId === vare.kantineId ? state.kurv : [];
      const erSamme = (l: Handlekurvlinje) => l.vareId === vare.id && l.variant === variant;
      const eksisterende = kurv.find(erSamme);
      // Lageret gjelder varen totalt, uansett variant
      const totaltIKurv = kurv.filter((l) => l.vareId === vare.id).reduce((sum, l) => sum + l.antall, 0);

      if (totaltIKurv >= vare.antallIgjen) return state; // ikke flere på lager

      const nyKurv = eksisterende
        ? kurv.map((l) => (erSamme(l) ? { ...l, antall: l.antall + 1 } : l))
        : [...kurv, { vareId: vare.id, variant, antall: Math.min(vare.startAntall ?? 1, vare.antallIgjen - totaltIKurv) }];

      return { ...state, kurvKantineId: vare.kantineId, kurv: nyKurv };
    }

    case 'SETT_ANTALL': {
      const vare = hentVare(action.vareId);
      const maks = vare?.antallIgjen ?? 0;
      const erSamme = (l: Handlekurvlinje) => l.vareId === action.vareId && l.variant === action.variant;
      // Plass igjen på lager når de andre variantene av samme vare er regnet med
      const andre = state.kurv
        .filter((l) => l.vareId === action.vareId && !erSamme(l))
        .reduce((sum, l) => sum + l.antall, 0);
      const antall = Math.max(0, Math.min(action.antall, maks - andre));
      const kurv =
        antall === 0
          ? state.kurv.filter((l) => !erSamme(l))
          : state.kurv.map((l) => (erSamme(l) ? { ...l, antall } : l));

      return { ...state, kurv, kurvKantineId: kurv.length > 0 ? state.kurvKantineId : null };
    }

    case 'TOM_KURV':
      return { ...state, kurv: [], kurvKantineId: null };

    case 'ERSTATT_KURV':
      return { ...state, kurvKantineId: action.kantineId, kurv: action.linjer };

    case 'LEGG_INN_BESTILLING':
      return {
        ...state,
        kurv: [],
        kurvKantineId: null,
        bestillinger: [action.bestilling, ...state.bestillinger],
      };

    case 'LAST_INN':
      return { ...state, bestillinger: action.bestillinger };

    case 'OPPDATER_BESTILLING':
      return {
        ...state,
        bestillinger: state.bestillinger.map((b) => (b.id === action.id ? { ...b, ...action.endring } : b)),
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

/** Gjør eldre lagrede bestillinger kompatible med dagens datamodell. */
function oppgrader(b: Bestilling): Bestilling {
  return {
    ...b,
    linjer: b.linjer.map((l) => ({
      ...l,
      ordinaerPris: l.ordinaerPris ?? l.stykkpris,
      reddet: l.reddet ?? false,
      stempel: l.stempel ?? false,
    })),
  };
}

// ---------- Context ----------

export interface KurvVare {
  vare: Vare;
  variant?: string;
  antall: number;
  prisinfo: Prisinfo;
  linjesum: number;
}

export interface Statistikk {
  /** Antall varer med datorabatt studenten har kjøpt */
  reddedeVarer: number;
  /** Kroner spart på tilbud og datorabatt totalt */
  spartTotalt: number;
  /** Stempler samlet totalt (kaffe) */
  stempler: number;
}

interface BestillingContextVerdi {
  kurvKantineId: string | null;
  kurvVarer: KurvVare[];
  antallIKurv: number;
  totalpris: number;
  /** Hvor mye studenten sparer på tilbud og datorabatt i kurven */
  spart: number;
  bestillinger: Bestilling[];
  statistikk: Statistikk;
  antallAvVare: (vareId: string) => number;
  leggTil: (vare: Vare, variant?: string) => void;
  settAntall: (vareId: string, antall: number, variant?: string) => void;
  tomKurv: () => void;
  /** Sender bestillingen og returnerer id-en til den nye bestillingen */
  sendBestilling: (leveringsmaate: Leveringsmaate, kommentar?: string) => string | null;
  hentBestilling: (id: string) => Bestilling | undefined;
  /** Legger varene fra en tidligere bestilling i kurven. Returnerer hvor mange varer som fortsatt fantes. */
  bestillIgjen: (bestilling: Bestilling) => number;
  giTilbakemelding: (id: string, tilbakemelding: Tilbakemelding) => void;
}

const BestillingContext = createContext<BestillingContextVerdi | null>(null);

export function BestillingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, startState);
  const [lastet, setLastet] = useState(false);

  // Les inn lagrede bestillinger ved oppstart.
  useEffect(() => {
    AsyncStorage.getItem(LAGRINGSNOKKEL)
      .then((tekst) => {
        if (!tekst) return;
        const lagret = JSON.parse(tekst) as Bestilling[];
        if (Array.isArray(lagret)) dispatch({ type: 'LAST_INN', bestillinger: lagret.map(oppgrader) });
      })
      .catch((feil) => console.warn('Kunne ikke lese bestillinger', feil))
      .finally(() => setLastet(true));
  }, []);

  // Lagre hver gang bestillingene endres (men ikke før vi har lest inn de gamle).
  useEffect(() => {
    if (!lastet) return;
    AsyncStorage.setItem(LAGRINGSNOKKEL, JSON.stringify(state.bestillinger)).catch((feil) =>
      console.warn('Kunne ikke lagre bestillinger', feil),
    );
  }, [state.bestillinger, lastet]);

  const kurvVarer = useMemo<KurvVare[]>(
    () =>
      state.kurv.flatMap((linje) => {
        const vare = hentVare(linje.vareId);
        if (!vare) return [];
        const prisinfo = beregnPris(vare);
        return [{ vare, variant: linje.variant, antall: linje.antall, prisinfo, linjesum: prisinfo.pris * linje.antall }];
      }),
    [state.kurv],
  );

  const antallIKurv = kurvVarer.reduce((sum, k) => sum + k.antall, 0);
  const totalpris = kurvVarer.reduce((sum, k) => sum + k.linjesum, 0);
  const spart = kurvVarer.reduce(
    (sum, k) => sum + (k.prisinfo.ordinaerPris - k.prisinfo.pris) * k.antall,
    0,
  );

  const statistikk = useMemo<Statistikk>(() => {
    const linjer = state.bestillinger.flatMap((b) => b.linjer);
    return {
      reddedeVarer: linjer.filter((l) => l.reddet).reduce((sum, l) => sum + l.antall, 0),
      spartTotalt: linjer.reduce((sum, l) => sum + (l.ordinaerPris - l.stykkpris) * l.antall, 0),
      stempler: linjer.filter((l) => l.stempel).reduce((sum, l) => sum + l.antall, 0),
    };
  }, [state.bestillinger]);

  /** Totalt antall av en vare i kurven, alle varianter regnet med */
  const antallAvVare = useCallback(
    (vareId: string) => state.kurv.filter((l) => l.vareId === vareId).reduce((sum, l) => sum + l.antall, 0),
    [state.kurv],
  );

  const leggTil = useCallback(
    (vare: Vare, variant?: string) => dispatch({ type: 'LEGG_TIL', vare, variant }),
    [],
  );

  const settAntall = useCallback(
    (vareId: string, antall: number, variant?: string) => dispatch({ type: 'SETT_ANTALL', vareId, variant, antall }),
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
          navn: k.variant ? `${k.vare.navn} – ${k.variant}` : k.vare.navn,
          variant: k.variant,
          antall: k.antall,
          stykkpris: k.prisinfo.pris,
          ordinaerPris: k.prisinfo.ordinaerPris,
          reddet: k.prisinfo.grunn === 'dato',
          stempel: k.vare.stempelkort === true,
          enhet: k.vare.enhet,
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

  const bestillIgjen = useCallback((bestilling: Bestilling) => {
    const linjer: Handlekurvlinje[] = bestilling.linjer.flatMap((l) => {
      const vare = hentVare(l.vareId);
      if (!vare || erUtgaatt(vare) || vare.antallIgjen === 0) return [];
      return [{ vareId: vare.id, variant: l.variant, antall: Math.min(l.antall, vare.antallIgjen) }];
    });
    if (linjer.length > 0) dispatch({ type: 'ERSTATT_KURV', kantineId: bestilling.kantineId, linjer });
    return linjer.length;
  }, []);

  const giTilbakemelding = useCallback(
    (id: string, tilbakemelding: Tilbakemelding) =>
      dispatch({ type: 'OPPDATER_BESTILLING', id, endring: { tilbakemelding } }),
    [],
  );

  const verdi: BestillingContextVerdi = {
    kurvKantineId: state.kurvKantineId,
    kurvVarer,
    antallIKurv,
    totalpris,
    spart,
    bestillinger: state.bestillinger,
    statistikk,
    antallAvVare,
    leggTil,
    settAntall,
    tomKurv,
    sendBestilling,
    hentBestilling,
    bestillIgjen,
    giTilbakemelding,
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
