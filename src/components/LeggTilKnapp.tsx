import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { farger, fonter, radius } from '../theme';

interface Props {
  navn: string;
  antallIKurv: number;
  aktiv: boolean;
  onPress: () => void;
}

/** Rund "+"-knapp. Når varen ligger i kurven, vises antallet på mørk bakgrunn. */
export function LeggTilKnapp({ navn, antallIKurv, aktiv, onPress }: Props) {
  const iKurv = antallIKurv > 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={!aktiv}
      accessibilityRole="button"
      accessibilityLabel={iKurv ? `${navn}, ${antallIKurv} i handlekurven. Legg til én til` : `Legg ${navn} i handlekurven`}
      style={({ pressed }) => [
        styles.knapp,
        iKurv && styles.iKurv,
        !aktiv && styles.deaktivert,
        pressed && { opacity: 0.8 },
      ]}
      hitSlop={6}
    >
      {iKurv ? <Text style={styles.antall}>{antallIKurv}</Text> : <Ionicons name="add" size={24} color={farger.hvit} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knapp: {
    width: 44,
    height: 44,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iKurv: {
    backgroundColor: farger.morkFlate,
  },
  deaktivert: {
    backgroundColor: farger.deaktivert,
  },
  antall: {
    color: farger.hvit,
    fontFamily: fonter.fet,
    fontSize: 16,
  },
});
