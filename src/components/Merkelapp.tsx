import { StyleSheet, Text, View } from 'react-native';

import { farger, fonter, radius } from '../theme';

/**
 * tilbud = sand/terrakotta, dato = rav (datorabatt, allergier),
 * suksess = salvie (åpent, klar), info = sand, mork = mørk med hvit tekst (på bilder)
 */
type Variant = 'tilbud' | 'dato' | 'info' | 'suksess' | 'mork';

const fargevalg: Record<Variant, { bakgrunn: string; tekst: string }> = {
  tilbud: { bakgrunn: farger.primaerLys, tekst: farger.primaerMork },
  dato: { bakgrunn: farger.datoLys, tekst: farger.dato },
  info: { bakgrunn: farger.primaerLys, tekst: farger.primaerMork },
  suksess: { bakgrunn: farger.suksessLys, tekst: farger.suksess },
  mork: { bakgrunn: farger.morkFlate, tekst: farger.hvit },
};

interface Props {
  tekst: string;
  variant?: Variant;
}

/** Liten farget lapp, f.eks. "Studenttilbud" eller "Åpent". */
export function Merkelapp({ tekst, variant = 'info' }: Props) {
  const { bakgrunn, tekst: tekstfarge } = fargevalg[variant];
  return (
    <View style={[styles.lapp, { backgroundColor: bakgrunn }]}>
      <Text style={[styles.tekst, { color: tekstfarge }]}>{tekst}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lapp: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.rund,
  },
  tekst: {
    fontFamily: fonter.fet,
    fontSize: 12,
  },
});
