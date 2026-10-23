import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { settAktivtSpraak, t, type Spraak } from '../i18n';
import { settAktivtTema } from '../theme';

/**
 * Innstillinger for utseende (lys/mørk) og språk.
 * Lagres på telefonen, så de huskes til neste gang – også når man ikke er innlogget.
 */

const LAGRINGSNOKKEL = 'kantina:innstillinger:v1';

/** system = følg telefonen/nettleseren */
export type Temavalg = 'system' | 'lys' | 'mork';

interface Lagret {
  tema: Temavalg;
  spraak: Spraak;
}

interface InnstillingerVerdi extends Lagret {
  /** true når appen faktisk vises i mørk modus */
  erMork: boolean;
  settTema: (tema: Temavalg) => void;
  settSpraak: (spraak: Spraak) => void;
  /** Oversettelsesfunksjonen (se src/i18n) */
  t: typeof t;
}

const InnstillingerContext = createContext<InnstillingerVerdi | null>(null);

export function InnstillingerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Lagret>({ tema: 'system', spraak: 'nb' });
  const [lastet, setLastet] = useState(false);
  const systemtema = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(LAGRINGSNOKKEL)
      .then((tekst) => {
        if (tekst) setData((d) => ({ ...d, ...(JSON.parse(tekst) as Partial<Lagret>) }));
      })
      .catch((feil) => console.warn('Kunne ikke lese innstillinger', feil))
      .finally(() => setLastet(true));
  }, []);

  useEffect(() => {
    if (!lastet) return;
    AsyncStorage.setItem(LAGRINGSNOKKEL, JSON.stringify(data)).catch((feil) =>
      console.warn('Kunne ikke lagre innstillinger', feil),
    );
  }, [data, lastet]);

  const erMork = data.tema === 'mork' || (data.tema === 'system' && systemtema === 'dark');

  // Settes før skjermene tegnes, så farger og tekst blir riktige med en gang.
  settAktivtTema(erMork ? 'mork' : 'lys');
  settAktivtSpraak(data.spraak);

  const settTema = useCallback((tema: Temavalg) => setData((d) => ({ ...d, tema })), []);
  const settSpraak = useCallback((spraak: Spraak) => setData((d) => ({ ...d, spraak })), []);

  // Ny verdi når tema eller språk endres -> alle skjermer som bruker
  // useInnstillinger() tegnes på nytt.
  const verdi = useMemo<InnstillingerVerdi>(
    () => ({ ...data, erMork, settTema, settSpraak, t: (tekst, verdier) => t(tekst, verdier) }),
    [data, erMork, settTema, settSpraak],
  );

  // Vent til lagrede innstillinger er lest, så appen ikke blinker i feil tema.
  if (!lastet) return null;

  return <InnstillingerContext.Provider value={verdi}>{children}</InnstillingerContext.Provider>;
}

export function useInnstillinger(): InnstillingerVerdi {
  const context = useContext(InnstillingerContext);
  if (!context) {
    throw new Error('useInnstillinger må brukes inni <InnstillingerProvider>');
  }
  return context;
}
