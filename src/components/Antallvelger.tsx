import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { avstand, farger, radius } from '../theme';

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
        <Ionicons name={antall === 1 ? 'trash-outline' : 'remove'} size={18} color={farger.primaer} />
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
        <Ionicons name="add" size={18} color={kanOke ? farger.primaer : farger.deaktivert} />
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
    width: 32,
    height: 32,
    borderRadius: radius.rund,
    borderWidth: 1,
    borderColor: farger.primaer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deaktivert: {
    borderColor: farger.deaktivert,
  },
  antall: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: farger.tekst,
  },
});
