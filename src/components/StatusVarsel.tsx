import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBestilling } from '../context/BestillingContext';
import { useInnstillinger } from '../context/InnstillingerContext';
import { hentKantine } from '../data/kantiner';
import { useNaa } from '../hooks/useNaa';
import { avstand, farger, fonter, lagStiler, radius } from '../theme';
import type { Bestillingssteg } from '../types';
import { klokkeslett } from '../utils/dato';
import { hentStatus } from '../utils/status';

/** Stegene som vises i fremdriftslinjen */
const STEG: Bestillingssteg[] = ['mottatt', 'tilberedes', 'klar'];

const ikon: Record<Bestillingssteg, ComponentProps<typeof Ionicons>['name']> = {
  mottatt: 'receipt-outline',
  tilberedes: 'flame-outline',
  klar: 'checkmark-circle',
  utlevert: 'checkmark-done',
};

/**
 * Flytende statusvarsel øverst på skjermen for den nyeste aktive bestillingen.
 * Oppdateres av seg selv og glir inn på nytt hver gang statusen endrer seg.
 * Studenten kan lukke det – det kommer tilbake ved neste statusendring.
 */
export function StatusVarsel() {
  const { t } = useInnstillinger();
  const { bestillinger } = useBestilling();
  const naa = useNaa(5_000);
  const sti = usePathname();
  const insets = useSafeAreaInsets();
  // Hvilket steg brukeren har lukket varselet for, per bestilling
  const [lukket, setLukket] = useState<Record<string, Bestillingssteg>>({});

  const aktive = bestillinger
    .map((b) => ({ bestilling: b, status: hentStatus(b, naa) }))
    .filter((x) => x.status.steg !== 'utlevert');
  const gjeldende = aktive[0];

  const synlig =
    gjeldende !== undefined &&
    lukket[gjeldende.bestilling.id] !== gjeldende.status.steg &&
    // Ikke vis varselet når man allerede ser på denne bestillingen
    sti !== `/bestillinger/${gjeldende.bestilling.id}`;

  // Glid inn når varselet vises eller statusen endrer seg
  const animasjon = useRef(new Animated.Value(0)).current;
  const nokkel = gjeldende ? `${gjeldende.bestilling.id}-${gjeldende.status.steg}` : '';
  useEffect(() => {
    if (!synlig) return;
    animasjon.setValue(0);
    Animated.spring(animasjon, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      friction: 7,
    }).start();
  }, [nokkel, synlig, animasjon]);

  if (!synlig || !gjeldende) return null;

  const { bestilling, status } = gjeldende;
  const kantine = hentKantine(bestilling.kantineId);
  const erKlar = status.steg === 'klar';
  const stegIndeks = STEG.indexOf(status.steg);
  const l = bestilling.leveringsmaate;
  const detalj =
    l.type === 'henting'
      ? erKlar
        ? t('Vis koden #{kode} og sveip i kassa', { kode: bestilling.hentekode })
        : `${t('Hentes ca. kl. {tid}', { tid: klokkeslett(new Date(l.hentetid)) })} · #${bestilling.hentekode}`
      : erKlar
        ? t('På vei til {sted}', { sted: l.plassering })
        : t('Leveres til {sted}', { sted: l.plassering });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.ytre,
        { top: insets.top + avstand.s },
        {
          opacity: animasjon,
          transform: [{ translateY: animasjon.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={() => router.push({ pathname: '/bestillinger/[id]', params: { id: bestilling.id } })}
        accessibilityRole="button"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${t('Bestilling')} ${bestilling.hentekode}: ${status.tekst}. ${detalj}. ${t('Trykk for detaljer.')}`}
        style={({ pressed }) => [styles.kort, erKlar && styles.kortKlar, pressed && { opacity: 0.92 }]}
      >
        <View style={[styles.ikon, erKlar && styles.ikonKlar]}>
          <Ionicons name={ikon[status.steg]} size={22} color={erKlar ? farger.hvit : farger.primaerMork} />
        </View>

        <View style={styles.tekst}>
          <View style={styles.toppRad}>
            <Text style={[styles.tittel, erKlar && styles.tittelKlar]}>{status.tekst}</Text>
            {aktive.length > 1 ? <Text style={styles.flere}>{t('+{antall} til', { antall: aktive.length - 1 })}</Text> : null}
          </View>
          <Text style={styles.detalj} numberOfLines={1}>
            {kantine?.navn} · {detalj}
          </Text>
          <View style={styles.fremdrift}>
            {STEG.map((s, i) => (
              <View key={s} style={[styles.segment, i <= stegIndeks && (erKlar ? styles.segmentKlar : styles.segmentAktiv)]} />
            ))}
          </View>
        </View>

        {erKlar ? (
          // Snarvei til kvitteringen, der studenten sveiper for å bekrefte
          <View style={styles.handling}>
            <Text style={styles.handlingTekst}>{l.type === 'henting' ? t('Vis kode') : t('Bekreft')}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => setLukket((x) => ({ ...x, [bestilling.id]: status.steg }))}
          accessibilityRole="button"
          accessibilityLabel={t('Skjul statusvarsel')}
          hitSlop={10}
          style={styles.lukk}
        >
          <Ionicons name="close" size={18} color={farger.tekstDempet} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = lagStiler(() => ({
  ytre: {
    position: 'absolute',
    left: avstand.m,
    right: avstand.m,
    zIndex: 100,
    elevation: 100,
  },
  kort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    padding: avstand.m,
    borderRadius: radius.l,
    backgroundColor: farger.kort,
    borderWidth: 1,
    borderColor: farger.kant,
    shadowColor: '#33281F',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  kortKlar: {
    backgroundColor: farger.suksessLys,
    borderColor: farger.suksessLys,
  },
  ikon: {
    width: 42,
    height: 42,
    borderRadius: radius.rund,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ikonKlar: {
    backgroundColor: farger.suksess,
  },
  tekst: {
    flex: 1,
    gap: 3,
  },
  toppRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
  },
  tittel: {
    fontFamily: fonter.tittel,
    fontSize: 16,
    color: farger.tekst,
  },
  tittelKlar: {
    color: farger.suksess,
  },
  flere: {
    fontFamily: fonter.medium,
    fontSize: 12,
    color: farger.tekstDempet,
  },
  detalj: {
    fontFamily: fonter.vanlig,
    fontSize: 13,
    color: farger.tekstDempet,
  },
  fremdrift: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 3,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radius.rund,
    backgroundColor: farger.kant,
  },
  segmentAktiv: {
    backgroundColor: farger.primaer,
  },
  segmentKlar: {
    backgroundColor: farger.suksess,
  },
  handling: {
    paddingHorizontal: avstand.m,
    paddingVertical: avstand.s - 2,
    borderRadius: radius.rund,
    backgroundColor: farger.suksess,
  },
  handlingTekst: {
    fontFamily: fonter.fet,
    fontSize: 13,
    color: farger.suksessLys,
  },
  lukk: {
    alignSelf: 'flex-start',
    padding: 2,
  },
}));
