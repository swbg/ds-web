export const defaultCenter = [11.575892981950567, 48.137836512295905] as [number, number]; // lon, lat
export const defaultZoom = 14;

export enum Colors {
  Marker0 = "#6FA320", // dunkelgrün wirtshaus
  Marker1 = "#A2C147", // mittelgrün biergarten
  Marker2 = "#F2CC44", // gelb restaurant
  Marker3 = "#DC852A", // orange
  Marker4 = "#c64e11", // dunkelorange
  Marker5 = "#AD3E47", // bar
  MarkerGrey = "#bbbbbb",
  MarkerActive = "#ff3fac", // pink
  MarkerDrop = "#2faad4", // blautürkis
  MarkerBag = "#9d6cc7", // violett
  Halo = "#ffffff",
}

export enum AboutState {
  Info,
  Imprint,
  Privacy,
  None,
}

export const Sources = ["circle", "bag", "drop"] as const;

export const ProductTypes = [
  "Helles",
  "Helles Alkoholfrei",
  "Weißbier",
  "Weißbier Alkoholfrei",
  "Weinschorle",
  "Aperol",
  "Spritz",
  "Spritz Alkoholfrei",
] as const;

// export const BrandNames = [
//   "Augustiner",
//   "Tegernseer",
//   "Hacker",
//   "Spaten",
//   "Löwenbräu",
//   "Paulaner",
//   "Giesinger",
//   "Andere",
// ] as const;

export const Weekdays = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

export enum OpeningStatus {
  Open = "open",
  Closed = "closed",
  Unknown = "unknown",
}

export const OpeningLabels: Record<OpeningStatus, string> = {
  [OpeningStatus.Open]: "Geöffnet",
  [OpeningStatus.Closed]: "Geschlossen",
  [OpeningStatus.Unknown]: "",
};

export const GastroLabels = {
  NoPrices: "Noch keine Preise verfügbar",
  NonAlcoholic: "Alkoholfrei",
  FurtherDrinks: "Weitere Getränke",
  FurtherCategories: ["Weinschorle", "Spritz"],
};
