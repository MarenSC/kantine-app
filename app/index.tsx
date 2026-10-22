import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Merkelapp } from '../src/components/Merkelapp';
import { useBruker } from '../src/context/BrukerContext';
import { byggPaaCampus, campuser, hentBygg, hentKantine, kantinerIBygg } from '../src/data/kantiner';
import { avstand, farger, radius, skrift } from '../src/theme';
import type { Kantine } from '../src/types';
import { erAapen } from '../src/utils/dato';

/** Startskjerm: studenten velger hvilken kantine hun/han vil se. */
export default function VelgKantineSkjerm() {
  const { student, preferanser } = useBruker();
  const favoritt = preferanser.favorittKantineId ? hentKantine(preferanser.favorittKantineId) : undefined;
  const fornavn = student?.navn.split(' ')[0];

  return (
    <>
      <ScrollView contentContainerStyle={styles.innhold}>
        <Text style={skrift.tittel}>{fornavn ? `Hei, ${fornavn}!` : 'Hvor er du i dag?'}</Text>
        <Text style={skrift.liten}>
          Velg kantine for å se menyen, dagens tilbud og varer med datorabatt.
        </Text>

        {favoritt && (
          <View style={styles.campus}>
            <Text style={styles.campusNavn}>Din favoritt</Text>
            <View style={styles.bygg}>
              <KantineRad kantine={favoritt} visBygg />
            </View>
          </View>
        )}

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

function KantineRad({ kantine, visBygg = false }: { kantine: Kantine; visBygg?: boolean }) {
  const aapen = erAapen(kantine.aapner, kantine.stenger);
  const bygg = visBygg ? hentBygg(kantine.byggId) : undefined;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/kantine/[id]', params: { id: kantine.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${kantine.navn}, ${aapen ? 'åpent' : 'stengt'}`}
      style={({ pressed }) => [styles.kantine, visBygg && styles.utenKant, pressed && styles.trykket]}
    >
      <View style={styles.kantineTekst}>
        <Text style={styles.kantineNavn}>{kantine.navn}</Text>
        <Text style={skrift.liten}>
          {bygg ? `${bygg.navn} · ` : ''}
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
  utenKant: {
    borderTopWidth: 0,
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
