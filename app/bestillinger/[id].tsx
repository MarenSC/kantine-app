import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Knapp } from '../../src/components/Knapp';
import { Merkelapp } from '../../src/components/Merkelapp';
import { TilbakemeldingSkjema } from '../../src/components/TilbakemeldingSkjema';
import { TomTilstand } from '../../src/components/TomTilstand';
import { useBestilling } from '../../src/context/BestillingContext';
import { hentBygg, hentKantine } from '../../src/data/kantiner';
import { useNaa } from '../../src/hooks/useNaa';
import { avstand, farger, fonter, radius, skrift, skygge } from '../../src/theme';
import { klokkeslett } from '../../src/utils/dato';
import { formaterAntall, formaterPris } from '../../src/utils/pris';
import { hentStatus } from '../../src/utils/status';
import { bekreft, visMelding } from '../../src/utils/dialog';
import { gaaHjem } from '../../src/utils/navigasjon';

/** Kvittering og status for én bestilling. */
export default function BestillingSkjerm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hentBestilling, bestillIgjen, giTilbakemelding, kurvKantineId, antallIKurv } = useBestilling();
  const naa = useNaa();
  const bestilling = hentBestilling(id);

  if (!bestilling) {
    return <TomTilstand ikon="alert-circle-outline" tittel="Fant ikke bestillingen" />;
  }

  const kantine = hentKantine(bestilling.kantineId);
  const bygg = kantine ? hentBygg(kantine.byggId) : undefined;
  const status = hentStatus(bestilling, naa);
  const { leveringsmaate } = bestilling;
  const erHenting = leveringsmaate.type === 'henting';

  function haandterBestillIgjen() {
    if (!bestilling) return;
    const utfor = () => {
      const antall = bestillIgjen(bestilling);
      if (antall === 0) {
        visMelding('Ikke tilgjengelig', 'Ingen av varene fra denne bestillingen finnes på menyen nå.');
        return;
      }
      router.push('/handlekurv');
    };
    // Advar hvis handlekurven allerede har andre varer
    if (antallIKurv > 0 && kurvKantineId !== null) {
      bekreft('Erstatte handlekurven?', 'Varene du har i handlekurven nå, blir byttet ut.', 'Bestill igjen', utfor);
    } else {
      utfor();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.innhold}>
      <View style={styles.hode}>
        <View style={styles.hake}>
          <Ionicons name="checkmark" size={36} color={farger.hvit} />
        </View>
        <Text style={skrift.tittel}>
          {erHenting ? 'Maten er reservert!' : 'Bestillingen er sendt!'}
        </Text>
        <Merkelapp tekst={status.tekst} variant={status.ferdig ? 'suksess' : 'info'} />
      </View>

      <View style={[styles.kort, styles.kodeKort]}>
        <Text style={skrift.liten}>{erHenting ? 'Vis denne koden i kassa' : 'Bestillingsnummer'}</Text>
        <Text style={styles.kode} accessibilityLabel={`Kode ${bestilling.hentekode}`}>
          #{bestilling.hentekode}
        </Text>
      </View>

      <View style={styles.kort}>
        <Rad
          ikon="restaurant-outline"
          tekst={`${kantine?.navn ?? 'Kantine'}${bygg ? ` · ${bygg.navn}` : ''}`}
        />
        {leveringsmaate.type === 'henting' ? (
          <Rad ikon="time-outline" tekst={`Hentes ca. kl. ${klokkeslett(new Date(leveringsmaate.hentetid))}`} />
        ) : (
          <Rad ikon="location-outline" tekst={`Leveres til: ${leveringsmaate.plassering}`} />
        )}
        {bestilling.kommentar ? <Rad ikon="chatbubble-outline" tekst={bestilling.kommentar} /> : null}
      </View>

      <View style={styles.kort}>
        {bestilling.linjer.map((linje, i) => (
          <View key={`${linje.vareId}-${linje.variant ?? ""}-${i}`} style={styles.linje}>
            <Text style={[skrift.brodtekst, styles.linjeNavn]}>
              {formaterAntall(linje.antall, linje.enhet)} {linje.navn}
              {linje.komponenter ? `\n${linje.komponenter.map((k) => `${k.navn} ${k.gram} g`).join(' · ')}` : ''}
            </Text>
            <Text style={skrift.brodtekst}>{formaterPris(linje.antall * linje.stykkpris)}</Text>
          </View>
        ))}
        <View style={[styles.linje, styles.total]}>
          <Text style={skrift.overskrift}>Totalt</Text>
          <Text style={skrift.overskrift}>{formaterPris(bestilling.totalpris)}</Text>
        </View>
      </View>

      {status.ferdig ? (
        <View style={styles.kort}>
          <TilbakemeldingSkjema
            gitt={bestilling.tilbakemelding}
            onSend={(t) => giTilbakemelding(bestilling.id, t)}
          />
        </View>
      ) : null}

      <Knapp tittel="Bestill det samme igjen" onPress={haandterBestillIgjen} />
      <Knapp tittel="Tilbake til kantinene" variant="sekundaer" onPress={() => gaaHjem()} />
    </ScrollView>
  );
}

type IkonNavn = 'restaurant-outline' | 'time-outline' | 'location-outline' | 'chatbubble-outline';

function Rad({ ikon, tekst }: { ikon: IkonNavn; tekst: string }) {
  return (
    <View style={styles.rad}>
      <Ionicons name={ikon} size={18} color={farger.primaer} />
      <Text style={[skrift.brodtekst, styles.radTekst]}>{tekst}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  innhold: {
    padding: avstand.l,
    gap: avstand.l,
  },
  hode: {
    alignItems: 'center',
    gap: avstand.m,
    paddingVertical: avstand.l,
  },
  hake: {
    width: 64,
    height: 64,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kort: {
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
    padding: avstand.l,
    gap: avstand.m,
  },
  kodeKort: {
    alignItems: 'center',
    gap: avstand.xs,
  },
  kode: {
    fontSize: 40,
    fontFamily: fonter.tittel,
    letterSpacing: 4,
    color: farger.primaerMork,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
  },
  radTekst: {
    flex: 1,
  },
  linje: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: avstand.m,
  },
  linjeNavn: {
    flex: 1,
  },
  total: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: farger.kant,
    paddingTop: avstand.m,
  },
});
