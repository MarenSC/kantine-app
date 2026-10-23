import { Image, Text, View } from 'react-native';

import { t } from '../i18n';
import { avstand, farger, fonter, lagStiler } from '../theme';

/** "Drives av SiO Mat og drikke" med SiO-logoen (brukt som illustrasjon i en studentprototype). */
export function SioMerke({ midtstilt = false }: { midtstilt?: boolean }) {
  return (
    <View style={[styles.rad, midtstilt && styles.midtstilt]}>
      <Text style={styles.tekst}>{t('Drives av')}</Text>
      <Image
        source={require('../../assets/images/sio-logo.png')}
        style={styles.logo}
        accessibilityLabel="SiO"
      />
      <Text style={[styles.tekst, styles.fet]}>{t('SiO Mat og drikke')}</Text>
    </View>
  );
}

const styles = lagStiler(() => ({
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s - 2,
  },
  midtstilt: {
    justifyContent: 'center',
  },
  logo: {
    width: 22,
    height: 22,
  },
  tekst: {
    fontFamily: fonter.vanlig,
    fontSize: 13,
    color: farger.tekstDempet,
  },
  fet: {
    fontFamily: fonter.fet,
    color: farger.tekst,
  },
}));
