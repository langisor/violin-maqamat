import { Jins } from "../types/maqam";

export interface JinsDefinition extends Jins {
  id: string;
  arabicName: string;
  type: "trichord" | "tetrachord" | "pentachord" | "ambiguous";
  defaultTonic: string; // e.g. "C4", "D4", "Ed4"
  allowedTonics: string[]; // suitable transposition roots
}

export const AJNAS_DATASET: JinsDefinition[] = [
  {
    id: "rast",
    name: "Jins Rast",
    arabicName: "جنس راست",
    type: "pentachord",
    tonicArabicName: "Rast (C4)",
    defaultTonic: "C4",
    allowedTonics: ["C4", "G4", "F4", "D4"],
    intervalsInCents: [200, 150, 150, 200],

    description:
      "Quintessential root pentachord. Characteristic neutral 3rd (Sikah) at ~362¢.",
    sourceUrl: "https://www.maqamworld.com/en/jins/rast.php",
  },
  {
    id: "bayati",
    name: "Jins Bayati",
    arabicName: "جنس بياتي",
    type: "tetrachord",
    tonicArabicName: "Dukah (D4)",
    defaultTonic: "D4",
    allowedTonics: ["D4", "G4", "A4"],
    intervalsInCents: [136, 158, 204],
    description:
      "Yearning and melancholic. Starts with 3/4 neutral 2nd (~136¢) resolving downward.",
    sourceUrl: "https://www.maqamworld.com/en/jins/bayati.php",
  },
  {
    id: "sikah",
    name: "Jins Sikah",
    arabicName: "جنس سيكاه",
    type: "trichord",
    tonicArabicName: "Sikah (Ed4)",
    defaultTonic: "Ed4",
    allowedTonics: ["Ed4", "Bd3", "Bd4"],
    intervalsInCents: [136, 204],
    description:
      "Microtonal root trichord built on half-flat degree Ed4 (Sikah) or Bd3 (Iraq).",
    sourceUrl: "https://www.maqamworld.com/en/jins/sikah.php",
  },
  {
    id: "hijaz",
    name: "Jins Hijaz",
    arabicName: "جنس حجاز",
    type: "tetrachord",
    tonicArabicName: "Dukah (D4)",
    defaultTonic: "D4",
    allowedTonics: ["D4", "G4", "C4", "F4"],
    intervalsInCents: [113, 272, 113],
    description:
      "Augmented second interval between 2nd and 3rd degrees (~272¢).",
    sourceUrl: "https://www.maqamworld.com/en/jins/hijaz.php",
  },
  {
    id: "nahwand",
    name: "Jins Nahwand",
    arabicName: "جنس نهوند",
    type: "pentachord",
    tonicArabicName: "Rast (C4)",
    defaultTonic: "C4",
    allowedTonics: ["C4", "G4", "D4"],
    intervalsInCents: [200, 100, 200, 200],
    description:
      "Minor pentachord equivalent to a Western minor sound world (C4 to G4).",
    sourceUrl: "https://www.maqamworld.com/en/jins/nahawand.php",
  },
  {
    id: "kurd",
    name: "Jins Kurd",
    arabicName: "جنس كرد",
    type: "tetrachord",
    tonicArabicName: "Dukah (D4)",
    defaultTonic: "D4",
    allowedTonics: ["D4", "G4", "C4"],
    intervalsInCents: [91, 204, 204],
    description:
      "Phrygian-like minor 2nd (Baqiyyah / ~91¢) leading up to minor 3rd.",
    sourceUrl: "https://www.maqamworld.com/en/jins/kurd.php",
  },
  {
    id: "saba",
    name: "Jins Saba",
    arabicName: "جنس صبا",
    type: "ambiguous",
    tonicArabicName: "Dukah (D4)",
    defaultTonic: "D4",
    allowedTonics: ["D4"],
    intervalsInCents: [136, 158, 113],
    description:
      "Profound lamentation. Characteristic diminished 4th on Gb4.",
    sourceUrl: "https://www.maqamworld.com/en/jins/saba.php",
  },
  {
    id: "ajam",
    name: "Jins Ajam",
    arabicName: "جنس عجم",
    type: "tetrachord",
    tonicArabicName: "qarar Ajam (Bb3) / C4",
    defaultTonic: "Bb3",
    allowedTonics: ["Bb3", "C4", "F4"],
    intervalsInCents: [200, 200, 100, 200],
    description:
      "The common 5-note version has a major-scale sonority; a 3-note version is also used as a secondary jins.",
    sourceUrl: "https://www.maqamworld.com/en/jins/ajam.php",
  },
  {
    id: "nikriz",
    name: "Jins Nikriz",
    arabicName: "جنس نكريز",
    type: "pentachord",
    tonicArabicName: "Rast (C4)",
    defaultTonic: "C4",
    allowedTonics: ["C4", "F4", "G4"],
    intervalsInCents: [204, 113, 272, 113],
    description:
      "Pentachord containing an internal augmented 2nd (similar to Ukrainian Dorian).",
    sourceUrl: "https://www.maqamworld.com/en/jins/nikriz.php",
  },
];
