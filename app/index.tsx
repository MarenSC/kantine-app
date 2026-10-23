import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bunnmeny } from '../src/components/Bunnmeny';
import { Knapp } from '../src/components/Knapp';
import { Merkelapp } from '../src/components/Merkelapp';
import { Pris } from '../src/components/Pris';
import { ProfilKnapp } from '../src/components/ProfilKnapp';
import { SioMerke } from '../src/components/SioMerke';
import { Valgbrikke } from '../src/components/Valgbrikke';
import { VareBilde } from '../src/components/VareBilde';
import { useBruker } from '../src/context/BrukerContext';
import { byggPaaCampus, campuser, hentBygg, hentKantine, kantinerIBygg } from '../src/data/kantiner';
import { varer } from '../src/data/varer';
import { avstand, farger, fonter, radius, skrift, skygge } from '../src/theme';
import type { Kantine } from '../src/types';
import { erAapen } from '../src/utils/dato';
import { beregnPris, erUtgaatt } from '../src/utils/pris';

/** Startside: hilsen, dagens "redd maten"-tilbud, favoritt og valg av bygg. */
export default function StartSkjerm() {
  const insets = useSafeAreaInsets();
  const { student, preferanser } = useBruker();
  const favoritt = preferanser.favorittKantineId ? hentKantine(preferanser.favorittKantineId) : undefined;
  const fornavn = student?.navn.split(' ')[0];

  const [campusId, setCampusId] = useState(
    () => (favoritt ? hentBygg(favoritt.byggId)?.campusId : undefined) ?? campuser[0].id,
  );
  const byggListe = byggPaaCampus(campusId);
  const [valgtByggId, setValgtByggId] = useState<string | null>(favoritt?.byggId ?? null);
  const valgtBygg = byggListe.find((b) => b.id === valgtByggId) ?? byggListe[0];

  // Største datorabatt akkurat nå, gjerne fra favorittkantina og helst med bilde.
  // Varsel: antall «Redd maten»-varer i favorittkantina i dag
  const reddIFavoritt = useMemo(
    () =>
      favoritt
        ? varer.filter(
            (v) => v.kantineId === favoritt.id && !erUtgaatt(v) && v.antallIgjen > 0 && beregnPris(v).grunn === 'dato',
          ).length
        : 0,
    [favoritt],
  );
  const visVarsel = preferanser.varselReddMaten && favoritt !== undefined && reddIFavoritt > 0;

  const reddMaten = useMemo(() => {
    const kandidater = varer
      .filter((v) => !erUtgaatt(v) && v.antallIgjen > 0)
      .map((vare) => ({ vare, prisinfo: beregnPris(vare) }))
      .filter((v) => v.prisinfo.grunn === 'dato')
      .sort((a, b) => {
        const poeng = (x: typeof a) =>
          (x.vare.kantineId === favoritt?.id ? 2 : 0) + (x.vare.bilde ? 1 : 0) + (1 - x.prisinfo.pris / x.prisinfo.ordinaerPris);
        return poeng(b) - poeng(a);
      });
    return kandidater[0];
  }, [favoritt?.id]);

  return (
    <View style={styles.skjerm}>
      <ScrollView contentContainerStyle={[styles.innhold, { paddingTop: insets.top + avstand.m }]}>
        <View style={styles.topp}>
          <View style={styles.logo}>
            <Text style={styles.logoTekst}>kantina</Text>
            <View style={styles.logoPrikk} />
          </View>
          <ProfilKnapp />
        </View>

        <View style={styles.hilsen}>
          <Text style={skrift.liten}>{fornavn ? `Hei, ${fornavn}` : 'Hei!'}</Text>
          <Text style={skrift.stor}>Hva frister i dag?</Text>
        </View>

        {visVarsel && favoritt && (
          <Pressable
            onPress={() => router.push({ pathname: '/kantine/[id]', params: { id: favoritt.id } })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.varsel, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="notifications" size={20} color={farger.primaerMork} />
            <Text style={styles.varselTekst}>
              {favoritt.navn} har {reddIFavoritt} {reddIFavoritt === 1 ? 'vare' : 'varer'} på «Redd maten» i dag
            </Text>
            <Ionicons name="chevron-forward" size={18} color={farger.primaerMork} />
          </Pressable>
        )}

        {/* Hovedmotiv */}
        <View style={styles.motivKort}>
          <Image
            source={require('../assets/images/forside-motiv.png')}
            style={styles.motiv}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            accessible={false}
          />
          <View style={styles.motivInnhold}>
            <Text style={skrift.tittel}>Lunsj uten kø</Text>
            <Text style={skrift.liten}>
              Varmdisk, kaffe og alt du trenger. Bestill i appen og hent når det passer deg.
            </Text>
            <Knapp
              tittel={favoritt ? `Se menyen i ${favoritt.navn}` : 'Se menyen'}
              onPress={() =>
                router.push({ pathname: '/kantine/[id]', params: { id: favoritt?.id ?? 'p35-kantine' } })
              }
              style={styles.motivKnapp}
            />
          </View>
        </View>

        {reddMaten && (
          <View style={styles.seksjon}>
            <Text style={skrift.etikett}>Redd maten i dag</Text>
            <Pressable
              onPress={() => router.push({ pathname: '/kantine/[id]', params: { id: reddMaten.vare.kantineId } })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.kantine, pressed && { opacity: 0.85 }]}
            >
              <VareBilde bilde={reddMaten.vare.bilde} style={styles.kantineBilde} />
              <View style={styles.flex}>
                <Text style={skrift.fet}>{reddMaten.vare.navn}</Text>
                <Text style={skrift.liten}>
                  {hentKantine(reddMaten.vare.kantineId)?.navn} ·{' '}
                  {reddMaten.prisinfo.etikett?.includes('i dag') ? 'siste salgsdag i dag' : 'siste salgsdag i morgen'}
                </Text>
                <Pris prisinfo={reddMaten.prisinfo} />
              </View>
              <Merkelapp
                tekst={`−${Math.round((1 - reddMaten.prisinfo.pris / reddMaten.prisinfo.ordinaerPris) * 100)} %`}
                variant="tilbud"
              />
              <Ionicons name="chevron-forward" size={18} color={farger.tekstDempet} />
            </Pressable>
          </View>
        )}

        {favoritt && (
          <View style={styles.seksjon}>
            <Text style={skrift.etikett}>Din favoritt</Text>
            <KantineRad kantine={favoritt} />
          </View>
        )}

        <View style={styles.seksjon}>
          <View style={styles.seksjonTopp}>
            <Text style={skrift.overskrift}>Hvor er du?</Text>
            <View style={styles.brikker}>
              {campuser.map((c) => (
                <Valgbrikke
                  key={c.id}
                  tekst={c.navn.replace('Campus ', '')}
                  valgt={c.id === campusId}
                  onPress={() => {
                    setCampusId(c.id);
                    setValgtByggId(null);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.byggRutenett}>
            {byggListe.map((b) => {
              const valgt = b.id === valgtBygg?.id;
              const antall = kantinerIBygg(b.id).length;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => setValgtByggId(b.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: valgt }}
                  accessibilityLabel={`${b.navn}, ${antall} ${antall === 1 ? 'spisested' : 'spisesteder'}`}
                  style={[styles.byggFlis, valgt && styles.byggFlisValgt]}
                >
                  <Text style={[styles.byggNavn, valgt && { color: farger.primaerMork }]}>{b.kortnavn}</Text>
                  <Text style={[skrift.liten, valgt && { color: farger.primaerMork }]}>
                    {antall} {antall === 1 ? 'sted' : 'steder'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {valgtBygg &&
            kantinerIBygg(valgtBygg.id).map((k) => <KantineRad key={k.id} kantine={k} />)}
        </View>

        <View style={styles.sio}>
          <SioMerke midtstilt />
        </View>
      </ScrollView>

      <Bunnmeny />
    </View>
  );
}

function KantineRad({ kantine }: { kantine: Kantine }) {
  const aapen = erAapen(kantine.aapner, kantine.stenger);
  const bygg = hentBygg(kantine.byggId);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/kantine/[id]', params: { id: kantine.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${kantine.navn}, ${aapen ? 'åpent' : 'stengt'}`}
      style={({ pressed }) => [styles.kantine, pressed && { opacity: 0.85 }]}
    >
      <VareBilde bilde={kantine.bilde} style={styles.kantineBilde} />
      <View style={styles.flex}>
        <Text style={skrift.fet}>{kantine.navn}</Text>
        <Text style={skrift.liten}>
          {bygg?.kortnavn} · {kantine.plassering}
          {kantine.leveringTilBord ? ' · levering til bord' : ''}
        </Text>
      </View>
      <Merkelapp tekst={aapen ? 'Åpent' : `Åpner ${kantine.aapner}`} variant={aapen ? 'suksess' : 'info'} />
      <Ionicons name="chevron-forward" size={18} color={farger.tekstDempet} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  skjerm: {
    flex: 1,
    backgroundColor: farger.bakgrunn,
  },
  innhold: {
    paddingHorizontal: avstand.l + 4,
    paddingBottom: avstand.xl,
    gap: avstand.xl,
  },
  topp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logoTekst: {
    fontFamily: fonter.tittel,
    fontSize: 26,
    color: farger.tekst,
    letterSpacing: -0.5,
  },
  logoPrikk: {
    width: 10,
    height: 10,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    marginTop: 6,
  },
  hilsen: {
    gap: 2,
    marginTop: -avstand.s,
  },
  varsel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s + 2,
    padding: avstand.m + 2,
    borderRadius: radius.l,
    backgroundColor: farger.primaerLys,
    marginTop: -avstand.s,
  },
  varselTekst: {
    flex: 1,
    fontFamily: fonter.medium,
    fontSize: 14,
    color: farger.primaerMork,
  },
  motivKort: {
    backgroundColor: farger.kort,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...skygge,
  },
  motiv: {
    width: '100%',
    aspectRatio: 390 / 150,
  },
  motivInnhold: {
    gap: avstand.xs,
    padding: avstand.l + 2,
  },
  motivKnapp: {
    marginTop: avstand.m,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  seksjon: {
    gap: avstand.m,
  },
  seksjonTopp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: avstand.s,
    flexWrap: 'wrap',
  },
  brikker: {
    flexDirection: 'row',
    gap: avstand.s - 2,
  },
  byggRutenett: {
    flexDirection: 'row',
    gap: avstand.s + 2,
  },
  byggFlis: {
    flex: 1,
    gap: avstand.m,
    padding: avstand.m,
    borderRadius: radius.l - 2,
    backgroundColor: farger.kort,
    ...skygge,
  },
  byggFlisValgt: {
    backgroundColor: farger.primaerLys,
  },
  byggNavn: {
    fontFamily: fonter.tittel,
    fontSize: 22,
    color: farger.tekst,
  },
  kantine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    padding: avstand.s + 2,
    paddingRight: avstand.m,
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
  },
  kantineBilde: {
    width: 52,
    height: 52,
  },
  sio: {
    marginTop: avstand.s,
  },
});
