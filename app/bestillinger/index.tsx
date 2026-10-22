import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Knapp } from '../../src/components/Knapp';
import { Merkelapp } from '../../src/components/Merkelapp';
import { TomTilstand } from '../../src/components/TomTilstand';
import { useBestilling } from '../../src/context/BestillingContext';
import { hentKantine } from '../../src/data/kantiner';
import { useNaa } from '../../src/hooks/useNaa';
import { avstand, farger, radius, skrift, skygge } from '../../src/theme';
import { klokkeslett } from '../../src/utils/dato';
import { formaterPris } from '../../src/utils/pris';
import { hentStatus } from '../../src/utils/status';

/** Oversikt over bestillingene studenten har gjort. */
export default function BestillingerSkjerm() {
  const { bestillinger } = useBestilling();
  const naa = useNaa();

  if (bestillinger.length === 0) {
    return (
      <TomTilstand
        ikon="receipt-outline"
        tittel="Ingen bestillinger ennå"
        tekst="Når du reserverer eller bestiller mat, dukker det opp her."
      >
        <Knapp tittel="Se kantiner" variant="sekundaer" onPress={() => router.dismissTo('/')} />
      </TomTilstand>
    );
  }

  return (
    <FlatList
      data={bestillinger}
      keyExtractor={(b) => b.id}
      contentContainerStyle={styles.liste}
      ItemSeparatorComponent={() => <View style={{ height: avstand.m }} />}
      renderItem={({ item }) => {
        const status = hentStatus(item, naa);
        const antallVarer = item.linjer.reduce((sum, l) => sum + l.antall, 0);

        return (
          <Pressable
            onPress={() => router.push({ pathname: '/bestillinger/[id]', params: { id: item.id } })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.kort, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.tekst}>
              <Text style={skrift.overskrift}>{hentKantine(item.kantineId)?.navn ?? 'Kantine'}</Text>
              <Text style={skrift.liten}>
                Bestilt {klokkeslett(new Date(item.opprettet))} · {antallVarer}{' '}
                {antallVarer === 1 ? 'vare' : 'varer'} · {formaterPris(item.totalpris)}
              </Text>
              <Merkelapp tekst={status.tekst} variant={status.ferdig ? 'suksess' : 'info'} />
            </View>
            <Ionicons name="chevron-forward" size={20} color={farger.tekstDempet} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  liste: {
    padding: avstand.l,
  },
  kort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    padding: avstand.l,
    backgroundColor: farger.kort,
    borderRadius: radius.l,
    ...skygge,
  },
  tekst: {
    flex: 1,
    gap: avstand.xs,
  },
});
