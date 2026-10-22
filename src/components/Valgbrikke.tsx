import { Pressable, StyleSheet, Text } from 'react-native';

import { avstand, farger, radius } from '../theme';

interface Props {
  tekst: string;
  valgt: boolean;
  onPress: () => void;
}

/** Klikkbar "chip" for filtre og valg, f.eks. kategori eller hentetid. */
export function Valgbrikke({ tekst, valgt, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: valgt }}
      style={[styles.brikke, valgt && styles.valgt]}
    >
      <Text style={[styles.tekst, valgt && styles.tekstValgt]}>{tekst}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brikke: {
    paddingHorizontal: avstand.m,
    paddingVertical: avstand.s,
    borderRadius: radius.rund,
    borderWidth: 1,
    borderColor: farger.kant,
    backgroundColor: farger.kort,
  },
  valgt: {
    backgroundColor: farger.primaer,
    borderColor: farger.primaer,
  },
  tekst: {
    fontSize: 14,
    fontWeight: '500',
    color: farger.tekst,
  },
  tekstValgt: {
    color: '#FFFFFF',
  },
});
