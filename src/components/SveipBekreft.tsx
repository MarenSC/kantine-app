import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Animated, PanResponder, Platform, View, type LayoutChangeEvent } from 'react-native';

import { t } from '../i18n';
import { farger, fonter, lagStiler, radius } from '../theme';

const KNOTT = 56;
const KANT = 4;
/** Hvor langt (andel av sporet) man må dra før det teller som bekreftet */
const TERSKEL = 0.85;

interface Props {
  tekst: string;
  onBekreft: () => void;
}

/**
 * "Sveip for å bekrefte". Studenten drar knotten helt til høyre,
 * så det ikke skjer ved et uhell. Skjermlesere kan aktivere den som en vanlig knapp.
 */
export function SveipBekreft({ tekst, onBekreft }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const maksRef = useRef(0);
  const [ferdig, setFerdig] = useState(false);
  const ferdigRef = useRef(false);
  const onBekreftRef = useRef(onBekreft);
  onBekreftRef.current = onBekreft;
  const animer = Platform.OS !== 'web';

  function fullfor() {
    if (ferdigRef.current) return;
    ferdigRef.current = true;
    setFerdig(true);
    Animated.timing(x, { toValue: maksRef.current, duration: 120, useNativeDriver: animer }).start(() =>
      onBekreftRef.current(),
    );
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !ferdigRef.current,
      onMoveShouldSetPanResponder: (_e, g) => !ferdigRef.current && Math.abs(g.dx) > 4,
      // Ikke la en ScrollView "stjele" sveipet midt i bevegelsen
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_e, g) => x.setValue(Math.max(0, Math.min(maksRef.current, g.dx))),
      onPanResponderRelease: (_e, g) => {
        if (maksRef.current > 0 && g.dx >= maksRef.current * TERSKEL) {
          fullfor();
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: animer, bounciness: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(x, { toValue: 0, useNativeDriver: animer }).start();
      },
    }),
  ).current;

  function vedLayout(e: LayoutChangeEvent) {
    maksRef.current = Math.max(0, e.nativeEvent.layout.width - KNOTT - KANT * 2);
  }

  // Teksten tones ut etter hvert som knotten dras
  const tekstOpasitet = x.interpolate({ inputRange: [0, 120], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <View
      style={[styles.spor, ferdig && styles.sporFerdig]}
      onLayout={vedLayout}
      accessible
      accessibilityRole="button"
      accessibilityLabel={tekst}
      accessibilityHint={t('Dobbelttrykk for å bekrefte')}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'activate') fullfor();
      }}
    >
      <Animated.Text style={[styles.tekst, { opacity: tekstOpasitet }]} numberOfLines={1}>
        {tekst}
      </Animated.Text>
      <Animated.View style={[styles.knott, { transform: [{ translateX: x }] }]} {...pan.panHandlers}>
        <Ionicons name={ferdig ? 'checkmark' : 'arrow-forward'} size={26} color={farger.primaer} />
      </Animated.View>
    </View>
  );
}

const styles = lagStiler(() => ({
  spor: {
    height: KNOTT + KANT * 2,
    borderRadius: radius.rund,
    backgroundColor: farger.primaer,
    padding: KANT,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sporFerdig: {
    backgroundColor: farger.suksess,
  },
  tekst: {
    position: 'absolute',
    left: KNOTT + KANT * 2,
    right: KNOTT / 2,
    textAlign: 'center',
    fontFamily: fonter.fet,
    fontSize: 16,
    color: farger.hvit,
  },
  knott: {
    width: KNOTT,
    height: KNOTT,
    borderRadius: radius.rund,
    backgroundColor: farger.hvit,
    alignItems: 'center',
    justifyContent: 'center',
    // Hindrer at nettleseren markerer tekst mens man drar med musa
    userSelect: 'none',
    cursor: 'grab',
  },
}));
