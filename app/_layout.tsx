import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProfilKnapp } from '../src/components/ProfilKnapp';
import { BestillingProvider } from '../src/context/BestillingContext';
import { BrukerProvider } from '../src/context/BrukerContext';
import { farger } from '../src/theme';

/**
 * Rot-layout: gir hele appen tilgang til innlogget bruker (BrukerProvider)
 * og handlekurv/bestillinger (BestillingProvider), og setter opp navigasjonen.
 */
export default function RootLayout() {
  return (
    <BrukerProvider>
      <BestillingProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: farger.kort },
            headerTintColor: farger.primaer,
            headerTitleStyle: { color: farger.tekst, fontWeight: '600' },
            headerShadowVisible: false,
            headerBackTitle: 'Tilbake',
            contentStyle: { backgroundColor: farger.bakgrunn },
            // Profilikonet øverst til høyre på alle skjermer
            headerRight: () => <ProfilKnapp />,
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Velg kantine' }} />
          <Stack.Screen name="kantine/[id]" options={{ title: 'Meny' }} />
          <Stack.Screen name="handlekurv" options={{ title: 'Handlekurv' }} />
          <Stack.Screen name="bestillinger/index" options={{ title: 'Mine bestillinger' }} />
          <Stack.Screen name="bestillinger/[id]" options={{ title: 'Bestilling' }} />
          <Stack.Screen name="min-side" options={{ title: 'Min side', headerRight: () => null }} />
        </Stack>
      </BestillingProvider>
    </BrukerProvider>
  );
}
