import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Image, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

import { farger, lagStiler, radius } from '../theme';

interface Props {
  bilde?: ImageSourcePropType;
  /** cover = fyller feltet (matbilder), contain = hele bildet vises (pakninger) */
  tilpasning?: 'cover' | 'contain';
  style?: StyleProp<ViewStyle>;
  /** Legges oppå bildet, f.eks. en rabatt-merkelapp */
  children?: ReactNode;
}

/** Bilde av en vare. Uten bilde vises en rolig sandfarget flate med et ikon. */
export function VareBilde({ bilde, tilpasning = 'cover', style, children }: Props) {
  return (
    <View style={[styles.ramme, tilpasning === 'contain' && styles.lysRamme, style]}>
      {bilde ? (
        <Image source={bilde} style={styles.bilde} resizeMode={tilpasning} accessibilityIgnoresInvertColors />
      ) : (
        <Ionicons name="restaurant-outline" size={26} color={farger.primaerMork} />
      )}
      {children}
    </View>
  );
}

const styles = lagStiler(() => ({
  ramme: {
    overflow: 'hidden',
    borderRadius: radius.m,
    backgroundColor: farger.primaerLys,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lysRamme: {
    backgroundColor: farger.bakgrunn,
  },
  bilde: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
}));
