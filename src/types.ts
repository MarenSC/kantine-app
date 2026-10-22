/**
 * Felles datatyper for appen.
 * Alle priser er i hele kroner.
 * Datoer lagres som tekst på formatet "YYYY-MM-DD" (f.eks. "2026-10-22").
 */
import type { ImageSourcePropType } from 'react-native';

export type Kategori =
  | 'varmmat'
  | 'smorbrod'
  | 'salat'
  | 'bakevarer'
  | 'snacks'
  | 'drikke';

export interface Campus {
  id: string;
  navn: string;
}

export interface Bygg {
  id: string;
  navn: string;
  /** Kort navn som vises i lister, f.eks. "P35" */
  kortnavn: string;
  campusId: string;
}

export interface Kantine {
  id: string;
  navn: string;
  byggId: string;
  /** Hvor i bygget kantina ligger, f.eks. "1. etasje" */
  plassering: string;
  /** Åpningstid, format "HH:MM" */
  aapner: string;
  /** Stengetid, format "HH:MM" */
  stenger: string;
  /** Om kantina kan levere mat dit studenten sitter */
  leveringTilBord: boolean;
  /** Toppbilde på menysiden */
  bilde?: ImageSourcePropType;
}

export interface Tilbud {
  /** Tekst som vises på merkelappen, f.eks. "Ukens tilbud" */
  tekst: string;
  /** Tilbudsprisen i kroner */
  pris: number;
}

export interface Vare {
  id: string;
  kantineId: string;
  navn: string;
  beskrivelse: string;
  kategori: Kategori;
  /** Ordinær pris i kroner */
  pris: number;
  tilbud?: Tilbud;
  /** Siste salgsdag ("YYYY-MM-DD"). Brukes til å gi rabatt når datoen nærmer seg. */
  bestFoer?: string;
  allergener: string[];
  vegetar?: boolean;
  antallIgjen: number;
  /** Produktbilde, f.eks. require('../../assets/images/mat/kaffe.jpg') */
  bilde?: ImageSourcePropType;
  /** Ukedager varen serveres (1 = mandag … 5 = fredag). Mangler = hver dag. */
  dager?: number[];
  /** Gir stempel på stempelkortet (kaffe) */
  stempelkort?: boolean;
}

export interface Handlekurvlinje {
  vareId: string;
  antall: number;
}

export type Leveringsmaate =
  | { type: 'henting'; /** ISO-tidspunkt */ hentetid: string }
  | { type: 'levering'; /** Hvor studenten sitter */ plassering: string };

export interface Bestillingslinje {
  vareId: string;
  navn: string;
  antall: number;
  /** Prisen per stykk på bestillingstidspunktet (inkl. rabatt) */
  stykkpris: number;
  /** Ordinær pris per stykk, for å regne ut hvor mye som ble spart */
  ordinaerPris: number;
  /** True hvis varen hadde datorabatt, altså ble "reddet" fra å bli kastet */
  reddet: boolean;
  /** True hvis varen gir stempel på stempelkortet */
  stempel: boolean;
}

export interface Student {
  /** Unik ID fra Feide (eller demo-ID) */
  id: string;
  navn: string;
  epost?: string;
  institusjon?: string;
  innloggetMed: 'feide' | 'demo';
}

export interface Preferanser {
  /** Allergener studenten vil unngå, f.eks. ["gluten", "melk"] */
  allergener: string[];
  vegetar: boolean;
  favorittKantineId: string | null;
  /** Vis varsel når favorittkantina har varer på «Redd maten» */
  varselReddMaten: boolean;
}

export interface Bestilling {
  id: string;
  kantineId: string;
  linjer: Bestillingslinje[];
  totalpris: number;
  leveringsmaate: Leveringsmaate;
  kommentar?: string;
  /** ISO-tidspunkt */
  opprettet: string;
  /** Kode studenten viser frem ved henting */
  hentekode: string;
  /** Satt av kantina i kantinevisningen. Mangler = simulert status. */
  status?: Bestillingssteg;
  tilbakemelding?: Tilbakemelding;
}

export type Bestillingssteg = 'mottatt' | 'tilberedes' | 'klar' | 'utlevert';

export interface Tilbakemelding {
  /** 1–5 */
  stjerner: number;
  kommentar?: string;
}
