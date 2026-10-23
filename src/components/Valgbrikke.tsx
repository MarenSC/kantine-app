import { Pressable, Text } from 'react-native';

import { avstand, farger, fonter, lagStiler, radius } from '../theme';

interface Props {
  tekst: string;
  valgt: boolean;
  onPress: () => void;
}

/** Klikkbar "chip" for filtre og valg. Valgt = lys sand med mørk terrakotta-tekst. */
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

const styles = lagStiler(() => ({
  brikke: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: avstand.l,
    borderRadius: radius.rund,
    borderWidth: 1,
    borderColor: farger.kant,
  },
  valgt: {
    backgroundColor: farger.primaerLys,
    borderColor: farger.primaerLys,
  },
  tekst: {
    fontFamily: fonter.medium,
    fontSize: 14,
    color: farger.tekst,
  },
  tekstValgt: {
    fontFamily: fonter.fet,
    color: farger.primaerMork,
  },
}));
