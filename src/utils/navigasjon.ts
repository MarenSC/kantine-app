import { router, type Href } from 'expo-router';

/**
 * Går til startsiden og rydder bort skjermene som ligger "under".
 * Virker også når noen har åpnet en lenke rett til en underside
 * (f.eks. /min-side på nett), der det ikke finnes noen side å gå tilbake til.
 */
export function gaaHjem() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/');
}

/**
 * Bytter mellom hovedsidene i bunnmenyen (Hjem, Bestillinger, Min side).
 * Fra startsiden legges siden oppå, ellers erstattes den, slik at
 * historikken ikke vokser hver gang man bytter.
 */
export function gaaTilHovedside(href: Href, fraStartsiden: boolean) {
  if (href === '/') {
    gaaHjem();
  } else if (fraStartsiden) {
    router.push(href);
  } else {
    router.replace(href);
  }
}
