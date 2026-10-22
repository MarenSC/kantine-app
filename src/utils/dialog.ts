import { Alert, Platform } from 'react-native';

/**
 * Dialoger som virker både i appen og på nett.
 * (Alert.alert med knapper gjør ingenting i nettleseren, så der brukes
 * nettleserens egne confirm/alert i stedet.)
 */

/** Spør brukeren om å bekrefte. Kaller onJa hvis brukeren sier ja. */
export function bekreft(tittel: string, melding: string, jaTekst: string, onJa: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${tittel}\n\n${melding}`)) onJa();
    return;
  }
  Alert.alert(tittel, melding, [
    { text: 'Avbryt', style: 'cancel' },
    { text: jaTekst, style: 'destructive', onPress: onJa },
  ]);
}

/** Viser en enkel melding med OK-knapp. */
export function visMelding(tittel: string, melding: string) {
  if (Platform.OS === 'web') {
    window.alert(`${tittel}\n\n${melding}`);
    return;
  }
  Alert.alert(tittel, melding);
}
