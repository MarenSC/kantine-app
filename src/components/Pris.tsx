import { StyleSheet, Text, View } from 'react-native';

import { avstand, farger, fonter } from '../theme';
import { formaterPris, type Prisinfo } from '../utils/pris';

interface Props {
  prisinfo: Prisinfo;
}

/** Viser prisen, og gjennomstreket ordinærpris hvis varen er rabattert. */
export function Pris({ prisinfo }: Props) {
  const rabattert = prisinfo.grunn !== null;

  return (
    <View style={styles.rad}>
      <Text style={styles.pris}>{formaterPris(prisinfo.pris)}</Text>
      {rabattert && (
        <Text style={styles.ordinaer} accessibilityLabel={`Før ${formaterPris(prisinfo.ordinaerPris)}`}>
          {formaterPris(prisinfo.ordinaerPris)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rad: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: avstand.s - 2,
  },
  pris: {
    fontFamily: fonter.tittel,
    fontSize: 16,
    color: farger.tekst,
  },
  ordinaer: {
    fontFamily: fonter.vanlig,
    fontSize: 13,
    color: farger.tekstDempet,
    textDecorationLine: 'line-through',
  },
});
