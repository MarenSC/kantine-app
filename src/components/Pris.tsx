import { StyleSheet, Text, View } from 'react-native';

import { farger } from '../theme';
import { formaterPris, type Prisinfo } from '../utils/pris';

interface Props {
  prisinfo: Prisinfo;
}

/** Viser prisen, og gjennomstreket ordinærpris hvis varen er rabattert. */
export function Pris({ prisinfo }: Props) {
  const rabattert = prisinfo.grunn !== null;
  const farge = prisinfo.grunn === 'dato' ? farger.dato : farger.tilbud;

  return (
    <View style={styles.kolonne}>
      <Text style={[styles.pris, rabattert && { color: farge }]}>{formaterPris(prisinfo.pris)}</Text>
      {rabattert && (
        <Text style={styles.ordinaer} accessibilityLabel={`Før ${formaterPris(prisinfo.ordinaerPris)}`}>
          {formaterPris(prisinfo.ordinaerPris)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kolonne: {
    alignItems: 'flex-end',
  },
  pris: {
    fontSize: 16,
    fontWeight: '700',
    color: farger.tekst,
  },
  ordinaer: {
    fontSize: 13,
    color: farger.tekstDempet,
    textDecorationLine: 'line-through',
  },
});
