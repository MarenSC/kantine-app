import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { FeideLoggInnKnapp } from '../src/components/FeideLoggInnKnapp';
import { Knapp } from '../src/components/Knapp';
import { Merkelapp } from '../src/components/Merkelapp';
import { initialer } from '../src/components/ProfilKnapp';
import { Valgbrikke } from '../src/components/Valgbrikke';
import { useBestilling } from '../src/context/BestillingContext';
import { useBruker } from '../src/context/BrukerContext';
import { hentKantine, kantiner } from '../src/data/kantiner';
import { useNaa } from '../src/hooks/useNaa';
import { avstand, farger, radius, skrift } from '../src/theme';
import { klokkeslett } from '../src/utils/dato';
import { alleAllergener } from '../src/utils/kosthold';
import { formaterPris } from '../src/utils/pris';
import { hentStatus } from '../src/utils/status';

/** Min Side: profil, bestillinger, kosthold og favorittkantine. */
export default function MinSideSkjerm() {
  const { student, lastet } = useBruker();

  if (!lastet) {
    return (
      <View style={styles.midten}>
        <ActivityIndicator color={farger.primaer} />
      </View>
    );
  }

  return student ? <InnloggetVisning /> : <LoggInnVisning />;
}

// ---------- Ikke innlogget ----------

function LoggInnVisning() {
  return (
    <View style={styles.midten}>
      <View style={styles.loggInnIkon}>
        <Ionicons name="person" size={40} color={farger.primaer} />
      </View>
      <Text style={[skrift.tittel, styles.midtstilt]}>Logg inn</Text>
      <Text style={[skrift.brodtekst, styles.midtstilt, { color: farger.tekstDempet }]}>
        Logg inn med Feide-brukeren din fra OsloMet for å bestille mat og lagre allergier og
        favorittkantine.
      </Text>
      <FeideLoggInnKnapp />
    </View>
  );
}

// ---------- Innlogget ----------

function InnloggetVisning() {
  const { student, preferanser, loggUt, settVegetar, vekslAllergen, settFavoritt } = useBruker();
  const { bestillinger } = useBestilling();
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
            tekst={student.innloggetMed === 'feide' ? 'Innlogget med Feide' : 'Demobruker'}
            variant={student.innloggetMed === 'feide' ? 'suksess' : 'info'}
          />
        </View>
      </View>

      {/* Bestillinger */}
      <Seksjon tittel="Mine bestillinger">
        {sisteBestillinger.length === 0 ? (
          <Text style={skrift.liten}>Du har ingen bestillinger ennå.</Text>
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
                  <Text style={styles.radTittel}>{hentKantine(b.kantineId)?.navn ?? 'Kantine'}</Text>
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
            <Text style={styles.lenke}>Se alle bestillinger ({bestillinger.length})</Text>
          </Pressable>
        ) : null}
      </Seksjon>

      {/* Kosthold */}
      <Seksjon
        tittel="Allergier og kosthold"
        undertekst="Varer som ikke passer for deg blir markert i menyen."
      >
        <View style={styles.bryterRad}>
          <Text style={skrift.brodtekst}>Vegetar</Text>
          <Switch
            value={preferanser.vegetar}
            onValueChange={settVegetar}
            trackColor={{ true: farger.primaer, false: farger.kant }}
            accessibilityLabel="Vegetar"
          />
        </View>
        <Text style={styles.etikett}>Jeg vil unngå</Text>
        <View style={styles.brikker}>
          {alleAllergener.map((allergen) => (
            <Valgbrikke
              key={allergen}
              tekst={allergen}
              valgt={preferanser.allergener.includes(allergen)}
              onPress={() => vekslAllergen(allergen)}
            />
          ))}
        </View>
      </Seksjon>

      {/* Favoritt */}
      <Seksjon tittel="Favorittkantine" undertekst="Vises øverst på startsiden.">
        <View style={styles.brikker}>
          <Valgbrikke
            tekst="Ingen"
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

      <Knapp tittel="Logg ut" variant="sekundaer" onPress={loggUt} />
    </ScrollView>
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

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: farger.kant,
    padding: avstand.l,
    gap: avstand.m,
  },
  profil: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTekst: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
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
    fontWeight: '600',
    color: farger.tekst,
  },
  lenke: {
    fontSize: 15,
    fontWeight: '600',
    color: farger.primaer,
  },
  bryterRad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etikett: {
    fontSize: 14,
    fontWeight: '600',
    color: farger.tekst,
  },
  brikker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: avstand.s,
  },
});
