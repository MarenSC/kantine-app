import { memo } from 'react';
import { Text, View } from 'react-native';

import { useInnstillinger } from '../context/InnstillingerContext';
import { avstand, farger, fonter, lagStiler, radius, skygge } from '../theme';
import { LeggTilKnapp } from './LeggTilKnapp';
import { Merkelapp } from './Merkelapp';
import { Pris } from './Pris';
import { VareBilde } from './VareBilde';
import { lagerstatus, type VareKortProps } from './VareKort';

/** Kompakt kort for drikke og snacks, vist to og to i et rutenett. */
function ProduktKortKomponent({ vare, prisinfo, antallIKurv, onLeggTil, advarsel, kanBestilles = true }: VareKortProps) {
  const { t } = useInnstillinger(); // memo-komponent: må lytte selv for å bytte språk/tema
  const { utsolgt, kanLeggeTil } = lagerstatus(vare, antallIKurv);

  return (
    <View style={[styles.kort, utsolgt && styles.utsolgt]}>
      <VareBilde bilde={vare.bilde} tilpasning="contain" style={styles.bilde} />
      <Text style={styles.navn} numberOfLines={2}>
        {t(vare.navn)}
      </Text>
      <Text style={styles.beskrivelse} numberOfLines={1}>
        {t(vare.beskrivelse)}
      </Text>
      {advarsel ? <Merkelapp tekst={advarsel} variant="dato" /> : null}
      <View style={styles.bunn}>
        <Pris prisinfo={prisinfo} enhet={vare.enhet} />
        <LeggTilKnapp
          navn={t(vare.navn)}
          antallIKurv={antallIKurv}
          aktiv={kanLeggeTil && kanBestilles}
          onPress={() => onLeggTil(vare)}
        />
      </View>
    </View>
  );
}

export const ProduktKort = memo(ProduktKortKomponent);

const styles = lagStiler(() => ({
  kort: {
    flex: 1,
    gap: avstand.xs + 2,
    padding: avstand.s + 2,
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
  },
  utsolgt: {
    opacity: 0.55,
  },
  bilde: {
    height: 110,
  },
  navn: {
    fontFamily: fonter.fet,
    fontSize: 14,
    color: farger.tekst,
  },
  beskrivelse: {
    fontFamily: fonter.vanlig,
    fontSize: 12,
    color: farger.tekstDempet,
  },
  bunn: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));
