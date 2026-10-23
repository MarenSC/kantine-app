import { Text, View } from 'react-native';

import { avstand, farger, fonter, lagStiler } from '../theme';
import { t } from '../i18n';
import type { Enhet } from '../types';
import { formaterPris, type Prisinfo } from '../utils/pris';

interface Props {
  prisinfo: Prisinfo;
  /** 'hg' viser "/ hg" etter prisen */
  enhet?: Enhet;
}

/** Viser prisen, og gjennomstreket ordinærpris hvis varen er rabattert. */
export function Pris({ prisinfo, enhet = 'stk' }: Props) {
  const rabattert = prisinfo.grunn !== null;

  return (
    <View style={styles.rad}>
      <Text style={styles.pris}>
        {formaterPris(prisinfo.pris)}
        {enhet === 'hg' ? <Text style={styles.enhet}> / {t('hg')}</Text> : null}
      </Text>
      {rabattert && (
        <Text style={styles.ordinaer} accessibilityLabel={t('Før {pris}', { pris: formaterPris(prisinfo.ordinaerPris) })}>
          {formaterPris(prisinfo.ordinaerPris)}
        </Text>
      )}
    </View>
  );
}

const styles = lagStiler(() => ({
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
  enhet: {
    fontFamily: fonter.medium,
    fontSize: 13,
    color: farger.tekstDempet,
  },
  ordinaer: {
    fontFamily: fonter.vanlig,
    fontSize: 13,
    color: farger.tekstDempet,
    textDecorationLine: 'line-through',
  },
}));
