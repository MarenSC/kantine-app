import { usePathname, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBestilling } from '../context/BestillingContext';
import { avstand, farger, fonter, radius } from '../theme';
import { gaaTilHovedside } from '../utils/navigasjon';

const lenker: { tittel: string; href: Href; sti: string }[] = [
  { tittel: 'Hjem', href: '/', sti: '/' },
  { tittel: 'Bestillinger', href: '/bestillinger', sti: '/bestillinger' },
  { tittel: 'Min side', href: '/min-side', sti: '/min-side' },
];

/** Pilleformet meny nederst på hovedsidene (Hjem, Bestillinger, Min side). */
export function Bunnmeny() {
  const sti = usePathname();
  const insets = useSafeAreaInsets();
  const { bestillinger } = useBestilling();

  return (
    <View style={[styles.ytre, { paddingBottom: Math.max(insets.bottom, avstand.l) }]}>
      <View style={styles.meny} accessibilityRole="tablist">
        {lenker.map((lenke) => {
          const aktiv = sti === lenke.sti;
          const tittel =
            lenke.sti === '/bestillinger' && bestillinger.length > 0
              ? `${lenke.tittel} (${bestillinger.length})`
              : lenke.tittel;
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

const styles = StyleSheet.create({
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
    color: farger.bakgrunn,
  },
  tekstAktiv: {
    fontFamily: fonter.fet,
    color: farger.hvit,
  },
});
