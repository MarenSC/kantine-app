import { useEffect, useState } from 'react';

/**
 * Gir nåværende tidspunkt og oppdaterer det jevnlig,
 * slik at f.eks. bestillingsstatus endrer seg på skjermen.
 */
export function useNaa(intervallMs = 15_000): Date {
  const [naa, setNaa] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNaa(new Date()), intervallMs);
    return () => clearInterval(timer);
  }, [intervallMs]);

  return naa;
}
