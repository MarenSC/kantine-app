/**
 * Designsystemet "Terrakotta": farger, skrifter, avstander og runding.
 * Endre her, så endres utseendet i hele appen.
 *
 * Prinsipper:
 *  - Terrakotta (primaer) bare på knapper og små detaljer.
 *  - Store flater får lys sand (primaerLys) med mørk terrakotta-tekst (primaerMork).
 *  - Varm mørk brun i stedet for svart.
 *  - Salviegrønt og rav bare for status (åpent/klar, allergier).
 */

export const farger = {
  primaer: '#B9473A',
  primaerLys: '#F5E2D8',
  primaerMork: '#8F3B2B',
  tekst: '#33281F',
  tekstDempet: '#6B6052',
  bakgrunn: '#FBF6F0',
  kort: '#FFFFFF',
  kant: '#E6DCCF',
  morkFlate: '#33281F',
  hvit: '#FFFFFF',
  /** Stengt, feil */
  tilbud: '#8F3B2B',
  tilbudLys: '#F5E2D8',
  /** Allergier og datorabatt */
  dato: '#7A4A00',
  datoLys: '#FFF1D6',
  /** Åpent, klar */
  suksess: '#3D5A35',
  suksessLys: '#DDE6D5',
  deaktivert: '#CFC5B8',
} as const;

/** Navnene må stemme med det som lastes i app/_layout.tsx */
export const fonter = {
  tittel: 'BricolageGrotesque_800ExtraBold',
  vanlig: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  fet: 'DMSans_700Bold',
} as const;

export const avstand = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  s: 8,
  m: 14,
  l: 20,
  xl: 26,
  rund: 999,
} as const;

/** Myk skygge for kort */
export const skygge = {
  shadowColor: '#33281F',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

export const skrift = {
  stor: { fontFamily: fonter.tittel, fontSize: 32, color: farger.tekst, letterSpacing: -0.8 },
  tittel: { fontFamily: fonter.tittel, fontSize: 24, color: farger.tekst, letterSpacing: -0.4 },
  overskrift: { fontFamily: fonter.tittel, fontSize: 19, color: farger.tekst },
  pris: { fontFamily: fonter.tittel, fontSize: 16, color: farger.tekst },
  brodtekst: { fontFamily: fonter.vanlig, fontSize: 15, color: farger.tekst },
  fet: { fontFamily: fonter.fet, fontSize: 15, color: farger.tekst },
  liten: { fontFamily: fonter.vanlig, fontSize: 13, color: farger.tekstDempet },
  etikett: {
    fontFamily: fonter.fet,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: farger.tekstDempet,
  },
};
