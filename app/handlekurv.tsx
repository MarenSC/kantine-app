import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Antallvelger } from '../src/components/Antallvelger';
import { Knapp } from '../src/components/Knapp';
import { TomTilstand } from '../src/components/TomTilstand';
import { Valgbrikke } from '../src/components/Valgbrikke';
import { useBestilling } from '../src/context/BestillingContext';
import { useBruker } from '../src/context/BrukerContext';
import { useInnstillinger } from '../src/context/InnstillingerContext';
import { hentKantine } from '../src/data/kantiner';
import { avstand, farger, fonter, lagStiler, radius, skrift, skygge } from '../src/theme';
import { t } from '../src/i18n';
import { erAapen, klokkeslett, leggTilMinutter } from '../src/utils/dato';
import { formaterPris, perEnhet, totalGram } from '../src/utils/pris';
import { gaaHjem } from '../src/utils/navigasjon';

type Valg = 'henting' | 'levering';

/** Hvor mange minutter frem i tid studenten kan velge å hente. */
const HENTETIDER_MINUTTER = [10, 20, 30, 45, 60];

export default function HandlekurvSkjerm() {
  const insets = useSafeAreaInsets();
  useInnstillinger(); // tegnes på nytt når språk eller tema byttes
  const { kurvKantineId, kurvVarer, totalpris, spart, settAntall, sendBestilling } = useBestilling();
  const { student } = useBruker();
  const kantine = kurvKantineId ? hentKantine(kurvKantineId) : undefined;

  const [valg, setValg] = useState<Valg>('henting');
  const [hentOmMinutter, setHentOmMinutter] = useState(HENTETIDER_MINUTTER[0]);
  const [plassering, setPlassering] = useState('');
  const [kommentar, setKommentar] = useState('');

  // Tidspunktene regnes ut når skjermen åpnes.
  const naa = useMemo(() => new Date(), []);

  if (!kantine || kurvVarer.length === 0) {
    return (
      <TomTilstand
        ikon="cart-outline"
        tittel={t('Handlekurven er tom')}
        tekst={t('Velg en kantine og legg til mat eller drikke.')}
      >
        <Knapp tittel={t('Se kantiner')} variant="sekundaer" onPress={() => gaaHjem()} />
      </TomTilstand>
    );
  }

  const aapen = erAapen(kantine.aapner, kantine.stenger);
  const manglerPlassering = valg === 'levering' && plassering.trim().length === 0;

  function bekreft() {
    const id = sendBestilling(
      valg === 'henting'
        ? { type: 'henting', hentetid: leggTilMinutter(new Date(), hentOmMinutter).toISOString() }
        : { type: 'levering', plassering: plassering.trim() },
      kommentar,
    );
    if (id) {
      router.replace({ pathname: '/bestillinger/[id]', params: { id } });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.skjerm}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.innhold} keyboardShouldPersistTaps="handled">
        <Text style={skrift.tittel}>{kantine.navn}</Text>

        {!aapen && (
          <View style={styles.advarsel}>
            <Ionicons name="time-outline" size={18} color={farger.dato} />
            <Text style={styles.advarselTekst}>
              {t('Kantina er stengt nå (åpent {fra}–{til}).', { fra: kantine.aapner, til: kantine.stenger })}
            </Text>
          </View>
        )}

        {/* ---------- Varer ---------- */}
        <View style={styles.kort}>
          {kurvVarer.map(({ nokkel, vare, variant, komponenter, antall, prisinfo, linjesum }, indeks) => (
            <View key={nokkel} style={[styles.linje, indeks > 0 && styles.linjeSkille]}>
              <View style={styles.linjeTekst}>
                <Text style={styles.vareNavn}>{t(vare.navn)}</Text>
                {variant ? <Text style={styles.variant}>{t(variant)}</Text> : null}
                {komponenter ? (
                  <Text style={styles.variant}>
                    {komponenter.map((k) => `${t(k.navn)} ${k.gram} g`).join(' · ')}
                  </Text>
                ) : null}
                <Text style={skrift.liten}>
                  {formaterPris(prisinfo.pris)}{' '}
                  {komponenter ? t('per tallerken ({gram} g)', { gram: totalGram(komponenter) }) : perEnhet(vare.enhet)}
                  {prisinfo.grunn ? `  (${t('før {pris}', { pris: formaterPris(prisinfo.ordinaerPris) })})` : ''}
                </Text>
              </View>
              <View style={styles.linjeHoyre}>
                <Text style={styles.linjesum}>{formaterPris(linjesum)}</Text>
                <Antallvelger
                  enhet={komponenter ? 'stk' : vare.enhet}
                  antall={antall}
                  maks={vare.antallIgjen}
                  onEndre={(nytt) => settAntall(nokkel, nytt)}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ---------- Henting eller levering ---------- */}
        <Text style={styles.seksjonTittel}>{t('Hvordan vil du få maten?')}</Text>

        <View style={styles.valgRad}>
          <Leveringsvalg
            ikon="walk-outline"
            tittel={t('Hent selv')}
            undertekst={t('Reserver og hent i kantina')}
            valgt={valg === 'henting'}
            onPress={() => setValg('henting')}
          />
          <Leveringsvalg
            ikon="bicycle-outline"
            tittel={t('Lever til meg')}
            undertekst={kantine.leveringTilBord ? t('Dit du sitter') : t('Ikke tilgjengelig her')}
            valgt={valg === 'levering'}
            deaktivert={!kantine.leveringTilBord}
            onPress={() => setValg('levering')}
          />
        </View>

        {valg === 'henting' ? (
          <View style={styles.gruppe}>
            <Text style={styles.etikett}>{t('Når vil du hente?')}</Text>
            <View style={styles.brikker}>
              {HENTETIDER_MINUTTER.map((min) => (
                <Valgbrikke
                  key={min}
                  tekst={`${klokkeslett(leggTilMinutter(naa, min))} (${min} min)`}
                  valgt={hentOmMinutter === min}
                  onPress={() => setHentOmMinutter(min)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.gruppe}>
            <Text style={styles.etikett}>{t('Hvor sitter du?')}</Text>
            <TextInput
              value={plassering}
              onChangeText={setPlassering}
              placeholder={t('F.eks. P35, 3. etasje, bord ved vinduet')}
              placeholderTextColor={farger.tekstDempet}
              style={styles.input}
              returnKeyType="done"
            />
          </View>
        )}

        <View style={styles.gruppe}>
          <Text style={styles.etikett}>{t('Kommentar til kantina (valgfritt)')}</Text>
          <TextInput
            value={kommentar}
            onChangeText={setKommentar}
            placeholder={t('F.eks. allergier eller uten løk')}
            placeholderTextColor={farger.tekstDempet}
            style={[styles.input, styles.inputFlerlinje]}
            multiline
          />
        </View>

        {/* ---------- Oppsummering ---------- */}
        <View style={styles.kort}>
          {spart > 0 && (
            <View style={styles.sumRad}>
              <Text style={[skrift.brodtekst, { color: farger.suksess }]}>{t('Du sparer')}</Text>
              <Text style={[skrift.brodtekst, { color: farger.suksess }]}>{formaterPris(spart)}</Text>
            </View>
          )}
          <View style={styles.sumRad}>
            <Text style={skrift.overskrift}>{t('Totalt')}</Text>
            <Text style={skrift.overskrift}>{formaterPris(totalpris)}</Text>
          </View>
          <Text style={skrift.liten}>{t('Du betaler når du henter eller får maten levert.')}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bunn, { paddingBottom: Math.max(insets.bottom, avstand.l) }]}>
        {student ? (
          <Knapp
            tittel={`${t('Bekreft bestilling')} · ${formaterPris(totalpris)}`}
            onPress={bekreft}
            deaktivert={manglerPlassering}
          />
        ) : (
          <Knapp tittel={t('Logg inn med Feide for å bestille')} onPress={() => router.push('/min-side')} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

interface LeveringsvalgProps {
  ikon: 'walk-outline' | 'bicycle-outline';
  tittel: string;
  undertekst: string;
  valgt: boolean;
  deaktivert?: boolean;
  onPress: () => void;
}

function Leveringsvalg({ ikon, tittel, undertekst, valgt, deaktivert, onPress }: LeveringsvalgProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deaktivert}
      accessibilityRole="radio"
      accessibilityState={{ checked: valgt, disabled: deaktivert }}
      style={[styles.valg, valgt && styles.valgValgt, deaktivert && styles.valgDeaktivert]}
    >
      <Ionicons name={ikon} size={26} color={valgt ? farger.primaer : farger.tekstDempet} />
      <Text style={[styles.valgTittel, valgt && { color: farger.primaer }]}>{tittel}</Text>
      <Text style={skrift.liten}>{undertekst}</Text>
    </Pressable>
  );
}

const styles = lagStiler(() => ({
  skjerm: {
    flex: 1,
  },
  innhold: {
    padding: avstand.l,
    gap: avstand.m,
  },
  advarsel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
    padding: avstand.m,
    borderRadius: radius.m,
    backgroundColor: farger.datoLys,
  },
  advarselTekst: {
    flex: 1,
    color: farger.dato,
    fontSize: 14,
  },
  kort: {
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
    padding: avstand.l,
    gap: avstand.s,
  },
  linje: {
    flexDirection: 'row',
    gap: avstand.m,
    paddingVertical: avstand.s,
  },
  linjeSkille: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: farger.kant,
    paddingTop: avstand.m,
  },
  linjeTekst: {
    flex: 1,
    gap: avstand.xs,
  },
  variant: {
    fontFamily: fonter.medium,
    fontSize: 13,
    color: farger.primaerMork,
  },
  vareNavn: {
    fontSize: 15,
    fontFamily: fonter.fet,
    color: farger.tekst,
  },
  linjeHoyre: {
    alignItems: 'flex-end',
    gap: avstand.s,
  },
  linjesum: {
    fontSize: 15,
    fontFamily: fonter.fet,
    color: farger.tekst,
  },
  seksjonTittel: {
    ...skrift.overskrift,
    marginTop: avstand.m,
  },
  valgRad: {
    flexDirection: 'row',
    gap: avstand.m,
  },
  valg: {
    flex: 1,
    gap: avstand.xs,
    padding: avstand.l,
    borderRadius: radius.l,
    borderWidth: 2,
    borderColor: farger.kant,
    backgroundColor: farger.kort,
  },
  valgValgt: {
    borderColor: farger.primaer,
    backgroundColor: farger.primaerLys,
  },
  valgDeaktivert: {
    opacity: 0.5,
  },
  valgTittel: {
    fontSize: 16,
    fontFamily: fonter.fet,
    color: farger.tekst,
  },
  gruppe: {
    gap: avstand.s,
  },
  etikett: {
    fontSize: 14,
    fontFamily: fonter.fet,
    color: farger.tekst,
  },
  brikker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: avstand.s,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: avstand.m,
    paddingVertical: avstand.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: farger.kant,
    backgroundColor: farger.kort,
    fontSize: 15,
    color: farger.tekst,
  },
  inputFlerlinje: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sumRad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bunn: {
    paddingHorizontal: avstand.l,
    paddingTop: avstand.m,
    backgroundColor: farger.bakgrunn,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: farger.kant,
  },
}));
