import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useBruker } from '../context/BrukerContext';
import { useInnstillinger } from '../context/InnstillingerContext';
import { avstand, farger, fonter, lagStiler, radius } from '../theme';

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
  const { t } = useInnstillinger();
  const { student } = useBruker();

  return (
    <Pressable
      onPress={() => router.push('/min-side')}
      accessibilityRole="button"
      accessibilityLabel={t('Min side')}
      hitSlop={10}
      style={styles.knapp}
    >
      {student ? (
        <View style={styles.avatar}>
          <Text style={styles.initialer}>{initialer(student.navn)}</Text>
        </View>
      ) : (
        <Ionicons name="person-circle-outline" size={32} color={farger.tekst} />
      )}
    </Pressable>
  );
}

const styles = lagStiler(() => ({
  knapp: {
    padding: avstand.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.rund,
    backgroundColor: farger.morkFlate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialer: {
    color: farger.hvit,
    fontSize: 13,
    fontFamily: fonter.fet,
  },
}));
