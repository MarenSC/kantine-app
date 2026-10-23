import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Bunnmeny } from '../src/components/Bunnmeny';
import { useInnstillinger, type Temavalg } from '../src/context/InnstillingerContext';
import { spraakvalg } from '../src/i18n';
import { avstand, farger, fonter, lagStiler, radius, skrift, skygge } from '../src/theme';

type IkonNavn = ComponentProps<typeof Ionicons>['name'];

const temaer: { valg: Temavalg; tittel: string; ikon: IkonNavn }[] = [
  { valg: 'system', tittel: 'Automatisk', ikon: 'phone-portrait-outline' },
  { valg: 'lys', tittel: 'Lys', ikon: 'sunny-outline' },
  { valg: 'mork', tittel: 'Mørk', ikon: 'moon-outline' },
];

/** Innstillinger: lys/mørk modus og språk. Virker også uten å være innlogget. */
export default function InnstillingerSkjerm() {
  const { tema, spraak, settTema, settSpraak, t } = useInnstillinger();

  return (
    <View style={styles.skjerm}>
      <ScrollView contentContainerStyle={styles.innhold}>
        {/* Utseende */}
        <View style={styles.kort}>
          <View style={styles.hode}>
            <Text style={skrift.overskrift}>{t('Utseende')}</Text>
            <Text style={skrift.liten}>{t('Automatisk følger innstillingen på telefonen din.')}</Text>
          </View>
          <View style={styles.temaRad} accessibilityRole="radiogroup">
            {temaer.map((x) => {
              const valgt = tema === x.valg;
              return (
                <Pressable
                  key={x.valg}
                  onPress={() => settTema(x.valg)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: valgt }}
                  style={({ pressed }) => [styles.temaValg, valgt && styles.temaValgt, pressed && { opacity: 0.85 }]}
                >
                  <Ionicons name={x.ikon} size={24} color={valgt ? farger.primaerMork : farger.tekstDempet} />
                  <Text style={[styles.temaTekst, valgt && styles.temaTekstValgt]}>{t(x.tittel)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Språk */}
        <View style={styles.kort}>
          <View style={styles.hode}>
            <View style={styles.tittelRad}>
              <Ionicons name="language-outline" size={20} color={farger.tekst} />
              <Text style={skrift.overskrift}>{t('Språk')}</Text>
            </View>
            <Text style={skrift.liten}>{t('Gjelder menyen og all tekst i appen.')}</Text>
          </View>
          <View accessibilityRole="radiogroup">
            {spraakvalg.map((s, i) => {
              const valgt = spraak === s.kode;
              return (
                <Pressable
                  key={s.kode}
                  onPress={() => settSpraak(s.kode)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: valgt }}
                  accessibilityLanguage={s.locale}
                  style={({ pressed }) => [styles.spraakRad, i > 0 && styles.skille, pressed && { opacity: 0.7 }]}
                >
                  {/* Språknavnet står alltid på sitt eget språk, så det er lett å finne */}
                  <Text style={[skrift.brodtekst, styles.flex, valgt && styles.valgtTekst]}>{s.navn}</Text>
                  <Ionicons
                    name={valgt ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={valgt ? farger.primaer : farger.tekstDempet}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Tilgjengelighet */}
        <View style={styles.kort}>
          <Text style={skrift.overskrift}>{t('Tilgjengelighet')}</Text>
          <Text style={skrift.brodtekst}>
            {t('Appen følger tekststørrelsen og skjermleseren (VoiceOver/TalkBack) på telefonen din.')}
          </Text>
        </View>
      </ScrollView>
      <Bunnmeny />
    </View>
  );
}

const styles = lagStiler(() => ({
  skjerm: {
    flex: 1,
    backgroundColor: farger.bakgrunn,
  },
  innhold: {
    padding: avstand.l,
    gap: avstand.l,
  },
  kort: {
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
    padding: avstand.l,
    gap: avstand.m,
  },
  hode: {
    gap: avstand.xs,
  },
  tittelRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
  },
  flex: {
    flex: 1,
  },
  temaRad: {
    flexDirection: 'row',
    gap: avstand.s,
  },
  temaValg: {
    flex: 1,
    alignItems: 'center',
    gap: avstand.xs,
    paddingVertical: avstand.m,
    borderRadius: radius.m,
    borderWidth: 2,
    borderColor: farger.kant,
  },
  temaValgt: {
    borderColor: farger.primaer,
    backgroundColor: farger.primaerLys,
  },
  temaTekst: {
    fontFamily: fonter.medium,
    fontSize: 14,
    color: farger.tekstDempet,
  },
  temaTekstValgt: {
    fontFamily: fonter.fet,
    color: farger.primaerMork,
  },
  spraakRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    paddingVertical: avstand.m,
  },
  skille: {
    borderTopWidth: 1,
    borderTopColor: farger.kant,
  },
  valgtTekst: {
    fontFamily: fonter.fet,
  },
}));
