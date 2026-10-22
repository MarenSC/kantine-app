import {
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ProfilKnapp } from '../src/components/ProfilKnapp';
import { BestillingProvider } from '../src/context/BestillingContext';
import { BrukerProvider } from '../src/context/BrukerContext';
import { erMorkModus, farger, fonter } from '../src/theme';

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
    <BrukerProvider>
      <BestillingProvider>
        <StatusBar style={erMorkModus ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: farger.bakgrunn },
            headerTintColor: farger.tekst,
            headerTitleStyle: { color: farger.tekst, fontFamily: fonter.tittel, fontSize: 18 },
            headerShadowVisible: false,
            headerBackTitle: 'Tilbake',
            contentStyle: { backgroundColor: farger.bakgrunn },
            // Profilikonet øverst til høyre på alle skjermer
            headerRight: () => <ProfilKnapp />,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false, title: 'Hjem' }} />
          <Stack.Screen name="kantine/[id]" options={{ headerShown: false, title: 'Meny' }} />
          <Stack.Screen name="handlekurv" options={{ title: 'Handlekurv' }} />
          <Stack.Screen name="bestillinger/index" options={{ title: 'Mine bestillinger' }} />
          <Stack.Screen name="bestillinger/[id]" options={{ title: 'Bestilling' }} />
          <Stack.Screen name="min-side" options={{ title: 'Min side', headerRight: () => null }} />
          <Stack.Screen name="kantinevisning" options={{ title: 'Kantinevisning', headerRight: () => null }} />
        </Stack>
      </BestillingProvider>
    </BrukerProvider>
  );
}
