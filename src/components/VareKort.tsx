import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { avstand, farger, radius } from '../theme';
import type { Vare } from '../types';
import type { Prisinfo } from '../utils/pris';
import { Merkelapp } from './Merkelapp';
import { Pris } from './Pris';

interface Props {
  vare: Vare;
  prisinfo: Prisinfo;
  antallIKurv: number;
  onLeggTil: (vare: Vare) => void;
}

/** Ett produkt på menyen, med pris, rabatt og "legg til"-knapp. */
function VareKortKomponent({ vare, prisinfo, antallIKurv, onLeggTil }: Props) {
  const utsolgt = vare.antallIgjen === 0;
  const kanLeggeTil = !utsolgt && antallIKurv < vare.antallIgjen;
  const faaIgjen = !utsolgt && vare.antallIgjen <= 5;

  return (
    <View style={[styles.kort, utsolgt && styles.utsolgt]}>
      <View style={styles.innhold}>
        {prisinfo.etikett ? (
          <Merkelapp
            tekst={prisinfo.etikett}
            variant={prisinfo.grunn === 'dato' ? 'dato' : 'tilbud'}
          />
        ) : null}

        <View style={styles.navnRad}>
          <Text style={styles.navn}>{vare.navn}</Text>
          {vare.vegetar && (
            <Ionicons name="leaf" size={14} color={farger.suksess} accessibilityLabel="Vegetar" />
          )}
        </View>

        <Text style={styles.beskrivelse}>{vare.beskrivelse}</Text>

        {vare.allergener.length > 0 && (
          <Text style={styles.allergener}>Allergener: {vare.allergener.join(', ')}</Text>
        )}

        {utsolgt && <Text style={styles.lager}>Utsolgt</Text>}
        {faaIgjen && <Text style={styles.lager}>Kun {vare.antallIgjen} igjen</Text>}
      </View>

      <View style={styles.hoyre}>
        <Pris prisinfo={prisinfo} />
        <Pressable
          onPress={() => onLeggTil(vare)}
          disabled={!kanLeggeTil}
          accessibilityRole="button"
          accessibilityLabel={`Legg ${vare.navn} i handlekurven`}
          style={({ pressed }) => [
            styles.leggTil,
            !kanLeggeTil && styles.leggTilDeaktivert,
            pressed && { opacity: 0.8 },
          ]}
          hitSlop={6}
        >
          {antallIKurv > 0 ? (
            <Text style={styles.antall}>{antallIKurv}</Text>
          ) : (
            <Ionicons name="add" size={22} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

/** memo gjør at kortet bare tegnes på nytt når dataene endrer seg. */
export const VareKort = memo(VareKortKomponent);

const styles = StyleSheet.create({
  kort: {
    flexDirection: 'row',
    gap: avstand.m,
    padding: avstand.l,
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: farger.kant,
  },
  utsolgt: {
    opacity: 0.55,
  },
  innhold: {
    flex: 1,
    gap: avstand.xs,
  },
  navnRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.xs,
  },
  navn: {
    fontSize: 16,
    fontWeight: '600',
    color: farger.tekst,
    flexShrink: 1,
  },
  beskrivelse: {
    fontSize: 14,
    color: farger.tekstDempet,
  },
  allergener: {
    fontSize: 12,
    color: farger.tekstDempet,
    fontStyle: 'italic',
  },
  lager: {
    fontSize: 12,
    fontWeight: '600',
    color: farger.tilbud,
  },
  hoyre: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: avstand.s,
  },
  leggTil: {
    width: 40,
    height: 40,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leggTilDeaktivert: {
    backgroundColor: farger.deaktivert,
  },
  antall: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
