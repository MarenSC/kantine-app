import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Bunnmeny } from '../src/components/Bunnmeny';
import { FeideLoggInnKnapp } from '../src/components/FeideLoggInnKnapp';
import { GavekortKort } from '../src/components/GavekortKort';
import { Knapp } from '../src/components/Knapp';
import { Merkelapp } from '../src/components/Merkelapp';
import { initialer } from '../src/components/ProfilKnapp';
import { Stempelkort } from '../src/components/Stempelkort';
import { Valgbrikke } from '../src/components/Valgbrikke';
import { useBestilling } from '../src/context/BestillingContext';
import { useBruker } from '../src/context/BrukerContext';
import { useInnstillinger } from '../src/context/InnstillingerContext';
import { hentKantine, kantiner } from '../src/data/kantiner';
import { useNaa } from '../src/hooks/useNaa';
import { avstand, farger, fonter, lagStiler, radius, skrift, skygge } from '../src/theme';
import { t } from '../src/i18n';
import { klokkeslett } from '../src/utils/dato';
import { alleAllergener } from '../src/utils/kosthold';
import { formaterPris } from '../src/utils/pris';
import { hentStatus } from '../src/utils/status';

/** Min Side: profil, bestillinger, kosthold og favorittkantine. */
export default function MinSideSkjerm() {
  useInnstillinger(); // tegnes på nytt når språk eller tema byttes
  const { student, lastet } = useBruker();

  if (!lastet) {
    return (
      <View style={styles.midten}>
        <ActivityIndicator color={farger.primaer} />
      </View>
    );
  }

  return (
    <View style={styles.skjerm}>
      {student ? <InnloggetVisning /> : <LoggInnVisning />}
      <Bunnmeny />
    </View>
  );
}

// ---------- Ikke innlogget ----------

function LoggInnVisning() {
  return (
    <View style={styles.midten}>
      <View style={styles.loggInnIkon}>
        <Ionicons name="person" size={40} color={farger.primaer} />
      </View>
      <Text style={[skrift.tittel, styles.midtstilt]}>{t('Logg inn')}</Text>
      <Text style={[skrift.brodtekst, styles.midtstilt, { color: farger.tekstDempet }]}>
        {t('Logg inn med Feide-brukeren din fra OsloMet for å bestille mat og lagre allergier og favorittkantine.')}
      </Text>
      <FeideLoggInnKnapp />
      <InnstillingerLenke />
    </View>
  );
}

// ---------- Innlogget ----------

