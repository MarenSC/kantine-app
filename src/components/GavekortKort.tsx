import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useBruker } from '../context/BrukerContext';
import { DEMO_TIPS_KODE } from '../data/gavekort';
import { t } from '../i18n';
import { avstand, farger, fonter, lagStiler, radius, skrift } from '../theme';
import { formaterPris } from '../utils/pris';
import { Knapp } from './Knapp';

/** Gavekort på Min side: saldo og felt for å legge til et nytt gavekort. */
export function GavekortKort() {
  const { gavekort, loesInnGavekort } = useBruker();
  const [kode, setKode] = useState('');
  const [melding, setMelding] = useState<{ tekst: string; ok: boolean } | null>(null);

  function leggTil() {
    const svar = loesInnGavekort(kode);
    if (svar.ok) {
      setMelding({ ok: true, tekst: t('{belop} er lagt til på gavekortet ditt.', { belop: formaterPris(svar.belop) }) });
      setKode('');
    } else {
      setMelding({ ok: false, tekst: t(svar.feil) });
    }
  }

  return (
    <View style={styles.beholder}>
      <View style={styles.saldoRad}>
        <View style={styles.ikon}>
          <Ionicons name="gift-outline" size={24} color={farger.primaerMork} />
        </View>
        <View style={styles.flex}>
          <Text style={skrift.liten}>{t('Saldo på gavekort')}</Text>
          <Text style={styles.saldo} accessibilityLabel={t('Saldo på gavekort: {belop}', { belop: formaterPris(gavekort.saldo) })}>
            {formaterPris(gavekort.saldo)}
          </Text>
        </View>
      </View>
      <Text style={skrift.liten}>
        {t('Fått et gavekort av venner eller familie? Legg inn koden, så kan du betale med det når du bestiller.')}
      </Text>

      <View style={styles.inputRad}>
        <TextInput
          value={kode}
          onChangeText={(tekst) => {
            setKode(tekst);
            setMelding(null);
          }}
          placeholder={t('Gavekortkode')}
          placeholderTextColor={farger.tekstDempet}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={leggTil}
          style={styles.input}
          accessibilityLabel={t('Gavekortkode')}
        />
        <Knapp tittel={t('Legg til')} variant="mork" onPress={leggTil} deaktivert={kode.trim().length === 0} />
      </View>
      {melding ? (
        <Text style={[styles.melding, { color: melding.ok ? farger.suksess : farger.tilbud }]} accessibilityLiveRegion="polite">
          {melding.tekst}
        </Text>
      ) : null}
      <Text style={skrift.liten}>{t('Demo: prøv koden {kode}', { kode: DEMO_TIPS_KODE })}</Text>
    </View>
  );
}

const styles = lagStiler(() => ({
  beholder: {
    gap: avstand.m,
  },
  saldoRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
  },
  ikon: {
    width: 48,
    height: 48,
    borderRadius: radius.rund,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  saldo: {
    fontFamily: fonter.tittel,
    fontSize: 28,
    color: farger.tekst,
  },
  inputRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: avstand.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: farger.kant,
    backgroundColor: farger.kort,
    fontSize: 15,
    fontFamily: fonter.medium,
    letterSpacing: 1,
    color: farger.tekst,
  },
  melding: {
    fontFamily: fonter.medium,
    fontSize: 14,
  },
}));
