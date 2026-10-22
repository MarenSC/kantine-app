import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Merkelapp } from '../../src/components/Merkelapp';
import { TomTilstand } from '../../src/components/TomTilstand';
import { Valgbrikke } from '../../src/components/Valgbrikke';
import { VareKort } from '../../src/components/VareKort';
import { useBestilling } from '../../src/context/BestillingContext';
import { hentBygg, hentKantine } from '../../src/data/kantiner';
import { kategoriRekkefolge, kategorinavn, varerIKantine } from '../../src/data/varer';
import { avstand, farger, radius, skrift } from '../../src/theme';
import type { Kategori, Vare } from '../../src/types';
import { erAapen } from '../../src/utils/dato';
import { beregnPris, erUtgaatt, formaterPris, type Prisinfo } from '../../src/utils/pris';

type Filter = 'alle' | 'rabatt' | Kategori;

interface VareMedPris {
  vare: Vare;
  prisinfo: Prisinfo;
}

/** Menyen til én kantine. */
export default function KantineSkjerm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const kantine = hentKantine(id);
  const insets = useSafeAreaInsets();
  const { kurvKantineId, antallIKurv, totalpris, antallAvVare, leggTil } = useBestilling();
  const [filter, setFilter] = useState<Filter>('alle');

  // Regn ut pris én gang per vare, og skjul varer som er gått ut på dato.
  const alleVarer = useMemo<VareMedPris[]>(
    () =>
      varerIKantine(id)
        .filter((vare) => !erUtgaatt(vare))
        .map((vare) => ({ vare, prisinfo: beregnPris(vare) })),
    [id],
  );

  const antallRabatterte = alleVarer.filter((v) => v.prisinfo.grunn !== null).length;
  const kategorierIMeny = kategoriRekkefolge.filter((k) => alleVarer.some((v) => v.vare.kategori === k));

  const seksjoner = useMemo(() => {
    const filtrert = alleVarer.filter(({ vare, prisinfo }) => {
      if (filter === 'alle') return true;
      if (filter === 'rabatt') return prisinfo.grunn !== null;
      return vare.kategori === filter;
    });

    return kategoriRekkefolge
      .map((kategori) => ({
        tittel: kategorinavn[kategori],
        data: filtrert.filter((v) => v.vare.kategori === kategori),
      }))
      .filter((seksjon) => seksjon.data.length > 0);
  }, [alleVarer, filter]);

  const kurvErHer = kurvKantineId === id && antallIKurv > 0;

  const haandterLeggTil = useCallback(
    (vare: Vare) => {
      const annenKantine = kurvKantineId !== null && kurvKantineId !== vare.kantineId;
      if (!annenKantine) {
        leggTil(vare);
        return;
      }
      const navn = hentKantine(kurvKantineId)?.navn ?? 'en annen kantine';
      Alert.alert(
        'Starte ny handlekurv?',
        `Du har varer fra ${navn} i handlekurven. Du kan bare bestille fra én kantine om gangen.`,
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Tøm og legg til', style: 'destructive', onPress: () => leggTil(vare) },
        ],
      );
    },
    [kurvKantineId, leggTil],
  );

  if (!kantine) {
    return <TomTilstand ikon="alert-circle-outline" tittel="Fant ikke kantina" />;
  }

  const bygg = hentBygg(kantine.byggId);
  const aapen = erAapen(kantine.aapner, kantine.stenger);

  return (
    <View style={styles.skjerm}>
      <Stack.Screen options={{ title: kantine.navn }} />

      <SectionList
        sections={seksjoner}
        keyExtractor={(item) => item.vare.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.liste, { paddingBottom: kurvErHer ? 110 : avstand.xl }]}
        ListHeaderComponent={
          <View style={styles.topp}>
            <Text style={skrift.liten}>
              {bygg?.navn} · {kantine.plassering}
            </Text>
            <View style={styles.merkelapper}>
              <Merkelapp
                tekst={aapen ? `Åpent til ${kantine.stenger}` : `Stengt · åpner ${kantine.aapner}`}
                variant={aapen ? 'suksess' : 'tilbud'}
              />
              {kantine.leveringTilBord && <Merkelapp tekst="Levering til bord" />}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtre}
            >
              <Valgbrikke tekst="Alle" valgt={filter === 'alle'} onPress={() => setFilter('alle')} />
              {antallRabatterte > 0 && (
                <Valgbrikke
                  tekst={`Tilbud og rabatt (${antallRabatterte})`}
                  valgt={filter === 'rabatt'}
                  onPress={() => setFilter('rabatt')}
                />
              )}
              {kategorierIMeny.map((k) => (
                <Valgbrikke
                  key={k}
                  tekst={kategorinavn[k]}
                  valgt={filter === k}
                  onPress={() => setFilter(k)}
                />
              ))}
            </ScrollView>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.seksjonTittel}>{section.tittel}</Text>
        )}
        renderItem={({ item }) => (
          <VareKort
            vare={item.vare}
            prisinfo={item.prisinfo}
            antallIKurv={kurvKantineId === id ? antallAvVare(item.vare.id) : 0}
            onLeggTil={haandterLeggTil}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: avstand.m }} />}
        ListEmptyComponent={
          <TomTilstand ikon="restaurant-outline" tittel="Ingen varer her akkurat nå" />
        }
      />

      {kurvErHer && (
        <View style={[styles.kurvBar, { paddingBottom: Math.max(insets.bottom, avstand.l) }]}>
          <Pressable
            onPress={() => router.push('/handlekurv')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.kurvKnapp, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.kurvAntall}>
              <Text style={styles.kurvAntallTekst}>{antallIKurv}</Text>
            </View>
            <Text style={styles.kurvTekst}>Gå til handlekurv</Text>
            <Text style={styles.kurvPris}>{formaterPris(totalpris)}</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skjerm: {
    flex: 1,
  },
  liste: {
    padding: avstand.l,
  },
  topp: {
    gap: avstand.s,
  },
  merkelapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: avstand.s,
  },
  filtre: {
    gap: avstand.s,
    paddingVertical: avstand.m,
  },
  seksjonTittel: {
    ...skrift.overskrift,
    marginTop: avstand.l,
    marginBottom: avstand.m,
  },
  kurvBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: avstand.l,
    paddingTop: avstand.m,
    backgroundColor: farger.bakgrunn,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: farger.kant,
  },
  kurvKnapp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    minHeight: 54,
    paddingHorizontal: avstand.l,
    borderRadius: radius.m,
    backgroundColor: farger.primaer,
  },
  kurvAntall: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: radius.rund,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kurvAntallTekst: {
    color: farger.primaer,
    fontWeight: '700',
  },
  kurvTekst: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  kurvPris: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
