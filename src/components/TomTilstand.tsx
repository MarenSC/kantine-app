import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { avstand, farger, radius, skrift } from '../theme';

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
      <View style={styles.ikon}>
        <Ionicons name={ikon} size={34} color={farger.primaerMork} />
      </View>
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
  ikon: {
    width: 76,
    height: 76,
    borderRadius: radius.rund,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
