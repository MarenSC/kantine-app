import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { avstand, farger, fonter, radius } from '../theme';

interface Props {
  antall: number;
  maks: number;
  onEndre: (nyttAntall: number) => void;
}

/** − 2 + -knapper for å endre antall i handlekurven. */
export function Antallvelger({ antall, maks, onEndre }: Props) {
  const kanOke = antall < maks;

  return (
    <View style={styles.rad}>
      <Pressable
        onPress={() => onEndre(antall - 1)}
        accessibilityRole="button"
        accessibilityLabel={antall === 1 ? 'Fjern fra handlekurv' : 'Reduser antall'}
        style={styles.knapp}
        hitSlop={8}
      >
        <Ionicons name={antall === 1 ? 'trash-outline' : 'remove'} size={18} color={farger.primaerMork} />
      </Pressable>

      <Text style={styles.antall} accessibilityLabel={`Antall: ${antall}`}>
        {antall}
      </Text>

      <Pressable
        onPress={() => onEndre(antall + 1)}
        disabled={!kanOke}
        accessibilityRole="button"
        accessibilityLabel="Øk antall"
        style={[styles.knapp, !kanOke && styles.deaktivert]}
        hitSlop={8}
      >
        <Ionicons name="add" size={18} color={kanOke ? farger.primaerMork : farger.tekstDempet} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
  },
  knapp: {
    width: 34,
    height: 34,
    borderRadius: radius.rund,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deaktivert: {
    backgroundColor: farger.kant,
  },
  antall: {
    minWidth: 20,
    textAlign: 'center',
    fontFamily: fonter.fet,
    fontSize: 16,
    color: farger.tekst,
  },
});
