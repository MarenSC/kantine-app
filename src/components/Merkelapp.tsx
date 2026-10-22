import { StyleSheet, Text, View } from 'react-native';

import { farger, radius } from '../theme';

type Variant = 'tilbud' | 'dato' | 'info' | 'suksess';

const fargevalg: Record<Variant, { bakgrunn: string; tekst: string }> = {
  tilbud: { bakgrunn: farger.tilbudLys, tekst: farger.tilbud },
  dato: { bakgrunn: farger.datoLys, tekst: farger.dato },
  info: { bakgrunn: farger.primaerLys, tekst: farger.primaer },
  suksess: { bakgrunn: farger.suksessLys, tekst: farger.suksess },
};

interface Props {
  tekst: string;
  variant?: Variant;
}

/** Liten farget lapp, f.eks. "Ukens tilbud" eller "Åpent nå". */
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.rund,
  },
  tekst: {
    fontSize: 12,
    fontWeight: '600',
  },
});
