import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAKS_BREDDE, avstand, farger, fonter, lagStiler, radius, skrift } from '../theme';
import { t } from '../i18n';
import type { Komponent, Vare } from '../types';
import { formaterPris, prisForVekt } from '../utils/pris';
import { Knapp } from './Knapp';
import { VareBilde } from './VareBilde';

/** Hvor mye én trykk på + / − endrer vekten */
const STEG_GRAM = 50;
/** Mest man kan ta av én rett */
const MAKS_GRAM = 400;

interface Props {
  /** Varmdisken. null = skjult. */
  vare: Vare | null;
  onLeggTil: (komponenter: Komponent[]) => void;
  onLukk: () => void;
}

/**
 * Sett sammen din egen tallerken fra varmdisken:
 * velg retter og hvor mange gram av hver. Prisen regnes per hekto.
 */
export function VarmdiskVelger({ vare, onLeggTil, onLukk }: Props) {
  const insets = useSafeAreaInsets();
  const [gram, setGram] = useState<Record<string, number>>({});

  // Start med tom tallerken hver gang den åpnes
  useEffect(() => {
    setGram({});
  }, [vare]);

  const valg = vare?.komponentvalg ?? [];
  const total = Object.values(gram).reduce((sum, g) => sum + g, 0);
  const pris = vare ? prisForVekt(vare.pris, total) : 0;

  function endre(navn: string, endring: number) {
    setGram((g) => ({ ...g, [navn]: Math.max(0, Math.min(MAKS_GRAM, (g[navn] ?? 0) + endring)) }));
  }

  function leggTil() {
    const komponenter = valg
      .filter((v) => (gram[v.navn] ?? 0) > 0)
      .map((v) => ({ navn: v.navn, gram: gram[v.navn] }));
    onLeggTil(komponenter);
  }

  return (
    <Modal visible={vare !== null} transparent animationType="slide" onRequestClose={onLukk}>
      <Pressable style={styles.bakgrunn} onPress={onLukk} accessibilityLabel={t('Lukk')} />
      <View style={[styles.ark, { paddingBottom: Math.max(insets.bottom, avstand.l) }]}>
        <View style={styles.handtak} />
        {vare ? (
          <>
            <View style={styles.topp}>
              <VareBilde bilde={vare.bilde} style={styles.bilde} />
              <View style={styles.flex}>
                <Text style={skrift.overskrift}>{t('Sett sammen tallerkenen')}</Text>
                <Text style={skrift.liten}>{t('{pris} per hekto (100 g)', { pris: formaterPris(vare.pris) })}</Text>
              </View>
            </View>

            <View style={styles.notis}>
              <Ionicons name="storefront-outline" size={18} color={farger.dato} />
              <Text style={styles.notisTekst}>
                {t('Dette er et utvalg. Besøker du kantina, finner du enda flere retter i varmdisken.')}
              </Text>
            </View>

            <ScrollView style={styles.liste} contentContainerStyle={styles.listeInnhold}>
              {valg.map((v) => {
                const g = gram[v.navn] ?? 0;
                return (
                  <View key={v.navn} style={[styles.rad, g > 0 && styles.radValgt]}>
                    <View style={styles.flex}>
                      <View style={styles.navnRad}>
                        <Text style={styles.navn}>{t(v.navn)}</Text>
                        {v.vegetar ? (
                          <Ionicons name="leaf" size={14} color={farger.suksess} accessibilityLabel={t('Vegetar')} />
                        ) : null}
                      </View>
                      <Text style={skrift.liten}>{g > 0 ? `${g} g · ${formaterPris(prisForVekt(vare.pris, g))}` : t('Ikke valgt')}</Text>
                    </View>
                    <Pressable
                      onPress={() => endre(v.navn, -STEG_GRAM)}
                      disabled={g === 0}
                      accessibilityRole="button"
                      accessibilityLabel={t('Mindre {navn}', { navn: t(v.navn) })}
                      style={[styles.knapp, g === 0 && styles.knappAv]}
                      hitSlop={6}
                    >
                      <Ionicons name="remove" size={18} color={g === 0 ? farger.tekstDempet : farger.primaerMork} />
                    </Pressable>
                    <Text style={styles.gram} accessibilityLabel={`${g} g ${t(v.navn)}`}>
                      {g} g
                    </Text>
                    <Pressable
                      onPress={() => endre(v.navn, STEG_GRAM)}
                      disabled={g >= MAKS_GRAM}
                      accessibilityRole="button"
                      accessibilityLabel={t('Mer {navn}', { navn: t(v.navn) })}
                      style={[styles.knapp, g >= MAKS_GRAM && styles.knappAv]}
                      hitSlop={6}
                    >
                      <Ionicons name="add" size={18} color={g >= MAKS_GRAM ? farger.tekstDempet : farger.primaerMork} />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.sum}>
              <Text style={skrift.fet}>{t('Totalt')} {total} g</Text>
              <Text style={styles.sumPris}>{formaterPris(pris)}</Text>
            </View>
            <Knapp
              tittel={total > 0 ? `${t('Legg til tallerken')} · ${formaterPris(pris)}` : t('Velg minst én rett')}
              deaktivert={total === 0}
              onPress={leggTil}
            />
            <Knapp tittel={t('Avbryt')} variant="sekundaer" onPress={onLukk} />
          </>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = lagStiler(() => ({
  bakgrunn: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  ark: {
    width: '100%',
    maxWidth: MAKS_BREDDE,
    alignSelf: 'center',
    maxHeight: '90%',
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
  notis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
    padding: avstand.m,
    borderRadius: radius.m,
    backgroundColor: farger.datoLys,
  },
  notisTekst: {
    flex: 1,
    fontFamily: fonter.medium,
    fontSize: 13,
    color: farger.dato,
  },
  liste: {
    flexGrow: 0,
  },
  listeInnhold: {
    gap: avstand.s,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
    minHeight: 56,
    paddingHorizontal: avstand.m,
    paddingVertical: avstand.s,
    borderRadius: radius.l,
    backgroundColor: farger.kort,
    borderWidth: 1,
    borderColor: farger.kant,
  },
  radValgt: {
    borderColor: farger.primaer,
  },
  navnRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.xs,
  },
  navn: {
    fontFamily: fonter.fet,
    fontSize: 15,
    color: farger.tekst,
  },
  knapp: {
    width: 34,
    height: 34,
    borderRadius: radius.rund,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knappAv: {
    backgroundColor: farger.kant,
  },
  gram: {
    minWidth: 48,
    textAlign: 'center',
    fontFamily: fonter.fet,
    fontSize: 15,
    color: farger.tekst,
  },
  sum: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sumPris: {
    fontFamily: fonter.tittel,
    fontSize: 20,
    color: farger.tekst,
  },
}));
