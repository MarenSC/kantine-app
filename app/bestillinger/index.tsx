import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { BestillingRad } from '../../src/components/BestillingRad';
import { Bunnmeny } from '../../src/components/Bunnmeny';
import { Knapp } from '../../src/components/Knapp';
import { TomTilstand } from '../../src/components/TomTilstand';
import { useBestilling } from '../../src/context/BestillingContext';
import { useInnstillinger } from '../../src/context/InnstillingerContext';
import { useNaa } from '../../src/hooks/useNaa';
import { t } from '../../src/i18n';
import { avstand, farger, lagStiler, radius, skrift } from '../../src/theme';
import { gaaHjem } from '../../src/utils/navigasjon';
import { hentStatus } from '../../src/utils/status';

/** Aktive bestillinger. Tidligere (hentet/levert) ligger bak en egen knapp. */
export default function BestillingerSkjerm() {
  useInnstillinger(); // tegnes på nytt når språk eller tema byttes
  const { bestillinger } = useBestilling();
  const naa = useNaa();

  const medStatus = bestillinger.map((b) => ({ bestilling: b, status: hentStatus(b, naa) }));
  const aktive = medStatus.filter((x) => x.status.steg !== 'utlevert');
  const antallTidligere = medStatus.length - aktive.length;

  const tidligereKnapp =
    antallTidligere > 0 ? (
      <Pressable
        onPress={() => router.push('/bestillinger/tidligere')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.tidligere, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="time-outline" size={22} color={farger.primaerMork} />
        <View style={styles.flex}>
          <Text style={skrift.fet}>{t('Tidligere bestillinger')}</Text>
          <Text style={skrift.liten}>
            {t(antallTidligere === 1 ? '{antall} bestilling med kvittering' : '{antall} bestillinger med kvittering', { antall: antallTidligere })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={farger.primaerMork} />
      </Pressable>
    ) : null;

  return (
    <View style={styles.skjerm}>
      {aktive.length === 0 ? (
        <View style={styles.flex}>
          <TomTilstand
            ikon="receipt-outline"
            tittel={t('Ingen aktive bestillinger')}
            tekst={t('Når du reserverer eller bestiller mat, ser du statusen her.')}
          >
            <Knapp tittel={t('Se kantiner')} variant="sekundaer" onPress={() => gaaHjem()} />
          </TomTilstand>
          {tidligereKnapp ? <View style={styles.tidligereBunn}>{tidligereKnapp}</View> : null}
        </View>
      ) : (
        <FlatList
          data={aktive}
          keyExtractor={(x) => x.bestilling.id}
          contentContainerStyle={styles.liste}
          ListHeaderComponent={<Text style={styles.overskrift}>{t('Aktive')} ({aktive.length})</Text>}
          ItemSeparatorComponent={() => <View style={{ height: avstand.m }} />}
          renderItem={({ item }) => <BestillingRad bestilling={item.bestilling} status={item.status} />}
          ListFooterComponent={tidligereKnapp ? <View style={styles.tidligereListe}>{tidligereKnapp}</View> : undefined}
        />
      )}
      <Bunnmeny />
    </View>
  );
}

const styles = lagStiler(() => ({
  skjerm: {
    flex: 1,
    backgroundColor: farger.bakgrunn,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  liste: {
    padding: avstand.l,
  },
  overskrift: {
    ...skrift.etikett,
    marginBottom: avstand.m,
  },
  tidligere: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: avstand.m,
    padding: avstand.l,
    borderRadius: radius.l,
    backgroundColor: farger.primaerLys,
  },
  tidligereListe: {
    marginTop: avstand.xl,
  },
  tidligereBunn: {
    padding: avstand.l,
  },
}));
