import { usePathname, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBestilling } from '../context/BestillingContext';
import { useInnstillinger } from '../context/InnstillingerContext';
import { useNaa } from '../hooks/useNaa';
import { avstand, farger, fonter, lagStiler, radius } from '../theme';
import { gaaTilHovedside } from '../utils/navigasjon';
import { hentStatus } from '../utils/status';

const lenker: { tittel: string; href: Href; sti: string }[] = [
  { tittel: 'Hjem', href: '/', sti: '/' },
  { tittel: 'Bestillinger', href: '/bestillinger', sti: '/bestillinger' },
  { tittel: 'Min side', href: '/min-side', sti: '/min-side' },
];

/** Pilleformet meny nederst på hovedsidene (Hjem, Bestillinger, Min side). */
export function Bunnmeny() {
  const { t } = useInnstillinger();
  const sti = usePathname();
  const insets = useSafeAreaInsets();
  const { bestillinger } = useBestilling();
  const naa = useNaa();
  // Tallet viser bare aktive bestillinger (ikke hentede/leverte)
  const antallAktive = bestillinger.filter((b) => hentStatus(b, naa).steg !== 'utlevert').length;

  return (
    <View style={[styles.ytre, { paddingBottom: Math.max(insets.bottom, avstand.l) }]}>
      <View style={styles.meny} accessibilityRole="tablist">
        {lenker.map((lenke) => {
          const aktiv = sti === lenke.sti;
          const tittel =
            lenke.sti === '/bestillinger' && antallAktive > 0
              ? `${t(lenke.tittel)} (${antallAktive})`
              : t(lenke.tittel);
          return (
            <Pressable
              key={lenke.sti}
              onPress={() => {
                if (!aktiv) gaaTilHovedside(lenke.href, sti === '/');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: aktiv }}
              style={[styles.lenke, aktiv && styles.aktiv]}
            >
              <Text style={[styles.tekst, aktiv && styles.tekstAktiv]}>{tittel}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = lagStiler(() => ({
  ytre: {
    paddingHorizontal: avstand.l,
    paddingTop: avstand.s,
    backgroundColor: farger.bakgrunn,
  },
  meny: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: radius.rund,
    backgroundColor: farger.morkFlate,
  },
  lenke: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.rund,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aktiv: {
    backgroundColor: farger.primaer,
  },
  tekst: {
    fontFamily: fonter.medium,
    fontSize: 14,
    color: farger.paaMork,
  },
  tekstAktiv: {
    fontFamily: fonter.fet,
    color: farger.hvit,
  },
}));
