import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Merkelapp } from '../../src/components/Merkelapp';
import { ProduktKort } from '../../src/components/ProduktKort';
import { SioMerke } from '../../src/components/SioMerke';
import { TomTilstand } from '../../src/components/TomTilstand';
import { Valgbrikke } from '../../src/components/Valgbrikke';
import { VareBilde } from '../../src/components/VareBilde';
import { VareKort } from '../../src/components/VareKort';
import { useBestilling } from '../../src/context/BestillingContext';
import { useBruker } from '../../src/context/BrukerContext';
import { hentBygg, hentKantine } from '../../src/data/kantiner';
import { varerIKantine } from '../../src/data/varer';
import { avstand, farger, fonter, radius, skrift } from '../../src/theme';
import type { Kategori, Vare } from '../../src/types';
import { erAapen } from '../../src/utils/dato';
import { harKostholdsvalg, kostholdsadvarsel } from '../../src/utils/kosthold';
import { beregnPris, erUtgaatt, formaterPris, type Prisinfo } from '../../src/utils/pris';

interface VareMedPris {
  vare: Vare;
  prisinfo: Prisinfo;
  advarsel: string | null;
}

/** Menyen er delt i grupper. "Redd maten" samler varer med datorabatt. */
type GruppeId = 'lunsj' | 'redd' | 'bakevarer' | 'snacks';

const grupper: { id: GruppeId; tittel: string; kategorier: Kategori[]; rutenett?: boolean }[] = [
  { id: 'lunsj', tittel: 'Lunsj', kategorier: ['varmmat', 'smorbrod', 'salat'] },
  { id: 'redd', tittel: 'Redd maten', kategorier: [] },
  { id: 'bakevarer', tittel: 'Bakevarer', kategorier: ['bakevarer'] },
  { id: 'snacks', tittel: 'Drikke og snacks', kategorier: ['drikke', 'snacks'], rutenett: true },
];

function gruppeFor({ vare, prisinfo }: VareMedPris): GruppeId {
  if (prisinfo.grunn === 'dato') return 'redd';
  return grupper.find((g) => g.kategorier.includes(vare.kategori))?.id ?? 'lunsj';
}

type Filter = 'alle' | 'passer' | 'tilbud' | GruppeId;

/** En rad i listen: enten ett vanlig kort, eller to produktkort side om side. */
type Rad = { type: 'enkel'; v: VareMedPris } | { type: 'par'; a: VareMedPris; b?: VareMedPris };

