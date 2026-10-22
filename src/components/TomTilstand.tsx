import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { avstand, farger, skrift } from '../theme';

interface Props {
  ikon: ComponentProps<typeof Ionicons>['name'];
  tittel: string;
  tekst?: string;
  children?: ReactNode;
}

/** Vises når en liste er tom, f.eks. tom handlekurv. */
export function TomTilstand({ ikon, tittel, tekst, children }: Props) {
  return (
    <View style={styles.beholder}>
      <Ionicons name={ikon} size={48} color={farger.tekstDempet} />
      <Text style={[skrift.overskrift, styles.midtstilt]}>{tittel}</Text>
      {tekst ? <Text style={[skrift.liten, styles.midtstilt]}>{tekst}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  beholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: avstand.xxl,
    gap: avstand.m,
  },
  midtstilt: {
    textAlign: 'center',
  },
});
