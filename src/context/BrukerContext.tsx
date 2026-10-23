import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEMO_GAVEKORT, normaliserKode, STARTSALDO_DEMO } from '../data/gavekort';
import type { Gavekort, Preferanser, Student } from '../types';

/**
 * Holder styr på innlogget student og preferansene (allergier, kosthold,
 * favorittkantine). Alt lagres på telefonen med AsyncStorage, slik at det
 * huskes når appen lukkes og åpnes igjen.
 */

const LAGRINGSNOKKEL = 'kantina:bruker:v1';

const tomtGavekort: Gavekort = { saldo: 0, innloste: [] };

/** Svar når studenten legger inn en gavekortkode. `feil` er norsk tekst (oversettes ved visning). */
export type GavekortSvar = { ok: true; belop: number } | { ok: false; feil: string };

const standardPreferanser: Preferanser = {
  allergener: [],
  vegetar: false,
  favorittKantineId: null,
  varselReddMaten: true,
};

/** Testbruker som brukes til ekte Feide-innlogging er satt opp. */
export const DEMO_STUDENT: Student = {
  id: 'demo-student',
  navn: 'Test Student',
  epost: 'test.student@example.com',
  institusjon: 'OsloMet – storbyuniversitetet',
  innloggetMed: 'demo',
};

interface Lagret {
  student: Student | null;
  preferanser: Preferanser;
  gavekort: Gavekort;
}

interface BrukerContextVerdi {
  student: Student | null;
  preferanser: Preferanser;
  gavekort: Gavekort;
  /** false til lagrede data er lest inn ved oppstart */
  lastet: boolean;
  loggInn: (student: Student) => void;
  loggUt: () => void;
  settVegetar: (vegetar: boolean) => void;
  vekslAllergen: (allergen: string) => void;
  settFavoritt: (kantineId: string | null) => void;
  settVarselReddMaten: (paa: boolean) => void;
  /** Legger en gavekortkode til saldoen */
  loesInnGavekort: (kode: string) => GavekortSvar;
  /** Trekker et beløp fra gavekortet. Returnerer false hvis saldoen ikke holder. */
  betalMedGavekort: (belop: number) => boolean;
}

const BrukerContext = createContext<BrukerContextVerdi | null>(null);

export function BrukerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Lagret>({ student: null, preferanser: standardPreferanser, gavekort: tomtGavekort });
  const [lastet, setLastet] = useState(false);

  // Les inn lagrede data én gang ved oppstart.
  useEffect(() => {
    AsyncStorage.getItem(LAGRINGSNOKKEL)
      .then((tekst) => {
        if (!tekst) return;
        const lagret = JSON.parse(tekst) as Partial<Lagret>;
        setData({
          student: lagret.student ?? null,
          preferanser: { ...standardPreferanser, ...lagret.preferanser },
          gavekort: lagret.gavekort ?? (lagret.student ? { saldo: STARTSALDO_DEMO, innloste: [] } : tomtGavekort),
        });
      })
      .catch((feil) => console.warn('Kunne ikke lese brukerdata', feil))
      .finally(() => setLastet(true));
  }, []);

  // Lagre hver gang data endres (men ikke før vi har lest inn det gamle).
  useEffect(() => {
    if (!lastet) return;
    AsyncStorage.setItem(LAGRINGSNOKKEL, JSON.stringify(data)).catch((feil) =>
      console.warn('Kunne ikke lagre brukerdata', feil),
    );
  }, [data, lastet]);

  const loggInn = useCallback((student: Student) => {
    // Demo: en ny innlogging starter med et gavekort, så saldoen kan vises med en gang
    setData((d) => ({ ...d, student, gavekort: d.student ? d.gavekort : { saldo: STARTSALDO_DEMO, innloste: [] } }));
  }, []);

  const loggUt = useCallback(() => {
    // Preferansene slettes også, siden de hører til studenten.
    setData({ student: null, preferanser: standardPreferanser, gavekort: tomtGavekort });
  }, []);

  const settVegetar = useCallback((vegetar: boolean) => {
    setData((d) => ({ ...d, preferanser: { ...d.preferanser, vegetar } }));
  }, []);

  const vekslAllergen = useCallback((allergen: string) => {
    setData((d) => {
      const har = d.preferanser.allergener.includes(allergen);
      const allergener = har
        ? d.preferanser.allergener.filter((a) => a !== allergen)
        : [...d.preferanser.allergener, allergen];
      return { ...d, preferanser: { ...d.preferanser, allergener } };
    });
  }, []);

  const settFavoritt = useCallback((favorittKantineId: string | null) => {
    setData((d) => ({ ...d, preferanser: { ...d.preferanser, favorittKantineId } }));
  }, []);

  const settVarselReddMaten = useCallback((varselReddMaten: boolean) => {
    setData((d) => ({ ...d, preferanser: { ...d.preferanser, varselReddMaten } }));
  }, []);

  const loesInnGavekort = useCallback(
    (kode: string): GavekortSvar => {
      const ren = normaliserKode(kode);
      const belop = DEMO_GAVEKORT[ren];
      if (!belop) return { ok: false, feil: 'Fant ingen gavekort med denne koden.' };
      if (data.gavekort.innloste.includes(ren)) return { ok: false, feil: 'Denne koden er allerede brukt.' };
      setData((d) => ({
        ...d,
        gavekort: { saldo: d.gavekort.saldo + belop, innloste: [...d.gavekort.innloste, ren] },
      }));
      return { ok: true, belop };
    },
    [data.gavekort.innloste],
  );

  const betalMedGavekort = useCallback(
    (belop: number) => {
      if (data.gavekort.saldo < belop) return false;
      setData((d) => ({ ...d, gavekort: { ...d.gavekort, saldo: d.gavekort.saldo - belop } }));
      return true;
    },
    [data.gavekort.saldo],
  );

  const verdi = useMemo<BrukerContextVerdi>(
    () => ({
      student: data.student,
      preferanser: data.preferanser,
      gavekort: data.gavekort,
      lastet,
      loggInn,
      loggUt,
      settVegetar,
      vekslAllergen,
      settFavoritt,
      settVarselReddMaten,
      loesInnGavekort,
      betalMedGavekort,
    }),
    [data, lastet, loggInn, loggUt, settVegetar, vekslAllergen, settFavoritt, settVarselReddMaten, loesInnGavekort, betalMedGavekort],
  );

  return <BrukerContext.Provider value={verdi}>{children}</BrukerContext.Provider>;
}

export function useBruker(): BrukerContextVerdi {
  const context = useContext(BrukerContext);
  if (!context) {
    throw new Error('useBruker må brukes inni <BrukerProvider>');
  }
  return context;
}
