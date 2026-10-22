import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { avstand, farger, radius } from '../theme';

interface Props {
  tittel: string;
  onPress: () => void;
  variant?: 'primaer' | 'sekundaer';
  deaktivert?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Standardknapp som brukes i hele appen. */
export function Knapp({ tittel, onPress, variant = 'primaer', deaktivert = false, style }: Props) {
  const erPrimaer = variant === 'primaer';

  return (
    <Pressable
      onPress={onPress}
      disabled={deaktivert}
      accessibilityRole="button"
      accessibilityState={{ disabled: deaktivert }}
      style={({ pressed }) => [
        styles.knapp,
        erPrimaer ? styles.primaer : styles.sekundaer,
        deaktivert && styles.deaktivert,
        pressed && !deaktivert && styles.trykket,
        style,
      ]}
    >
      <Text style={[styles.tekst, erPrimaer ? styles.tekstPrimaer : styles.tekstSekundaer]}>
        {tittel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knapp: {
    minHeight: 50,
    paddingHorizontal: avstand.l,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaer: {
    backgroundColor: farger.primaer,
  },
  sekundaer: {
    backgroundColor: farger.kort,
    borderWidth: 1,
    borderColor: farger.primaer,
  },
  deaktivert: {
    backgroundColor: farger.deaktivert,
    borderColor: farger.deaktivert,
  },
  trykket: {
    opacity: 0.85,
  },
  tekst: {
    fontSize: 16,
    fontWeight: '600',
  },
  tekstPrimaer: {
    color: '#FFFFFF',
  },
  tekstSekundaer: {
    color: farger.primaer,
  },
});
