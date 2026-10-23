import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { avstand, farger, fonter, lagStiler, radius } from '../theme';

interface Props {
  tittel: string;
  onPress: () => void;
  /** primaer = terrakotta, mork = mørk brun, sekundaer = kantlinje */
  variant?: 'primaer' | 'mork' | 'sekundaer';
  deaktivert?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Pilleformet standardknapp. */
export function Knapp({ tittel, onPress, variant = 'primaer', deaktivert = false, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deaktivert}
      accessibilityRole="button"
      accessibilityState={{ disabled: deaktivert }}
      style={({ pressed }) => [
        styles.knapp,
        styles[variant],
        deaktivert && styles.deaktivert,
        pressed && !deaktivert && styles.trykket,
        style,
      ]}
    >
      <Text style={[styles.tekst, variant === 'sekundaer' ? styles.tekstSekundaer : styles.tekstLys]}>
        {tittel}
      </Text>
    </Pressable>
  );
}

const styles = lagStiler(() => ({
  knapp: {
    minHeight: 50,
    paddingHorizontal: avstand.xl,
    borderRadius: radius.rund,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaer: {
    backgroundColor: farger.primaer,
  },
  mork: {
    backgroundColor: farger.morkFlate,
  },
  sekundaer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: farger.kant,
  },
  deaktivert: {
    backgroundColor: farger.deaktivert,
    borderColor: farger.deaktivert,
  },
  trykket: {
    opacity: 0.85,
  },
  tekst: {
    fontFamily: fonter.fet,
    fontSize: 16,
  },
  tekstLys: {
    color: farger.hvit,
  },
  tekstSekundaer: {
    color: farger.tekst,
  },
}));
