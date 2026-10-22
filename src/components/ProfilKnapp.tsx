import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useBruker } from '../context/BrukerContext';
import { avstand, farger, radius } from '../theme';

/** "Tom Nordmann" -> "TN" */
export function initialer(navn: string): string {
  return navn
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((del) => del[0]?.toUpperCase() ?? '')
    .join('');
}

/** Ikonet øverst til høyre som åpner Min Side. */
export function ProfilKnapp() {
  const { student } = useBruker();

  return (
    <Pressable
      onPress={() => router.push('/min-side')}
      accessibilityRole="button"
      accessibilityLabel="Min side"
      hitSlop={10}
      style={styles.knapp}
    >
      {student ? (
        <View style={styles.avatar}>
          <Text style={styles.initialer}>{initialer(student.navn)}</Text>
        </View>
      ) : (
        <Ionicons name="person-circle-outline" size={28} color={farger.primaer} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knapp: {
    padding: avstand.xs,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialer: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
