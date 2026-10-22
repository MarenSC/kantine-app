import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BestillingProvider } from '../src/context/BestillingContext';
import { farger } from '../src/theme';

/**
 * Rot-layout: pakker hele appen inn i BestillingProvider (handlekurv og
 * bestillinger) og setter opp navigasjonen mellom skjermene.
 */
export default function RootLayout() {
  return (
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
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Velg kantine' }} />
        <Stack.Screen name="kantine/[id]" options={{ title: 'Meny' }} />
        <Stack.Screen name="handlekurv" options={{ title: 'Handlekurv' }} />
        <Stack.Screen name="bestillinger/index" options={{ title: 'Mine bestillinger' }} />
        <Stack.Screen name="bestillinger/[id]" options={{ title: 'Bestilling' }} />
      </Stack>
    </BestillingProvider>
  );
}
