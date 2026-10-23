import {
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ProfilKnapp } from '../src/components/ProfilKnapp';
import { StatusVarsel } from '../src/components/StatusVarsel';
import { BestillingProvider } from '../src/context/BestillingContext';
import { BrukerProvider } from '../src/context/BrukerContext';
import { InnstillingerProvider, useInnstillinger } from '../src/context/InnstillingerContext';
import { MAKS_BREDDE, farger, fonter, lagStiler } from '../src/theme';

// Vis splash-skjermen til skriftene er lastet, så teksten ikke "hopper".
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Rot-layout: laster skriftene, gir hele appen tilgang til innlogget bruker
 * og handlekurv/bestillinger, og setter opp navigasjonen.
 */
export default function RootLayout() {
  const [lastet, feil] = useFonts({
    BricolageGrotesque_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (lastet || feil) SplashScreen.hideAsync().catch(() => {});
  }, [lastet, feil]);

  // Hvis skriftene ikke kan lastes, vises appen med systemskrift i stedet.
  if (!lastet && !feil) return null;

  return (
    <InnstillingerProvider>
      <BrukerProvider>
        <BestillingProvider>
          <Navigasjon />
        </BestillingProvider>
      </BrukerProvider>
    </InnstillingerProvider>
  );
}

/** Navigasjonen. Ligger inni InnstillingerProvider så den tegnes på nytt ved bytte av tema/språk. */
function Navigasjon() {
  const { erMork, t } = useInnstillinger();

  return (
    <>
      <StatusBar style={erMork ? 'light' : 'dark'} />
      {/* På brede skjermer vises appen i en sentrert kolonne */}
      <View style={styles.ramme}>
        <View style={styles.app}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: farger.bakgrunn },
              headerTintColor: farger.tekst,
              headerTitleStyle: { color: farger.tekst, fontFamily: fonter.tittel, fontSize: 18 },
              headerShadowVisible: false,
              headerBackTitle: t('Tilbake'),
              contentStyle: { backgroundColor: farger.bakgrunn },
              // Profilikonet øverst til høyre på alle skjermer
              headerRight: () => <ProfilKnapp />,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false, title: t('Hjem') }} />
            <Stack.Screen name="kantine/[id]" options={{ headerShown: false, title: t('Meny') }} />
            <Stack.Screen name="handlekurv" options={{ title: t('Handlekurv') }} />
            <Stack.Screen name="bestillinger/index" options={{ title: t('Mine bestillinger') }} />
            <Stack.Screen name="bestillinger/tidligere" options={{ title: t('Tidligere bestillinger') }} />
            <Stack.Screen name="bestillinger/[id]" options={{ title: t('Bestilling') }} />
            <Stack.Screen name="min-side" options={{ title: t('Min side'), headerRight: () => null }} />
            <Stack.Screen name="innstillinger" options={{ title: t('Innstillinger') }} />
          </Stack>
          {/* Flytende status på aktiv bestilling, over alle skjermer */}
          <StatusVarsel />
        </View>
      </View>
    </>
  );
}

const styles = lagStiler(() => ({
  ramme: {
    flex: 1,
    backgroundColor: farger.ramme,
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: MAKS_BREDDE,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: farger.bakgrunn,
  },
}));