function InnloggetVisning() {
  const { student, preferanser, loggUt, settVegetar, vekslAllergen, settFavoritt, settVarselReddMaten } = useBruker();
  const { bestillinger, statistikk } = useBestilling();
  const naa = useNaa();

  if (!student) return null;

  const sisteBestillinger = bestillinger.slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.innhold}>
      {/* Profil */}
      <View style={[styles.kort, styles.profil]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTekst}>{initialer(student.navn)}</Text>
        </View>
        <View style={styles.profilTekst}>
          <Text style={skrift.overskrift}>{student.navn}</Text>
          {student.epost ? <Text style={skrift.liten}>{student.epost}</Text> : null}
          {student.institusjon ? <Text style={skrift.liten}>{student.institusjon}</Text> : null}
          <Merkelapp
            tekst={student.innloggetMed === 'feide' ? t('Innlogget med Feide') : t('Demobruker')}
            variant="mork"
          />
        </View>
      </View>

      <InnstillingerLenke />

      {/* Bestillinger */}
      <Seksjon tittel={t('Mine bestillinger')}>
        {sisteBestillinger.length === 0 ? (
          <Text style={skrift.liten}>{t('Du har ingen bestillinger ennå.')}</Text>
        ) : (
          sisteBestillinger.map((b) => {
            const status = hentStatus(b, naa);
            return (
              <Pressable
                key={b.id}
                onPress={() => router.push({ pathname: '/bestillinger/[id]', params: { id: b.id } })}
                accessibilityRole="button"
                style={({ pressed }) => [styles.rad, pressed && { opacity: 0.7 }]}
              >
                <View style={styles.radTekst}>
                  <Text style={styles.radTittel}>{hentKantine(b.kantineId)?.navn ?? t('Kantine')}</Text>
                  <Text style={skrift.liten}>
                    {klokkeslett(new Date(b.opprettet))} · {formaterPris(b.totalpris)}
                  </Text>
                </View>
                <Merkelapp tekst={status.tekst} variant={status.ferdig ? 'suksess' : 'info'} />
                <Ionicons name="chevron-forward" size={18} color={farger.tekstDempet} />
              </Pressable>
            );
          })
        )}
        {bestillinger.length > 0 ? (
          <Pressable onPress={() => router.push('/bestillinger')} accessibilityRole="link">
            <Text style={styles.lenke}>{t('Se alle bestillinger')} ({bestillinger.length})</Text>
          </Pressable>
        ) : null}
      </Seksjon>

      {/* Matsvinn */}
      <View style={[styles.kort, styles.innsats]}>
        <Ionicons name="leaf" size={28} color={farger.suksess} />
        <View style={styles.flex}>
          <Text style={styles.innsatsTall}>
            {t(statistikk.reddedeVarer === 1 ? '{antall} vare reddet' : '{antall} varer reddet', { antall: statistikk.reddedeVarer })}
          </Text>
          <Text style={skrift.liten}>
            {statistikk.reddedeVarer > 0
              ? t('Du har kjøpt mat som ellers kunne blitt kastet, og spart {belop} totalt.', { belop: formaterPris(statistikk.spartTotalt) })
              : t('Kjøp mat under «Redd maten» for å redusere matsvinn – og spare penger.')}
          </Text>
        </View>
      </View>

      {/* Gavekort */}
      <Seksjon tittel={t('Gavekort')}>
        <GavekortKort />
      </Seksjon>

      {/* Stempelkort */}
      <View style={styles.kort}>
        <Stempelkort stempler={statistikk.stempler} />
      </View>

      {/* Kosthold */}
      <Seksjon
        tittel={t('Allergier og kosthold')}
        undertekst={t('Varer som ikke passer for deg blir markert i menyen.')}
      >
        <View style={styles.bryterRad}>
          <Text style={skrift.brodtekst}>{t('Vegetar')}</Text>
          <Switch
            value={preferanser.vegetar}
            onValueChange={settVegetar}
            trackColor={{ true: farger.primaer, false: farger.kant }}
            thumbColor={farger.hvit}
            accessibilityLabel={t('Vegetar')}
          />
        </View>
        <Text style={styles.etikett}>{t('Jeg vil unngå')}</Text>
        <View style={styles.brikker}>
          {alleAllergener.map((allergen) => (
            <Valgbrikke
              key={allergen}
              tekst={t(allergen)}
              valgt={preferanser.allergener.includes(allergen)}
              onPress={() => vekslAllergen(allergen)}
            />
          ))}
        </View>
      </Seksjon>

      {/* Favoritt */}
      <Seksjon tittel={t('Favorittkantine')} undertekst={t('Vises øverst på startsiden.')}>
        <View style={styles.brikker}>
          <Valgbrikke
            tekst={t('Ingen')}
            valgt={preferanser.favorittKantineId === null}
            onPress={() => settFavoritt(null)}
          />
          {kantiner.map((k) => (
            <Valgbrikke
              key={k.id}
              tekst={k.navn}
              valgt={preferanser.favorittKantineId === k.id}
              onPress={() => settFavoritt(k.id)}
            />
          ))}
        </View>
      </Seksjon>

      {/* Varsler */}
      <Seksjon tittel={t('Varsler')}>
        <View style={styles.bryterRad}>
          <Text style={[skrift.brodtekst, styles.flex]}>{t('Si fra når favorittkantina har «Redd maten»-tilbud')}</Text>
          <Switch
            value={preferanser.varselReddMaten}
            onValueChange={settVarselReddMaten}
            trackColor={{ true: farger.primaer, false: farger.kant }}
            thumbColor={farger.hvit}
            accessibilityLabel={t('Varsel om Redd maten')}
          />
        </View>
        <Text style={skrift.liten}>{t('I prototypen vises varselet øverst på startsiden.')}</Text>
      </Seksjon>

      <Knapp tittel={t('Logg ut')} variant="sekundaer" onPress={loggUt} />
    </ScrollView>
  );
}

/** Lenke til Innstillinger (språk og lys/mørk modus). Globus-ikonet er lett å kjenne igjen uansett språk. */
function InnstillingerLenke() {
  return (
    <Pressable
      onPress={() => router.push('/innstillinger')}
      accessibilityRole="button"
      style={({ pressed }) => [styles.kort, styles.innstillinger, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name="language-outline" size={22} color={farger.primaerMork} />
      <View style={styles.flex}>
        <Text style={skrift.fet}>{t('Innstillinger')}</Text>
        <Text style={skrift.liten}>{t('Språk og lys/mørk modus')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={farger.tekstDempet} />
    </Pressable>
  );
}

function Seksjon({ tittel, undertekst, children }: { tittel: string; undertekst?: string; children: ReactNode }) {
  return (
    <View style={styles.kort}>
      <View style={styles.seksjonHode}>
        <Text style={skrift.overskrift}>{tittel}</Text>
        {undertekst ? <Text style={skrift.liten}>{undertekst}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = lagStiler(() => ({
  flex: {
    flex: 1,
    gap: 2,
  },
  innstillinger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  innsats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: farger.suksessLys,
    shadowOpacity: 0,
    elevation: 0,
  },
  innsatsTall: {
    fontFamily: fonter.tittel,
    fontSize: 20,
    color: farger.suksess,
  },
  skjerm: {
    flex: 1,
    backgroundColor: farger.bakgrunn,
  },
  midten: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: avstand.xl,
    gap: avstand.l,
  },
  midtstilt: {
    textAlign: 'center',
  },
  loggInnIkon: {
    width: 80,
    height: 80,
    borderRadius: radius.rund,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
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
  profil: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: farger.primaerLys,
    shadowOpacity: 0,
    elevation: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.rund,
    backgroundColor: farger.morkFlate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTekst: {
    color: farger.hvit,
    fontSize: 24,
    fontFamily: fonter.fet,
  },
  profilTekst: {
    flex: 1,
    gap: avstand.xs,
  },
  seksjonHode: {
    gap: avstand.xs,
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s,
    paddingVertical: avstand.xs,
  },
  radTekst: {
    flex: 1,
    gap: 2,
  },
  radTittel: {
    fontSize: 15,
    fontFamily: fonter.fet,
    color: farger.tekst,
  },
  lenke: {
    fontSize: 15,
    fontFamily: fonter.fet,
    color: farger.primaerMork,
  },
  bryterRad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
}));
