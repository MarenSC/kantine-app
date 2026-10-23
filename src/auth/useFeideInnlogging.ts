import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';

import { t } from '../i18n';
import type { Student } from '../types';
import { FEIDE_CONFIG } from './feide';

// Lukker innloggingsvinduet riktig når Feide sender brukeren tilbake (trengs på web).
WebBrowser.maybeCompleteAuthSession();

/**
 * Ekte innlogging med Feide via OpenID Connect (authorization code + PKCE).
 * Brukes bare når FEIDE_CONFIG.clientId er fylt ut.
 */
export function useFeideInnlogging(onInnlogget: (student: Student) => void) {
  const discovery = AuthSession.useAutoDiscovery(FEIDE_CONFIG.issuer);
  const redirectUri = AuthSession.makeRedirectUri({ scheme: FEIDE_CONFIG.scheme, path: 'auth' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: FEIDE_CONFIG.clientId,
      scopes: [...FEIDE_CONFIG.scopes],
      redirectUri,
      usePKCE: true,
    },
    discovery,
  );

  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  // Ref, slik at effekten under ikke kjøres på nytt hver gang funksjonen endres.
  const onInnloggetRef = useRef(onInnlogget);
  useEffect(() => {
    onInnloggetRef.current = onInnlogget;
  }, [onInnlogget]);

  useEffect(() => {
    console.log('Feide redirect URI:', redirectUri);
  }, [redirectUri]);

  useEffect(() => {
    if (!response) return;

    if (response.type !== 'success') {
      if (response.type === 'error') setFeil(t('Innloggingen ble avbrutt eller feilet.'));
      setLaster(false);
      return;
    }
    if (!discovery || !request?.codeVerifier) return;

    let avbrutt = false;

    (async () => {
      try {
        const token = await AuthSession.exchangeCodeAsync(
          {
            clientId: FEIDE_CONFIG.clientId,
            code: response.params.code,
            redirectUri,
            extraParams: { code_verifier: request.codeVerifier ?? '' },
          },
          discovery,
        );
        const info = await AuthSession.fetchUserInfoAsync({ accessToken: token.accessToken }, discovery);

        if (!avbrutt) {
          onInnloggetRef.current({
            id: String(info.sub),
            navn: typeof info.name === 'string' ? info.name : 'Student',
            epost: typeof info.email === 'string' ? info.email : undefined,
            innloggetMed: 'feide',
          });
        }
      } catch {
        if (!avbrutt) setFeil(t('Kunne ikke fullføre innloggingen. Prøv igjen.'));
      } finally {
        if (!avbrutt) setLaster(false);
      }
    })();

    return () => {
      avbrutt = true;
    };
  }, [response, discovery, request, redirectUri]);

  async function start() {
    setFeil(null);
    setLaster(true);
    const resultat = await promptAsync();
    if (resultat.type !== 'success') setLaster(false);
  }

  return { start, klar: !!request, laster, feil };
}
