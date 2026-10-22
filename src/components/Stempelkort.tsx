import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { STEMPLER_FOR_GRATIS } from '../context/BestillingContext';
import { avstand, farger, fonter, radius, skrift } from '../theme';

/**
 * Kaffekort: hver kaffe gir ett stempel. Den tiende er gratis.
 * Antall stempler regnes ut fra bestillingene (se BestillingContext).
 */
export function Stempelkort({ stempler }: { stempler: number }) {
  const paaKortet = stempler % STEMPLER_FOR_GRATIS;
  // Et fullt kort (f.eks. 10, 20 …) betyr at neste kaffe er gratis.
  const fullt = stempler > 0 && paaKortet === 0;
  const fylte = fullt ? STEMPLER_FOR_GRATIS : paaKortet;
  const igjen = STEMPLER_FOR_GRATIS - fylte;

  return (
    <View
      style={styles.kort}
      accessible
      accessibilityLabel={`Kaffekort: ${fylte} av ${STEMPLER_FOR_GRATIS} stempler. ${
        fullt ? 'Neste kaffe er gratis.' : `${igjen} igjen til gratis kaffe.`
      }`}
    >
      <View style={styles.topp}>
        <Text style={skrift.overskrift}>Kaffekort</Text>
        <Text style={styles.teller}>
          {fylte}/{STEMPLER_FOR_GRATIS}
        </Text>
      </View>

      <View style={styles.rutenett}>
        {Array.from({ length: STEMPLER_FOR_GRATIS }, (_, i) => {
          const fylt = i < fylte;
          const sisteGratis = i === STEMPLER_FOR_GRATIS - 1;
          return (
            <View key={i} style={[styles.stempel, fylt && styles.stempelFylt, sisteGratis && !fylt && styles.gratis]}>
              {fylt ? (
                <Ionicons name="cafe" size={16} color={farger.hvit} />
              ) : sisteGratis ? (
                <Text style={styles.gratisTekst}>Gratis</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <Text style={fullt ? styles.fulltTekst : skrift.liten}>
        {fullt
          ? 'Neste kaffe er gratis! Vis kortet i kassa.'
          : `${igjen} ${igjen === 1 ? 'kaffe' : 'kaffer'} til, så er den neste gratis.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kort: {
    gap: avstand.m,
  },
  topp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  teller: {
    fontFamily: fonter.tittel,
    fontSize: 18,
    color: farger.primaerMork,
  },
  rutenett: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: avstand.s,
  },
  stempel: {
    width: '17%',
    aspectRatio: 1,
    borderRadius: radius.rund,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: farger.kant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stempelFylt: {
    borderStyle: 'solid',
    borderColor: farger.primaer,
    backgroundColor: farger.primaer,
  },
  gratis: {
    borderStyle: 'solid',
    borderColor: farger.primaerLys,
    backgroundColor: farger.primaerLys,
  },
  gratisTekst: {
    fontFamily: fonter.fet,
    fontSize: 10,
    color: farger.primaerMork,
  },
  fulltTekst: {
    fontFamily: fonter.fet,
    fontSize: 14,
    color: farger.suksess,
  },
});
