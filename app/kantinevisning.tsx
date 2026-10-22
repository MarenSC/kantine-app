import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Knapp } from '../src/components/Knapp';
import { Merkelapp } from '../src/components/Merkelapp';
import { Stjerner } from '../src/components/TilbakemeldingSkjema';
import { TomTilstand } from '../src/components/TomTilstand';
import { Valgbrikke } from '../src/components/Valgbrikke';
import { useBestilling } from '../src/context/BestillingContext';
import { hentKantine } from '../src/data/kantiner';
import { useNaa } from '../src/hooks/useNaa';
import { avstand, farger, fonter, radius, skrift, skygge } from '../src/theme';
import type { Bestilling, Bestillingssteg } from '../src/types';
import { klokkeslett } from '../src/utils/dato';
import { formaterPris } from '../src/utils/pris';
import { hentStatus, nesteSteg } from '../src/utils/status';

/**
 * Kantinevisning for ansatte.
 * I prototypen ser den bestillingene som er gjort på denne enheten.
 * I en ekte løsning ville bestillingene kommet fra en felles database.
 */

const kolonner: { steg: Bestillingssteg; tittel: string }[] = [
  { steg: 'mottatt', tittel: 'Nye' },
  { steg: 'tilberedes', tittel: 'Tilberedes' },
  { steg: 'klar', tittel: 'Klar' },
];

const knappetekst: Record<Bestillingssteg, string> = {
  mottatt: 'Start tilberedning',
  tilberedes: 'Marker som klar',
  klar: 'Utlevert',
  utlevert: '',
};

export default function KantinevisningSkjerm() {
  const { bestillinger, settStatus } = useBestilling();
  const naa = useNaa(10_000);
  const [kantineFilter, setKantineFilter] = useState<string | null>(null);

  const kantineIder = useMemo(() => [...new Set(bestillinger.map((b) => b.kantineId))], [bestillinger]);
  const synlige = bestillinger.filter((b) => !kantineFilter || b.kantineId === kantineFilter);

  const medStatus = synlige.map((b) => ({ bestilling: b, status: hentStatus(b, naa) }));
  const aktive = medStatus.filter((x) => x.status.steg !== 'utlevert');
  const ferdige = medStatus.filter((x) => x.status.steg === 'utlevert');

  const vurderinger = synlige.flatMap((b) => (b.tilbakemelding ? [b.tilbakemelding.stjerner] : []));
  const snitt = vurderinger.length > 0 ? vurderinger.reduce((a, b) => a + b, 0) / vurderinger.length : null;

  if (bestillinger.length === 0) {
    return (
      <TomTilstand
        ikon="restaurant-outline"
        tittel="Ingen bestillinger ennå"
        tekst="Gjør en bestilling i appen, så dukker den opp her – slik kantina ville sett den."
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.innhold}>
      <View style={styles.nokkeltall}>
        <Nokkeltall tall={String(aktive.length)} tekst="aktive" />
        <Nokkeltall tall={String(ferdige.length)} tekst="utlevert" />
        <Nokkeltall tall={snitt !== null ? snitt.toFixed(1).replace('.', ',') : '–'} tekst="snittvurdering" />
      </View>

      {kantineIder.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtre}>
          <Valgbrikke tekst="Alle kantiner" valgt={kantineFilter === null} onPress={() => setKantineFilter(null)} />
          {kantineIder.map((kid) => (
            <Valgbrikke
              key={kid}
              tekst={hentKantine(kid)?.navn ?? kid}
              valgt={kantineFilter === kid}
              onPress={() => setKantineFilter(kid)}
            />
          ))}
        </ScrollView>
      )}

      {kolonner.map((k) => {
        const iKolonne = aktive.filter((x) => x.status.steg === k.steg);
        return (
          <View key={k.steg} style={styles.kolonne}>
            <Text style={skrift.overskrift}>
              {k.tittel} <Text style={skrift.liten}>({iKolonne.length})</Text>
            </Text>
            {iKolonne.length === 0 ? (
              <Text style={skrift.liten}>Ingen her nå.</Text>
            ) : (
              iKolonne.map(({ bestilling, status }) => (
                <Ordrekort
                  key={bestilling.id}
                  bestilling={bestilling}
                  steg={status.steg}
                  onNeste={() => {
                    const neste = nesteSteg(status.steg);
                    if (neste) settStatus(bestilling.id, neste);
                  }}
                />
              ))
            )}
          </View>
        );
      })}

      {ferdige.length > 0 && (
        <View style={styles.kolonne}>
          <Text style={skrift.overskrift}>
            Utlevert <Text style={skrift.liten}>({ferdige.length})</Text>
          </Text>
          {ferdige.map(({ bestilling }) => (
            <View key={bestilling.id} style={[styles.kort, styles.ferdigKort]}>
              <Text style={styles.kode}>#{bestilling.hentekode}</Text>
              <Text style={[skrift.liten, styles.flex]}>
                {hentKantine(bestilling.kantineId)?.navn} · {formaterPris(bestilling.totalpris)}
              </Text>
              {bestilling.tilbakemelding ? <Stjerner antall={bestilling.tilbakemelding.stjerner} storrelse={14} /> : null}
            </View>
          ))}
        </View>
      )}

      <Text style={[skrift.liten, styles.fotnote]}>
        Prototype: viser bestillinger gjort på denne enheten. En ekte løsning ville hentet dem fra en felles database.
      </Text>
    </ScrollView>
  );
}

