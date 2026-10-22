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

import type { Preferanser, Student } from '../types';

/**
 * Holder styr på innlogget student og preferansene (allergier, kosthold,
 * favorittkantine). Alt lagres på telefonen med AsyncStorage, slik at det
 * huskes når appen lukkes og åpnes igjen.
 */

const LAGRINGSNOKKEL = 'kantina:bruker:v1';

const standardPreferanser: Preferanser = {
  allergener: [],
  vegetar: false,
  favorittKantineId: null,
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
}

interface BrukerContextVerdi {
  student: Student | null;
  preferanser: Preferanser;
  /** false til lagrede data er lest inn ved oppstart */
  lastet: boolean;
  loggInn: (student: Student) => void;
  loggUt: () => void;
  settVegetar: (vegetar: boolean) => void;
  vekslAllergen: (allergen: string) => void;
  settFavoritt: (kantineId: string | null) => void;
}

const BrukerContext = createContext<BrukerContextVerdi | null>(null);

export function BrukerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Lagret>({ student: null, preferanser: standardPreferanser });
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
    setData((d) => ({ ...d, student }));
  }, []);

  const loggUt = useCallback(() => {
    // Preferansene slettes også, siden de hører til studenten.
    setData({ student: null, preferanser: standardPreferanser });
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

  const verdi = useMemo<BrukerContextVerdi>(
    () => ({
      student: data.student,
      preferanser: data.preferanser,
      lastet,
      loggInn,
      loggUt,
      settVegetar,
      vekslAllergen,
      settFavoritt,
    }),
    [data, lastet, loggInn, loggUt, settVegetar, vekslAllergen, settFavoritt],
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
