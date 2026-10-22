import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { avstand, farger, fonter, radius, skygge } from '../theme';
import type { Vare } from '../types';
import type { Prisinfo } from '../utils/pris';
import { LeggTilKnapp } from './LeggTilKnapp';
import { Merkelapp } from './Merkelapp';
import { Pris } from './Pris';
import { VareBilde } from './VareBilde';

export interface VareKortProps {
  vare: Vare;
  prisinfo: Prisinfo;
  antallIKurv: number;
  onLeggTil: (vare: Vare) => void;
  /** Vises hvis varen ikke passer studentens kosthold, f.eks. "Inneholder gluten" */
  advarsel?: string | null;
  /** false når man ser på menyen for en annen dag enn i dag */
  kanBestilles?: boolean;
}

/** Info om utsolgt/få igjen, brukt av både VareKort og ProduktKort. */
export function lagerstatus(vare: Vare, antallIKurv: number) {
  const utsolgt = vare.antallIgjen === 0;
  return {
    utsolgt,
    kanLeggeTil: !utsolgt && antallIKurv < vare.antallIgjen,
    faaIgjen: !utsolgt && vare.antallIgjen <= 5,
  };
}

/** Én rett på menyen: bilde til venstre, tekst i midten, "+" til høyre. */
function VareKortKomponent({ vare, prisinfo, antallIKurv, onLeggTil, advarsel, kanBestilles = true }: VareKortProps) {
  const { utsolgt, kanLeggeTil, faaIgjen } = lagerstatus(vare, antallIKurv);
  const rabattProsent =
    prisinfo.grunn === 'dato' ? Math.round((1 - prisinfo.pris / prisinfo.ordinaerPris) * 100) : null;
  const datoTekst =
    prisinfo.grunn === 'dato'
      ? prisinfo.etikett?.includes('i dag')
        ? 'Siste salgsdag i dag'
        : 'Siste salgsdag i morgen'
      : null;

  return (
    <View style={[styles.kort, utsolgt && styles.utsolgt]}>
      <VareBilde bilde={vare.bilde} style={styles.bilde}>
        {rabattProsent ? (
          <View style={styles.bildeMerke}>
            <Merkelapp tekst={`−${rabattProsent} %`} variant="mork" />
          </View>
        ) : null}
      </VareBilde>

      <View style={styles.innhold}>
        {prisinfo.grunn === 'tilbud' && prisinfo.etikett ? <Merkelapp tekst={prisinfo.etikett} variant="tilbud" /> : null}
        <Text style={styles.navn}>{vare.navn}</Text>
        <Text style={styles.beskrivelse} numberOfLines={2}>
          {datoTekst ?? vare.beskrivelse}
        </Text>
        {advarsel ? <Merkelapp tekst={advarsel} variant="dato" /> : null}
        {utsolgt ? <Text style={styles.lager}>Utsolgt</Text> : null}
        {faaIgjen ? <Text style={styles.lager}>Kun {vare.antallIgjen} igjen</Text> : null}
        <Pris prisinfo={prisinfo} />
      </View>

      <LeggTilKnapp
        navn={vare.navn}
        antallIKurv={antallIKurv}
        aktiv={kanLeggeTil && kanBestilles}
        onPress={() => onLeggTil(vare)}
      />
    </View>
  );
}

export const VareKort = memo(VareKortKomponent);

const styles = StyleSheet.create({
  kort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m + 2,
    padding: avstand.s + 2,
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
  },
  utsolgt: {
    opacity: 0.55,
  },
  bilde: {
    width: 84,
    height: 84,
  },
  bildeMerke: {
    position: 'absolute',
    left: 6,
    top: 6,
  },
  innhold: {
    flex: 1,
    gap: 3,
  },
  navn: {
    fontFamily: fonter.fet,
    fontSize: 16,
    color: farger.tekst,
  },
  beskrivelse: {
    fontFamily: fonter.vanlig,
    fontSize: 13,
    color: farger.tekstDempet,
  },
  lager: {
    fontFamily: fonter.fet,
    fontSize: 12,
    color: farger.primaerMork,
  },
});