function Nokkeltall({ tall, tekst }: { tall: string; tekst: string }) {
  return (
    <View style={styles.nokkel}>
      <Text style={styles.nokkelTall}>{tall}</Text>
      <Text style={skrift.liten}>{tekst}</Text>
    </View>
  );
}

function Ordrekort({ bestilling, steg, onNeste }: { bestilling: Bestilling; steg: Bestillingssteg; onNeste: () => void }) {
  const l = bestilling.leveringsmaate;
  const kantine = hentKantine(bestilling.kantineId);

  return (
    <View style={styles.kort}>
      <View style={styles.ordreTopp}>
        <Text style={styles.kode}>#{bestilling.hentekode}</Text>
        <Merkelapp
          tekst={l.type === 'henting' ? `Henting ${klokkeslett(new Date(l.hentetid))}` : 'Levering til bord'}
          variant={l.type === 'henting' ? 'info' : 'dato'}
        />
      </View>
      <Text style={skrift.liten}>
        {kantine?.navn} · bestilt {klokkeslett(new Date(bestilling.opprettet))}
      </Text>
      {l.type === 'levering' ? (
        <View style={styles.infoRad}>
          <Ionicons name="location-outline" size={16} color={farger.primaerMork} />
          <Text style={[skrift.brodtekst, styles.flex]}>{l.plassering}</Text>
        </View>
      ) : null}

      <View style={styles.linjer}>
        {bestilling.linjer.map((linje) => (
          <Text key={linje.vareId} style={skrift.brodtekst}>
            <Text style={skrift.fet}>{linje.antall} ×</Text> {linje.navn}
          </Text>
        ))}
      </View>

      {bestilling.kommentar ? (
        <View style={styles.kommentar}>
          <Ionicons name="chatbubble-outline" size={16} color={farger.dato} />
          <Text style={[styles.kommentarTekst, styles.flex]}>{bestilling.kommentar}</Text>
        </View>
      ) : null}

      <Knapp tittel={knappetekst[steg]} variant={steg === 'klar' ? 'mork' : 'primaer'} onPress={onNeste} />
    </View>
  );
}

const styles = StyleSheet.create({
  innhold: {
    padding: avstand.l,
    gap: avstand.xl,
  },
  nokkeltall: {
    flexDirection: 'row',
    gap: avstand.s + 2,
  },
  nokkel: {
    flex: 1,
    padding: avstand.m,
    borderRadius: radius.l,
    backgroundColor: farger.primaerLys,
    gap: 2,
  },
  nokkelTall: {
    fontFamily: fonter.tittel,
    fontSize: 24,
    color: farger.primaerMork,
  },
  filtre: {
    gap: avstand.s,
  },
  kolonne: {
    gap: avstand.m,
  },
  kort: {
    gap: avstand.s,
    padding: avstand.l,
    borderRadius: radius.l,
    backgroundColor: farger.kort,
    ...skygge,
  },
  ferdigKort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    paddingVertical: avstand.m,
  },
  ordreTopp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kode: {
    fontFamily: fonter.tittel,
    fontSize: 22,
    color: farger.tekst,
  },
  infoRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.s - 2,
  },
  linjer: {
    gap: 2,
    paddingVertical: avstand.xs,
  },
  kommentar: {
    flexDirection: 'row',
    gap: avstand.s - 2,
    padding: avstand.s + 2,
    borderRadius: radius.m,
    backgroundColor: farger.datoLys,
  },
  kommentarTekst: {
    fontFamily: fonter.medium,
    fontSize: 14,
    color: farger.dato,
  },
  flex: {
    flex: 1,
  },
  fotnote: {
    textAlign: 'center',
  },
});
