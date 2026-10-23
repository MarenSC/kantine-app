import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { hentBygg, kantiner } from '../data/kantiner';
import { useNaa } from '../hooks/useNaa';
import { avstand, farger, fonter, radius, skrift } from '../theme';
import { erAapen } from '../utils/dato';
import { SioMerke } from './SioMerke';

const SIO_URL = 'https://www.sio.no';

/**
 * Infodel nederst på startsiden: åpningstider, kontakt og avsender.
 * Fungerer som appens "footer" uten å konkurrere med bunnmenyen.
 */
export function InfoBunn() {
  const naa = useNaa(60_000);

  return (
    <View style={styles.beholder}>
      <View style={styles.skille} />

      <Text style={skrift.etikett}>Åpningstider i dag</Text>
      <View style={styles.liste}>
        {kantiner.map((k) => {
          const aapen = erAapen(k.aapner, k.stenger, naa);
          return (
            <View key={k.id} style={styles.rad} accessible accessibilityLabel={`${k.navn}, ${k.aapner} til ${k.stenger}, ${aapen ? 'åpent nå' : 'stengt nå'}`}>
              <View style={[styles.prikk, { backgroundColor: aapen ? farger.suksess : farger.deaktivert }]} />
              <Text style={[skrift.brodtekst, styles.flex]} numberOfLines={1}>
                {k.navn}
                <Text style={skrift.liten}> · {hentBygg(k.byggId)?.kortnavn}</Text>
              </Text>
              <Text style={styles.tid}>
                {k.aapner}–{k.stenger}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.kontakt}>
        <Ionicons name="chatbubbles-outline" size={20} color={farger.primaerMork} />
        <View style={styles.flex}>
          <Text style={skrift.fet}>Spørsmål om allergener eller maten?</Text>
          <Text style={skrift.liten}>Spør i kassa, eller kontakt SiO Mat og drikke.</Text>
          <Pressable
            onPress={() => Linking.openURL(SIO_URL)}
            accessibilityRole="link"
            hitSlop={8}
            style={styles.lenke}
          >
            <Text style={styles.lenkeTekst}>sio.no</Text>
            <Ionicons name="open-outline" size={14} color={farger.primaerMork} />
          </Pressable>
        </View>
      </View>

      <View style={styles.avsender}>
        <SioMerke midtstilt />
        <Text style={[skrift.liten, styles.midtstilt]}>Studentprototype – OsloMet 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  beholder: {
    gap: avstand.m,
    marginTop: avstand.s,
  },
  skille: {
    height: 1,
    backgroundColor: farger.kant,
    marginBottom: avstand.s,
  },
  liste: {
    gap: avstand.s,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
  },
  prikk: {
    width: 8,
    height: 8,
    borderRadius: radius.rund,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  tid: {
    fontFamily: fonter.medium,
    fontSize: 14,
    color: farger.tekstDempet,
  },
  kontakt: {
    flexDirection: 'row',
    gap: avstand.m,
    padding: avstand.l,
    marginTop: avstand.s,
    borderRadius: radius.l,
    backgroundColor: farger.primaerLys,
  },
  lenke: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: avstand.xs,
    alignSelf: 'flex-start',
  },
  lenkeTekst: {
    fontFamily: fonter.fet,
    fontSize: 14,
    color: farger.primaerMork,
    textDecorationLine: 'underline',
  },
  avsender: {
    gap: avstand.xs,
    marginTop: avstand.m,
    alignItems: 'center',
  },
  midtstilt: {
    textAlign: 'center',
  },
});
