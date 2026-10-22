import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Stack, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Merkelapp } from '../src/components/Merkelapp';
import { useBestilling } from '../src/context/BestillingContext';
import { byggPaaCampus, campuser, kantinerIBygg } from '../src/data/kantiner';
import { avstand, farger, radius, skrift } from '../src/theme';
import type { Kantine } from '../src/types';
import { erAapen } from '../src/utils/dato';

/** Startskjerm: studenten velger hvilken kantine hun/han vil se. */
export default function VelgKantineSkjerm() {
  const { bestillinger } = useBestilling();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/bestillinger" asChild>
              <Pressable accessibilityLabel="Mine bestillinger" hitSlop={10} style={styles.headerKnapp}>
                <Ionicons name="receipt-outline" size={24} color={farger.primaer} />
                {bestillinger.length > 0 && <View style={styles.prikk} />}
              </Pressable>
            </Link>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.innhold}>
        <Text style={skrift.tittel}>Hvor er du i dag?</Text>
        <Text style={skrift.liten}>
          Velg kantine for å se menyen, dagens tilbud og varer med datorabatt.
        </Text>

        {campuser.map((campus) => (
          <View key={campus.id} style={styles.campus}>
            <Text style={styles.campusNavn}>{campus.navn}</Text>

            {byggPaaCampus(campus.id).map((b) => (
              <View key={b.id} style={styles.bygg}>
                <View style={styles.byggHode}>
                  <View style={styles.byggIkon}>
                    <Text style={styles.byggKortnavn}>{b.kortnavn}</Text>
                  </View>
                  <Text style={skrift.overskrift}>{b.navn}</Text>
                </View>

                {kantinerIBygg(b.id).map((kantine) => (
                  <KantineRad key={kantine.id} kantine={kantine} />
                ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );
}

function KantineRad({ kantine }: { kantine: Kantine }) {
  const aapen = erAapen(kantine.aapner, kantine.stenger);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/kantine/[id]', params: { id: kantine.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${kantine.navn}, ${aapen ? 'åpent' : 'stengt'}`}
      style={({ pressed }) => [styles.kantine, pressed && styles.trykket]}
    >
      <View style={styles.kantineTekst}>
        <Text style={styles.kantineNavn}>{kantine.navn}</Text>
        <Text style={skrift.liten}>
          {kantine.plassering} · {kantine.aapner}–{kantine.stenger}
        </Text>
        <View style={styles.merkelapper}>
          <Merkelapp tekst={aapen ? 'Åpent nå' : 'Stengt'} variant={aapen ? 'suksess' : 'tilbud'} />
          {kantine.leveringTilBord && <Merkelapp tekst="Levering til bord" />}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={farger.tekstDempet} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  innhold: {
    padding: avstand.l,
    gap: avstand.s,
  },
  headerKnapp: {
    padding: avstand.xs,
  },
  prikk: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: radius.rund,
    backgroundColor: farger.tilbud,
  },
  campus: {
    marginTop: avstand.l,
    gap: avstand.m,
  },
  campusNavn: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: farger.tekstDempet,
  },
  bygg: {
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: farger.kant,
    overflow: 'hidden',
  },
  byggHode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    padding: avstand.l,
  },
  byggIkon: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
  },
  byggKortnavn: {
    fontWeight: '700',
    color: farger.primaer,
  },
  kantine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    paddingHorizontal: avstand.l,
    paddingVertical: avstand.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: farger.kant,
  },
  trykket: {
    backgroundColor: farger.bakgrunn,
  },
  kantineTekst: {
    flex: 1,
    gap: avstand.xs,
  },
  kantineNavn: {
    fontSize: 16,
    fontWeight: '600',
    color: farger.tekst,
  },
  merkelapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: avstand.s,
    marginTop: avstand.xs,
  },
});