/** Menyen til én kantine. */
export default function KantineSkjerm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const kantine = hentKantine(id);
  const insets = useSafeAreaInsets();
  const { kurvKantineId, antallIKurv, totalpris, antallAvVare, leggTil } = useBestilling();
  const { preferanser, settFavoritt } = useBruker();
  const [filter, setFilter] = useState<Filter>('alle');

  // Regn ut pris og kostholdsadvarsel én gang per vare, og skjul utgåtte varer.
  const alleVarer = useMemo<VareMedPris[]>(
    () =>
      varerIKantine(id)
        .filter((vare) => !erUtgaatt(vare))
        .map((vare) => ({
          vare,
          prisinfo: beregnPris(vare),
          advarsel: kostholdsadvarsel(vare, preferanser),
        })),
    [id, preferanser],
  );

  const antallTilbud = alleVarer.filter((v) => v.prisinfo.grunn !== null).length;
  const grupperIMeny = grupper.filter((g) => alleVarer.some((v) => gruppeFor(v) === g.id));
  const visPasserFilter = harKostholdsvalg(preferanser);
  const erFavoritt = preferanser.favorittKantineId === id;

  const seksjoner = useMemo(() => {
    const filtrert = alleVarer.filter((v) => {
      if (filter === 'alle') return true;
      if (filter === 'passer') return v.advarsel === null;
      if (filter === 'tilbud') return v.prisinfo.grunn !== null;
      return gruppeFor(v) === filter;
    });

    return grupper
      .map((g) => {
        const iGruppe = filtrert.filter((v) => gruppeFor(v) === g.id);
        const data: Rad[] = g.rutenett
          ? Array.from({ length: Math.ceil(iGruppe.length / 2) }, (_, i) => ({
              type: 'par' as const,
              a: iGruppe[i * 2],
              b: iGruppe[i * 2 + 1],
            }))
          : iGruppe.map((v) => ({ type: 'enkel' as const, v }));
        return { tittel: g.tittel, data };
      })
      .filter((s) => s.data.length > 0);
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

  const kortProps = (v: VareMedPris) => ({
    vare: v.vare,
    prisinfo: v.prisinfo,
    advarsel: v.advarsel,
    antallIKurv: kurvKantineId === id ? antallAvVare(v.vare.id) : 0,
    onLeggTil: haandterLeggTil,
  });

  return (
    <View style={styles.skjerm}>
      <SectionList
        sections={seksjoner}
        keyExtractor={(rad) => (rad.type === 'enkel' ? rad.v.vare.id : rad.a.vare.id)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: kurvErHer ? 120 : avstand.xxl }}
        ListHeaderComponent={
          <View>
            <VareBilde bilde={kantine.bilde} style={[styles.toppbilde, { height: 210 + insets.top }]} />
            <View style={[styles.toppknapper, { top: insets.top + avstand.s }]}>
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                accessibilityRole="button"
                accessibilityLabel="Tilbake"
                style={styles.rundKnapp}
              >
                <Ionicons name="chevron-back" size={22} color={farger.tekst} />
              </Pressable>
              <Pressable
                onPress={() => settFavoritt(erFavoritt ? null : kantine.id)}
                accessibilityRole="button"
                accessibilityLabel={erFavoritt ? 'Fjern som favoritt' : 'Sett som favoritt'}
                style={styles.rundKnapp}
              >
                <Ionicons
                  name={erFavoritt ? 'heart' : 'heart-outline'}
                  size={21}
                  color={erFavoritt ? farger.primaer : farger.tekst}
                />
              </Pressable>
            </View>

            <View style={styles.ark}>
              <Text style={skrift.stor}>{kantine.navn}</Text>
              <View style={styles.infoRad}>
                <Merkelapp
                  tekst={aapen ? `Åpent til ${kantine.stenger}` : `Stengt · åpner ${kantine.aapner}`}
                  variant={aapen ? 'suksess' : 'info'}
                />
                <Text style={skrift.liten}>
                  {bygg?.kortnavn} · {kantine.plassering}
                  {kantine.leveringTilBord ? ' · levering til bord' : ''}
                </Text>
              </View>
              <SioMerke />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtre}
                style={styles.filterRad}
              >
                <Valgbrikke tekst="Alle" valgt={filter === 'alle'} onPress={() => setFilter('alle')} />
                {visPasserFilter && (
                  <Valgbrikke tekst="Passer for meg" valgt={filter === 'passer'} onPress={() => setFilter('passer')} />
                )}
                {antallTilbud > 0 && (
                  <Valgbrikke
                    tekst={`Tilbud (${antallTilbud})`}
                    valgt={filter === 'tilbud'}
                    onPress={() => setFilter('tilbud')}
                  />
                )}
                {grupperIMeny
                  .filter((g) => g.id !== 'redd')
                  .map((g) => (
                    <Valgbrikke key={g.id} tekst={g.tittel} valgt={filter === g.id} onPress={() => setFilter(g.id)} />
                  ))}
              </ScrollView>
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => <Text style={styles.seksjonTittel}>{section.tittel}</Text>}
        renderItem={({ item }) =>
          item.type === 'enkel' ? (
            <View style={styles.rad}>
              <VareKort {...kortProps(item.v)} />
            </View>
          ) : (
            <View style={[styles.rad, styles.parRad]}>
              <ProduktKort {...kortProps(item.a)} />
              {item.b ? <ProduktKort {...kortProps(item.b)} /> : <View style={styles.flex} />}
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: avstand.m }} />}
        ListEmptyComponent={<TomTilstand ikon="restaurant-outline" tittel="Ingen varer her akkurat nå" />}
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
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skjerm: {
    flex: 1,
    backgroundColor: farger.bakgrunn,
  },
  toppbilde: {
    borderRadius: 0,
  },
  toppknapper: {
    position: 'absolute',
    left: avstand.l,
    right: avstand.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rundKnapp: {
    width: 44,
    height: 44,
    borderRadius: radius.rund,
    backgroundColor: farger.kort,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ark: {
    marginTop: -24,
    paddingTop: avstand.l + 4,
    paddingHorizontal: avstand.l + 4,
    gap: avstand.s,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: farger.bakgrunn,
  },
  infoRad: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: avstand.s,
  },
  filterRad: {
    marginHorizontal: -(avstand.l + 4),
  },
  filtre: {
    gap: avstand.s,
    paddingVertical: avstand.s,
    paddingHorizontal: avstand.l + 4,
  },
  seksjonTittel: {
    ...skrift.overskrift,
    marginTop: avstand.l,
    marginBottom: avstand.m,
    paddingHorizontal: avstand.l + 4,
  },
  rad: {
    paddingHorizontal: avstand.l + 4,
  },
  parRad: {
    flexDirection: 'row',
    gap: avstand.m,
  },
  flex: {
    flex: 1,
  },
  kurvBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: avstand.l,
    paddingTop: avstand.s,
  },
  kurvKnapp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    minHeight: 58,
    paddingHorizontal: avstand.l + 2,
    borderRadius: radius.l,
    backgroundColor: farger.morkFlate,
    shadowColor: '#33281F',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  kurvAntall: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kurvAntallTekst: {
    color: farger.hvit,
    fontFamily: fonter.fet,
  },
  kurvTekst: {
    flex: 1,
    color: farger.bakgrunn,
    fontFamily: fonter.fet,
    fontSize: 16,
  },
  kurvPris: {
    color: farger.hvit,
    fontFamily: fonter.tittel,
    fontSize: 17,
  },
});
