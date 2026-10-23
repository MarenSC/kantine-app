import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Knapp } from '../../src/components/Knapp';
import { Merkelapp } from '../../src/components/Merkelapp';
import { SveipBekreft } from '../../src/components/SveipBekreft';
import { TilbakemeldingSkjema } from '../../src/components/TilbakemeldingSkjema';
import { TomTilstand } from '../../src/components/TomTilstand';
import { useBestilling } from '../../src/context/BestillingContext';
import { useInnstillinger } from '../../src/context/InnstillingerContext';
import { hentBygg, hentKantine } from '../../src/data/kantiner';
import { useNaa } from '../../src/hooks/useNaa';
import { avstand, farger, fonter, lagStiler, radius, skrift, skygge } from '../../src/theme';
import { t } from '../../src/i18n';
import { klokkeslett } from '../../src/utils/dato';
import { formaterAntall, formaterPris } from '../../src/utils/pris';
import { hentStatus } from '../../src/utils/status';
import { bekreft, visMelding } from '../../src/utils/dialog';
import { gaaHjem } from '../../src/utils/navigasjon';

/** Kvittering og status for én bestilling. */
export default function BestillingSkjerm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useInnstillinger(); // tegnes på nytt når språk eller tema byttes
  const { hentBestilling, bestillIgjen, giTilbakemelding, bekreftUtlevert, kurvKantineId, antallIKurv } = useBestilling();
  const naa = useNaa();
  const bestilling = hentBestilling(id);

  if (!bestilling) {
    return <TomTilstand ikon="alert-circle-outline" tittel={t('Fant ikke bestillingen')} />;
  }

  const kantine = hentKantine(bestilling.kantineId);
  const bygg = kantine ? hentBygg(kantine.byggId) : undefined;
  const status = hentStatus(bestilling, naa);
  const { leveringsmaate } = bestilling;
  const erHenting = leveringsmaate.type === 'henting';
  const erKlar = status.steg === 'klar';
  const erUtlevert = status.steg === 'utlevert';

  function haandterBestillIgjen() {
    if (!bestilling) return;
    const utfor = () => {
      const antall = bestillIgjen(bestilling);
      if (antall === 0) {
        visMelding(t('Ikke tilgjengelig'), t('Ingen av varene fra denne bestillingen finnes på menyen nå.'));
        return;
      }
      router.push('/handlekurv');
    };
    // Advar hvis handlekurven allerede har andre varer
    if (antallIKurv > 0 && kurvKantineId !== null) {
      bekreft(t('Erstatte handlekurven?'), t('Varene du har i handlekurven nå, blir byttet ut.'), t('Bestill igjen'), utfor);
    } else {
      utfor();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.innhold}>
      <View style={styles.hode}>
        <View style={[styles.hake, erUtlevert && styles.hakeUtlevert]}>
          <Ionicons name={erUtlevert ? 'checkmark-done' : 'checkmark'} size={36} color={farger.hvit} />
        </View>
        <Text style={[skrift.tittel, styles.midtstilt]}>
          {erUtlevert
            ? t('Velbekomme!')
            : erKlar
              ? erHenting
                ? t('Maten er klar!')
                : t('Maten er på vei!')
              : erHenting
                ? t('Maten er reservert!')
                : t('Bestillingen er sendt!')}
        </Text>
        <Merkelapp tekst={status.tekst} variant={status.ferdig ? 'suksess' : 'info'} />
        {erUtlevert && bestilling.utlevertTid ? (
          <Text style={skrift.liten}>
            {t(erHenting ? 'Hentet kl. {tid}' : 'Levert kl. {tid}', { tid: klokkeslett(new Date(bestilling.utlevertTid)) })}
          </Text>
        ) : null}
      </View>

      {/* Etter henting: be om tilbakemelding øverst, mens måltidet er ferskt i minnet */}
      {erUtlevert ? (
        <View style={styles.kort}>
          <TilbakemeldingSkjema
            gitt={bestilling.tilbakemelding}
            onSend={(svar) => giTilbakemelding(bestilling.id, svar)}
          />
        </View>
      ) : (
        <View style={[styles.kort, styles.kodeKort, erKlar && styles.kodeKortKlar]}>
          <Text style={skrift.liten}>{erHenting ? t('Vis denne koden i kassa') : t('Bestillingsnummer')}</Text>
          <Text style={styles.kode} accessibilityLabel={t('Kode {kode}', { kode: bestilling.hentekode })}>
            #{bestilling.hentekode}
          </Text>
          {erKlar ? (
            <View style={styles.sveip}>
              <SveipBekreft
                tekst={erHenting ? t('Sveip når du har fått maten') : t('Sveip når maten er levert')}
                onBekreft={() => bekreftUtlevert(bestilling.id)}
              />
              <Text style={[skrift.liten, styles.midtstilt]}>
                {erHenting
                  ? t('Gjør dette i kassa, så ansatte ser at bestillingen er hentet.')
                  : t('Bekreft når du har fått maten, så arkiveres bestillingen.')}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.kort}>
        <Rad
          ikon="restaurant-outline"
          tekst={`${kantine?.navn ?? t('Kantine')}${bygg ? ` · ${bygg.navn}` : ''}`}
        />
        {leveringsmaate.type === 'henting' ? (
          <Rad ikon="time-outline" tekst={t('Hentes ca. kl. {tid}', { tid: klokkeslett(new Date(leveringsmaate.hentetid)) })} />
        ) : (
          <Rad ikon="location-outline" tekst={t('Leveres til: {sted}', { sted: leveringsmaate.plassering })} />
        )}
        {bestilling.kommentar ? <Rad ikon="chatbubble-outline" tekst={bestilling.kommentar} /> : null}
      </View>

      <View style={styles.kort}>
        {bestilling.linjer.map((linje, i) => (
          <View key={`${linje.vareId}-${linje.variant ?? ""}-${i}`} style={styles.linje}>
            <Text style={[skrift.brodtekst, styles.linjeNavn]}>
              {formaterAntall(linje.antall, linje.enhet)} {t(linje.navn)}
              {linje.variant ? ` (${t(linje.variant)})` : ''}
              {linje.komponenter ? `\n${linje.komponenter.map((k) => `${t(k.navn)} ${k.gram} g`).join(' · ')}` : ''}
            </Text>
            <Text style={skrift.brodtekst}>{formaterPris(linje.antall * linje.stykkpris)}</Text>
          </View>
        ))}
        <View style={[styles.linje, styles.total]}>
          <Text style={skrift.overskrift}>{t('Totalt')}</Text>
          <Text style={skrift.overskrift}>{formaterPris(bestilling.totalpris)}</Text>
        </View>
      </View>

      <Knapp tittel={t('Bestill det samme igjen')} onPress={haandterBestillIgjen} />
      <Knapp tittel={t('Tilbake til kantinene')} variant="sekundaer" onPress={() => gaaHjem()} />
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

const styles = lagStiler(() => ({
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
  kodeKortKlar: {
    borderWidth: 2,
    borderColor: farger.suksess,
  },
  sveip: {
    alignSelf: 'stretch',
    gap: avstand.s,
    marginTop: avstand.m,
  },
  midtstilt: {
    textAlign: 'center',
  },
  hakeUtlevert: {
    backgroundColor: farger.suksess,
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
}));
