import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { hentKantine } from '../data/kantiner';
import { avstand, farger, lagStiler, radius, skrift, skygge } from '../theme';
import { locale, t } from '../i18n';
import type { Bestilling } from '../types';
import { klokkeslett } from '../utils/dato';
import { formaterPris } from '../utils/pris';
import type { Bestillingsstatus } from '../utils/status';
import { Merkelapp } from './Merkelapp';

/** Ett kort i listen over bestillinger. Trykk åpner kvitteringen. */
export function BestillingRad({ bestilling, status, visDato = false }: {
  bestilling: Bestilling;
  status: Bestillingsstatus;
  /** Vis dato i tillegg til klokkeslett (for tidligere bestillinger) */
  visDato?: boolean;
}) {
  const antallVarer = bestilling.linjer.reduce((sum, l) => sum + l.antall, 0);
  const opprettet = new Date(bestilling.opprettet);
  const dato = new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'short' }).format(opprettet);
  const tid = visDato ? `${dato} · ${klokkeslett(opprettet)}` : t('Bestilt {tid}', { tid: klokkeslett(opprettet) });

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/bestillinger/[id]', params: { id: bestilling.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.kort, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.tekst}>
        <Text style={skrift.overskrift}>{hentKantine(bestilling.kantineId)?.navn ?? t('Kantine')}</Text>
        <Text style={skrift.liten}>
          {tid} · {t(antallVarer === 1 ? '{antall} vare' : '{antall} varer', { antall: antallVarer })} · {formaterPris(bestilling.totalpris)}
        </Text>
        <Merkelapp tekst={status.tekst} variant={status.ferdig ? 'suksess' : 'info'} />
      </View>
      <Ionicons name="chevron-forward" size={20} color={farger.tekstDempet} />
    </Pressable>
  );
}

const styles = lagStiler(() => ({
  kort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    padding: avstand.l,
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
  },
  tekst: {
    flex: 1,
    gap: avstand.xs,
  },
}));
