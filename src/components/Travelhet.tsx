import { StyleSheet, Text, View } from 'react-native';

import { travelhetGjennomDagen, travelhetTekst } from '../data/travelhet';
import { useNaa } from '../hooks/useNaa';
import { avstand, farger, fonter, radius, skrift, skygge } from '../theme';
import type { Kantine } from '../types';
import { erAapen } from '../utils/dato';

const MAKS_HOYDE = 56;

/** Søylediagram som viser hvor fullt det pleier å være gjennom dagen. */
export function Travelhet({ kantine }: { kantine: Kantine }) {
  const naa = useNaa(60_000);
  const timer = travelhetGjennomDagen(kantine.id, kantine.aapner, kantine.stenger);
  const denneTimen = naa.getHours();
  const aapen = erAapen(kantine.aapner, kantine.stenger, naa);
  const naaVerdi = timer.find((t) => t.time === denneTimen);

  const oppsummering =
    aapen && naaVerdi ? `${travelhetTekst(naaVerdi.nivaa)} akkurat nå` : 'Stengt nå – slik pleier det å være';

  // Roligste time etter nå, som tips til studenten
  const roligst = timer
    .filter((t) => t.time > denneTimen)
    .sort((a, b) => a.nivaa - b.nivaa)[0];

  return (
    <View
      style={styles.kort}
      accessible
      accessibilityLabel={`Hvor fullt er det? ${oppsummering}.${roligst ? ` Roligst klokken ${roligst.time}.` : ''}`}
    >
      <View style={styles.topp}>
        <Text style={skrift.fet}>Hvor fullt er det?</Text>
        <Text style={skrift.liten}>{oppsummering}</Text>
      </View>

      <View style={styles.soyler}>
        {timer.map((t) => {
          const erNaa = aapen && t.time === denneTimen;
          return (
            <View key={t.time} style={styles.kolonne}>
              <View style={styles.spor}>
                <View
                  style={[
                    styles.soyle,
                    { height: Math.max(4, (t.nivaa / 100) * MAKS_HOYDE) },
                    erNaa && styles.soyleNaa,
                  ]}
                />
              </View>
              <Text style={[styles.time, erNaa && styles.timeNaa]}>{t.time % 2 === 0 || erNaa ? t.time : ''}</Text>
            </View>
          );
        })}
      </View>

      {roligst ? (
        <Text style={skrift.liten}>
          Tips: Roligst rundt kl. {String(roligst.time).padStart(2, '0')}:00
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kort: {
    gap: avstand.m,
    padding: avstand.l,
    borderRadius: radius.l,
    backgroundColor: farger.kort,
    ...skygge,
  },
  topp: {
    gap: 2,
  },
  soyler: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  kolonne: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  spor: {
    height: MAKS_HOYDE,
    width: '100%',
    justifyContent: 'flex-end',
  },
  soyle: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: farger.primaerLys,
  },
  soyleNaa: {
    backgroundColor: farger.primaer,
  },
  time: {
    fontFamily: fonter.vanlig,
    fontSize: 11,
    color: farger.tekstDempet,
  },
  timeNaa: {
    fontFamily: fonter.fet,
    color: farger.primaerMork,
  },
});
