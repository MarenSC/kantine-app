import { Text, View } from 'react-native';

import { feideErKonfigurert } from '../auth/feide';
import { useFeideInnlogging } from '../auth/useFeideInnlogging';
import { DEMO_STUDENT, useBruker } from '../context/BrukerContext';
import { t } from '../i18n';
import { avstand, farger, fonter, lagStiler, skrift } from '../theme';
import { Knapp } from './Knapp';

/**
 * "Logg inn med Feide"-knapp.
 * Bruker ekte Feide når client ID er satt i src/auth/feide.ts, ellers demo.
 */
export function FeideLoggInnKnapp() {
  return feideErKonfigurert ? <EkteFeideKnapp /> : <DemoFeideKnapp />;
}

function DemoFeideKnapp() {
  const { loggInn } = useBruker();

  return (
    <View style={styles.beholder}>
      <Knapp tittel={t('Logg inn med Feide')} onPress={() => loggInn(DEMO_STUDENT)} />
      <Text style={[skrift.liten, styles.midtstilt]}>
        {t('Demo: Du logges inn som en testbruker. Ekte Feide-innlogging kobles på senere.')}
      </Text>
    </View>
  );
}

function EkteFeideKnapp() {
  const { loggInn } = useBruker();
  const { start, klar, laster, feil } = useFeideInnlogging(loggInn);

  return (
    <View style={styles.beholder}>
      <Knapp
        tittel={laster ? t('Logger inn …') : t('Logg inn med Feide')}
        onPress={start}
        deaktivert={!klar || laster}
      />
      {feil ? <Text style={[styles.feil, styles.midtstilt]}>{feil}</Text> : null}
    </View>
  );
}

const styles = lagStiler(() => ({
  beholder: {
    alignSelf: 'stretch',
    gap: avstand.s,
  },
  midtstilt: {
    textAlign: 'center',
  },
  feil: {
    color: farger.tilbud,
    fontFamily: fonter.medium,
    fontSize: 14,
  },
}));
