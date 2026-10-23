import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { avstand, farger, fonter, radius, skrift } from '../theme';
import type { Vare } from '../types';
import { Knapp } from './Knapp';
import { VareBilde } from './VareBilde';

interface Props {
  /** Varen det skal velges variant for. null = skjult. */
  vare: Vare | null;
  onVelg: (variant: string) => void;
  onLukk: () => void;
}

/** Ark som glir opp nedenfra, der man velger f.eks. smak på te. */
export function VariantVelger({ vare, onVelg, onLukk }: Props) {
  const insets = useSafeAreaInsets();
  const [valgt, setValgt] = useState<string | null>(null);

  // Nullstill valget hver gang arket åpnes for en ny vare
  useEffect(() => {
    setValgt(null);
  }, [vare]);

  const varianter = vare?.varianter ?? [];

  return (
    <Modal visible={vare !== null} transparent animationType="slide" onRequestClose={onLukk}>
      <Pressable style={styles.bakgrunn} onPress={onLukk} accessibilityLabel="Lukk" />
      <View style={[styles.ark, { paddingBottom: Math.max(insets.bottom, avstand.l) }]}>
        <View style={styles.handtak} />
        {vare ? (
          <>
            <View style={styles.topp}>
              <VareBilde bilde={vare.bilde} tilpasning="contain" style={styles.bilde} />
              <View style={styles.flex}>
                <Text style={skrift.overskrift}>{vare.navn}</Text>
                <Text style={skrift.liten}>{vare.variantTittel ?? 'Velg variant'}</Text>
              </View>
            </View>

            <View style={styles.valg} accessibilityRole="radiogroup">
              {varianter.map((v) => {
                const erValgt = valgt === v;
                return (
                  <Pressable
                    key={v}
                    onPress={() => setValgt(v)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: erValgt }}
                    style={[styles.rad, erValgt && styles.radValgt]}
                  >
                    <Text style={[styles.radTekst, erValgt && styles.radTekstValgt]}>{v}</Text>
                    <Ionicons
                      name={erValgt ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={erValgt ? farger.primaer : farger.tekstDempet}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Knapp
              tittel={valgt ? `Legg til ${valgt}` : 'Velg et alternativ'}
              deaktivert={!valgt}
              onPress={() => valgt && onVelg(valgt)}
            />
            <Knapp tittel="Avbryt" variant="sekundaer" onPress={onLukk} />
          </>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bakgrunn: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  ark: {
    gap: avstand.m,
    paddingTop: avstand.s,
    paddingHorizontal: avstand.l + 4,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: farger.bakgrunn,
  },
  handtak: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radius.rund,
    backgroundColor: farger.kant,
    marginBottom: avstand.s,
  },
  topp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
  },
  bilde: {
    width: 56,
    height: 56,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  valg: {
    gap: avstand.s,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: avstand.l,
    borderRadius: radius.l,
    backgroundColor: farger.kort,
    borderWidth: 1,
    borderColor: farger.kant,
  },
  radValgt: {
    borderColor: farger.primaer,
    backgroundColor: farger.primaerLys,
  },
  radTekst: {
    fontFamily: fonter.medium,
    fontSize: 16,
    color: farger.tekst,
  },
  radTekstValgt: {
    fontFamily: fonter.fet,
    color: farger.primaerMork,
  },
});
