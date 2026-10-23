import { Appearance } from 'react-native';

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

/** Lyst tema (standard) */
const lys = {
  primaer: '#B9473A',
  primaerLys: '#F5E2D8',
  primaerMork: '#8F3B2B',
  tekst: '#33281F',
  tekstDempet: '#6B6052',
  bakgrunn: '#FBF6F0',
  kort: '#FFFFFF',
  kant: '#E6DCCF',
  morkFlate: '#33281F',
  /** Tekst som står på morkFlate */
  paaMork: '#FBF6F0',
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
  /** Flaten rundt appen på brede skjermer (nettbrett, PC) */
  ramme: '#EDE3D6',
};

type Palett = Record<keyof typeof lys, string>;

/** Mørkt tema – brukes når telefonen/nettleseren står i mørk modus */
const mork: Palett = {
  primaer: '#B9473A',
  primaerLys: '#4A2B24',
  primaerMork: '#F4B4A6',
  tekst: '#F3ECE4',
  tekstDempet: '#B5A797',
  bakgrunn: '#1C1714',
  kort: '#28211C',
  kant: '#3F352E',
  morkFlate: '#463A31',
  paaMork: '#F3ECE4',
  hvit: '#FFFFFF',
  tilbud: '#F4B4A6',
  tilbudLys: '#4A2B24',
  dato: '#F2C46B',
  datoLys: '#3D2F17',
  suksess: '#B5D1A8',
  suksessLys: '#263322',
  deaktivert: '#5A4E45',
  ramme: '#110E0C',
};

/**
 * Mørk modus følger systeminnstillingen når appen starter.
 * (Bytter man modus mens appen er åpen, gjelder det fra neste oppstart.)
 */
export const erMorkModus = Appearance.getColorScheme() === 'dark';

export const farger: Palett = erMorkModus ? mork : lys;

/** Navnene må stemme med det som lastes i app/_layout.tsx */
export const fonter = {
  tittel: 'BricolageGrotesque_800ExtraBold',
  vanlig: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  fet: 'DMSans_700Bold',
} as const;

/** Appen blir aldri bredere enn dette, så den ser ut som en app også på store skjermer. */
export const MAKS_BREDDE = 520;

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
