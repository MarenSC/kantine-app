import { FlatList, View } from 'react-native';

import { BestillingRad } from '../../src/components/BestillingRad';
import { TomTilstand } from '../../src/components/TomTilstand';
import { useBestilling } from '../../src/context/BestillingContext';
import { useInnstillinger } from '../../src/context/InnstillingerContext';
import { useNaa } from '../../src/hooks/useNaa';
import { t } from '../../src/i18n';
import { avstand, farger, lagStiler } from '../../src/theme';
import { hentStatus } from '../../src/utils/status';

/** Bestillinger som er hentet eller levert. Trykk for å se kvitteringen. */
export default function TidligereBestillingerSkjerm() {
  useInnstillinger(); // tegnes på nytt når språk eller tema byttes
  const { bestillinger } = useBestilling();
  const naa = useNaa();

  const tidligere = bestillinger
    .map((b) => ({ bestilling: b, status: hentStatus(b, naa) }))
    .filter((x) => x.status.steg === 'utlevert');

  if (tidligere.length === 0) {
    return <TomTilstand ikon="time-outline" tittel={t('Ingen tidligere bestillinger')} />;
  }

  return (
    <FlatList
      style={styles.skjerm}
      data={tidligere}
      keyExtractor={(x) => x.bestilling.id}
      contentContainerStyle={styles.liste}
      ItemSeparatorComponent={() => <View style={{ height: avstand.m }} />}
      renderItem={({ item }) => <BestillingRad bestilling={item.bestilling} status={item.status} visDato />}
    />
  );
}

const styles = lagStiler(() => ({
  skjerm: {
    backgroundColor: farger.bakgrunn,
  },
  liste: {
    padding: avstand.l,
  },
}));
