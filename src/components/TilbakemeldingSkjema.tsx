import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { avstand, farger, fonter, lagStiler, radius, skrift } from '../theme';
import { t } from '../i18n';
import type { Tilbakemelding } from '../types';
import { Knapp } from './Knapp';

interface Props {
  /** Allerede gitt tilbakemelding (vises da som takk) */
  gitt?: Tilbakemelding;
  onSend: (tilbakemelding: Tilbakemelding) => void;
}

const BESKRIVELSER = ['', 'Dårlig', 'Ikke så bra', 'Helt grei', 'God', 'Kjempegod'];

/** 1–5 stjerner og en valgfri kommentar etter måltidet. */
export function TilbakemeldingSkjema({ gitt, onSend }: Props) {
  const [stjerner, setStjerner] = useState(0);
  const [kommentar, setKommentar] = useState('');

  if (gitt) {
    return (
      <View style={styles.beholder}>
        <Text style={skrift.overskrift}>{t('Takk for tilbakemeldingen!')}</Text>
        <Stjerner antall={gitt.stjerner} />
        {gitt.kommentar ? <Text style={skrift.liten}>«{gitt.kommentar}»</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.beholder}>
      <Text style={skrift.overskrift}>{t('Hvordan smakte det?')}</Text>
      <View style={styles.stjerner} accessibilityRole="radiogroup" accessibilityLabel={t('Vurdering')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => setStjerner(n)}
            accessibilityRole="radio"
            accessibilityState={{ checked: stjerner === n }}
            accessibilityLabel={`${t('{antall} av 5', { antall: n })} – ${t(BESKRIVELSER[n])}`}
            hitSlop={4}
            style={styles.stjerneKnapp}
          >
            <Ionicons name={n <= stjerner ? 'star' : 'star-outline'} size={32} color={farger.primaer} />
          </Pressable>
        ))}
      </View>
      {stjerner > 0 ? <Text style={skrift.liten}>{t(BESKRIVELSER[stjerner])}</Text> : null}
      <TextInput
        value={kommentar}
        onChangeText={setKommentar}
        placeholder={t('Noe kantina bør vite? (valgfritt)')}
        placeholderTextColor={farger.tekstDempet}
        style={styles.input}
        multiline
        accessibilityLabel={t('Kommentar til kantina')}
      />
      <Knapp
        tittel={t('Send tilbakemelding')}
        deaktivert={stjerner === 0}
        onPress={() => onSend({ stjerner, kommentar: kommentar.trim() || undefined })}
      />
    </View>
  );
}

/** Viser 1–5 stjerner (bare visning). */
export function Stjerner({ antall, storrelse = 18 }: { antall: number; storrelse?: number }) {
  return (
    <View style={styles.stjerner} accessible accessibilityLabel={t('{antall} av 5 stjerner', { antall })}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= antall ? 'star' : 'star-outline'} size={storrelse} color={farger.primaer} />
      ))}
    </View>
  );
}

const styles = lagStiler(() => ({
  beholder: {
    gap: avstand.m,
  },
  stjerner: {
    flexDirection: 'row',
    gap: avstand.xs,
  },
  stjerneKnapp: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 72,
    padding: avstand.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: farger.kant,
    backgroundColor: farger.bakgrunn,
    fontFamily: fonter.vanlig,
    fontSize: 15,
    color: farger.tekst,
    textAlignVertical: 'top',
  },
}));
