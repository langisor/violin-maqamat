import { MaqamScale } from "../types/maqam";

export const MAQAM_FAMILIES = [
  "Ajam",
  "Bayati",
  "Hijaz",
  "Kurd",
  "Nahwand",
  "Nikriz",
  "Rast",
  "Sikah",
  "Independent",
] as const;

export const MAQAM_FAMILY_SOURCES = {
  Ajam: "https://www.maqamworld.com/en/maqam/f_ajam.php",
  Bayati: "https://www.maqamworld.com/en/maqam/f_bayati.php",
  Hijaz: "https://www.maqamworld.com/en/maqam/f_hijaz.php",
  Kurd: "https://www.maqamworld.com/en/maqam/f_kurd.php",
  Nahwand: "https://www.maqamworld.com/en/maqam/f_nahawand.php",
  Nikriz: "https://www.maqamworld.com/en/maqam/f_nikriz.php",
  Rast: "https://www.maqamworld.com/en/maqam/f_rast.php",
  Sikah: "https://www.maqamworld.com/en/maqam/f_sikah.php",
} as const;

export const INDEPENDENT_MAQAM_SOURCES = {
  Jiharkah: "https://www.maqamworld.com/en/maqam/jiharkah.php",
  Lami: "https://www.maqamworld.com/en/maqam/lami.php",
  Saba: "https://www.maqamworld.com/en/maqam/saba.php",
  "Saba Zamzam": "https://www.maqamworld.com/en/maqam/saba_zamzam.php",
  "Sikah Baladi": "https://www.maqamworld.com/en/maqam/sikah_baladi.php",
} as const;

/**
 * Names and classification from MaqamWorld's Maqam Index. Some entries are
 * intentionally catalogued here before they receive a playable local scale,
 * because the source documents them as irregular or non-family maqamat.
 */
export const MAQAM_SOURCE_INDEX = {
  families: {
    Ajam: ["Ajam", "Ajam Ushayran", "Shawq Afza"],
    Bayati: ["Bayati", "Bayati Shuri", "Husayni", "Muhayyar"],
    Hijaz: ["Hijaz", "Hijazkar", "Shadd Araban", "Shahnaz", "Suzidil", "Zanjaran"],
    Kurd: ["Kurd", "Hijazkar Kurd"],
    Nahwand: ["Nahwand", "Farahfaza", "Nahwand Murassa", "Ushaq Masri"],
    Nikriz: ["Nikriz", "Nawa Athar", "Athar Kurd"],
    Rast: ["Rast", "Kirdan", "Sazkar", "Suznak", "Nairuz", "Yakah", "Dalanshin", "Suzdalara", "Mahur"],
    Sikah: ["Sikah", "Huzam", "Rahat al-Arwah", "Iraq", "Awj Iraq", "Bastanikar", "Musta'ar"],
  },
  independent: ["Jiharkah", "Lami", "Saba", "Saba Zamzam", "Sikah Baladi"],
} as const;

export const MAQAM_DATASET: MaqamScale[] = [
  // --- 1. RAST FAMILY ---
  {
    id: "rast",
    name: "Rast",
    arabicName: "راست",
    family: "Rast",
    tonicNote: "C4",
    tonicArabicName: "Rast (C4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["C4", "D4", "Ed4", "F4", "G4", "A4", "Bd4", "C5"],
    descendingNotes: ["C5", "Bd4", "A4", "G4", "F4", "Ed4", "D4", "C4"],
    jinsAsl: {
      name: "Jins Rast",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [200, 150, 150, 200],
      description:
        "Neutral 3rd (Sikah) on Ed4. The quintessential foundation of Arabic music.",
    },
    jinsFar: {
      name: "Jins Rast (on G4) / Nahwand",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [204, 158, 138],
      description:
        "Ascends with Rast on G4; often descends via upper Jins Nahwand (Bb4) on G4.",
    },
    sayrNotes:
      "Starts on Qarar Rast (C4), firmly establishes Jins Rast up to Nawa (G4), develops upper Rast or Nahwand on G, then descends with emphasis on Sikah (Ed4) resolving to Rast.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/rast.php",
  },
  {
    id: "suznak",
    name: "Suznak",
    arabicName: "سوزناك",
    family: "Rast",
    tonicNote: "C4",
    tonicArabicName: "Rast (C4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["C4", "D4", "Ed4", "F4", "G4", "Ab4", "B4", "C5"],
    jinsAsl: {
      name: "Jins Rast",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [204, 158, 138],
      description: "Root Rast on C4.",
    },
    jinsFar: {
      name: "Jins Hijaz",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [113, 272, 113],
      description: "Upper Hijaz on G4 creating distinctive dramatic tension.",
    },
    sayrNotes:
      "Opens in lower Rast, moves to G4 to develop poignant Jins Hijaz melodies, and resolves down to C4.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/suznak.php",
  },
  {
    id: "nairuz",
    name: "Nayruz / Niriz",
    arabicName: "نيروز",
    family: "Rast",
    tonicNote: "C4",
    tonicArabicName: "Rast (C4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["C4", "D4", "Ed4", "F4", "G4", "Ad4", "Bb4", "C5"],
    jinsAsl: {
      name: "Jins Rast",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [204, 158, 138],
      description: "Rast on C4.",
    },
    jinsFar: {
      name: "Jins Bayati",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [136, 158, 204],
      description: "Secondary Bayati on G4 (with half-flat Ad4).",
    },
    sayrNotes:
      "Blends the serenity of Rast with the yearning quality of Bayati on the 5th degree (G4).",
    sourceUrl: "https://www.maqamworld.com/en/maqam/nairuz.php",
  },
  {
    id: "dalanshin",
    name: "Dalanshin",
    arabicName: "دلالشين",
    family: "Rast",
    tonicNote: "C4",
    tonicArabicName: "Rast (C4)",
    ghammazArabicName: "A4 Hussyani",
    scaleNotes: [
      "C4",
      "D4",
      "Ed4",
      "F4",
      "G4",
      "A4",
      "Bd4",
      "C5",
      "Db5",
      "E5",
      
    ],
    jinsAsl: {
      name: "Jins Rast",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [204, 158, 138],
      description: "Rast on C4.",
    },
    jinsFar: {
      name: "Jins Saba Dalanshin",
      tonicArabicName: "Hussyini (A4)",
      intervalsInCents: [136, 158, 113, 113, 272, 113],
      description: "Saba on Husiany (A4) then Hijaz on Kirdan (C5).",
    },
    sayrNotes:
      "Begins with Rast on C4, moves to Saba on Husiany (A4), and finally to Hijaz on Kirdan (C5).",
    sourceUrl: "https://www.maqamworld.com/en/maqam/dalanshin.php",
  },
  
  {
    id: "yakah",
    name: "Yakah",
    arabicName: "يكاه",
    family: "Rast",
    tonicNote: "G3",
    tonicArabicName: "Yakah G3",
    ghammazArabicName: "D4",
    scaleNotes: ["G3", "A3", "Bd3", "C4", "D4", "Ed4", "F4", "G4"],
    jinsAsl: {
      name: "Jins Rast on G3",
      tonicArabicName: "Yakah (G3)",
      intervalsInCents: [136, 158, 204],
      description: "Lower Rast on G3 with a unique ascending pathway.",
    },
    jinsFar: {
      name: "Bayati on D4",
      tonicArabicName: "Dukah (D4)",
      intervalsInCents: [136, 158, 204],
      description: "Secondary Bayati on D4.",
    },
    sayrNotes:
      "Maqam Yakah is an archaic version of Maqam Nairuz, based on note G3 in the Arabic archaic 24-tone scale (named “Yakah”) rather than note C4.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/nairuz.php",
  },
  

  // --- 2. BAYATI FAMILY ---
  {
    id: "bayati",
    name: "Bayati",
    arabicName: "بياتي",
    family: "Bayati",
    tonicNote: "D4",
    tonicArabicName: "Dukah (D4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["D4", "Ed4", "F4", "G4", "A4", "Bb4", "C5", "D5"],
    descendingNotes: ["D5", "C5", "Bb4", "A4", "G4", "F4", "Ed4", "D4"],
    jinsAsl: {
      name: "Jins Bayati",
      tonicArabicName: "Dukah (D4)",
      intervalsInCents: [136, 158, 204],
      description:
        "Characteristic 3/4-tone on Ed4 (Sikah) resolving down to Dukah (D4).",
    },
    jinsFar: {
      name: "Jins Nahwand",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [204, 91, 204],
      description: "Secondary Nahwand on G4. And can be Rast",
    },
    sayrNotes:
      "Extremely popular and versatile. Starts with lingering around Dukah (D4) and Sikah (Ed4), elevates to G4 for Nahwand or Rast on A, descending gracefully.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/bayati.php",
  },
  {
    id: "bayati-shuri",
    name: "Bayati Shuri (Karjighar)",
    arabicName: "بياتي شورى / كارجغار",
    family: "Bayati",
    tonicNote: "D4",
    tonicArabicName: "Dukah (D4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["D4", "Ed4", "F4", "G4", "Ab4", "B4", "C5", "D5"],
    jinsAsl: {
      name: "Jins Bayati",
      tonicArabicName: "Dukah (D4)",
      intervalsInCents: [136, 158, 204],
      description: "Bayati on D4.",
    },
    jinsFar: {
      name: "Jins Hijaz",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [113, 272, 113],
      description: "Upper Hijaz on G4.",
    },
    sayrNotes:
      "Combines the introspective nature of Bayati with lowered 5th degree (A4->Ab4) with the intense, ornate color of Hijaz on the dominant G4.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/bayati_shuri.php",
  },
  {
    id: "husayni",
    name: "Husayni",
    arabicName: "حسيني",
    family: "Bayati",
    tonicNote: "D4",
    tonicArabicName: "Dukah (D4)",
    ghammazArabicName: "Husayni (A4)",
    scaleNotes: ["D4", "Ed4", "F4", "G4", "A4", "Bd4", "C5", "D5"],
    jinsAsl: {
      name: "Jins Bayati",
      tonicArabicName: "Dukah (D4)",
      intervalsInCents: [136, 158, 204],
      description: "Bayati on D4.",
    },
    jinsFar: {
      name: "Jins Bayati (upper)",
      tonicArabicName: "Husayni (A4)",
      intervalsInCents: [136, 158, 204],
      description: "Bayati echoed on A4 with Awj (Bd4).",
    },
    sayrNotes:
      "Begins prominently around A4 (Husayni), emphasizing upper Bayati or Kurd before dropping down to conclude on Dukah (D4).",
    sourceUrl: "https://www.maqamworld.com/en/maqam/husayni.php",
  },
  
  // --- 3. SIKAH FAMILY ---
  {
    id: "sikah",
    name: "Sikah",
    arabicName: "سيكاه",
    family: "Sikah",
    tonicNote: "Eb3",
    tonicArabicName: "Sikah (Eb3)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["Ed4", "F4", "G4","A4","Bd4","C5","D5","Ed5"],
    jinsAsl: {
      name: "Jins Sikah",
      tonicArabicName: "Sikah (Ed4)",
      intervalsInCents: [136, 204, 204],
      description: "Sikah on C4, with a characteristic 3/4-tone on Ed4 (Sikah) resolving up to upper Rast ",
    },
    jinsFar: {
      name: "Jins Rast",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [204, 158, 138],
      description: "double Upper Rast starting on G4 and C5.",
    },
    sayrNotes:
      "Tonic is Ed4 (Sikah). Never starts on standard D or C, but directly leans on the microtonal root Ed4. then resolve up to upper Rast on G4 and continue to Rast on C5 to octave note (Ed5)",
    sourceUrl: "https://www.maqamworld.com/en/maqam/sikah.php",
  },
  {
    id: "huzam",
    name: "Huzam",
    arabicName: "هزام",
    family: "Sikah",
    tonicNote: "Ed4",
    tonicArabicName: "Sikah (Ed4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["Ed4", "F4", "G4", "Ab4", "B4", "C5", "D5", "Ed5"],
    jinsAsl: {
      name: "Jins Sikah",
      tonicArabicName: "Sikah (Ed4)",
      intervalsInCents: [136, 204, 204],
      description: "Sikah on Ed4.",
    },
    jinsFar: {
      name: "Jins Hijaz",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [113, 272, 113],
      description: "Hijaz on G4 featuring Ab4 and B4.",
    },
    sayrNotes:
      "Start Sikah on Ed4 then move to Hijaz on G4 and append Rast on C5 and end in Ed5",
    sourceUrl: "https://www.maqamworld.com/en/maqam/huzam.php",
  },
{
    id: "Rahat-al-arwah",
    name: "Rahat Al Arawh",
    arabicName: "راحة الأرواح",
    family: "Sikah",
    tonicNote: "Ed4",
    tonicArabicName: "Sikah (Bd3)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["Bd3", "B3", "C4", "Db4", "F4","Gb4","Ab4","Bd3"],
    jinsAsl: {
      name: "Jins Sikah",
      tonicArabicName: "Irag (Bd3)",
      intervalsInCents: [136, 204, 204],
      description: "Sikah on Bd3.",
    },
    jinsFar: {
      name: "Jins Hijaz",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [113, 272, 113],
      description: "Hijaz on G4 featuring Ab4 and B4.",
    },
    sayrNotes:
      "Start Sikah on Ed4 then move to Hijaz on G4 and append Rast on C5 and end in Ed5",
    sourceUrl: "https://www.maqamworld.com/en/maqam/rahat_al_arwah.php",
  },
  {
    id: "iraq",
    name: "Iraq",
    arabicName: "عراق",
    family: "Sikah",
    tonicNote: "Bd3",
    tonicArabicName: "Iraq (Bd3)",
    ghammazArabicName: "Dukah (D4)",
    scaleNotes: ["Bd3", "C4", "D4", "Ed4", "F4", "G4", "A4", "Bd4"],
    jinsAsl: {
      name: "Jins Sikah",
      tonicArabicName: "Iraq (Bd3)",
      intervalsInCents: [136, 204, 204],
      description: "Rooted low on Qarar Bd3.",
    },
    jinsFar: {
      name: "Jins Bayati",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [136, 158, 204],
      description: "Bayati on C4.",
    },
    sayrNotes: "Sikah then Hijaz then Rast",
    sourceUrl: "https://www.maqamworld.com/en/maqam/iraq.php",
  },

  // --- 4. HIJAZ FAMILY ---
  {
    id: "hijaz",
    name: "Hijaz",
    arabicName: "حجاز",
    family: "Hijaz",
    tonicNote: "D4",
    tonicArabicName: "Dukah (D4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["D4", "Eb4", "F#4", "G4", "A4", "Bb4", "C5", "D5"],
    descendingNotes: ["D5", "C5", "Bb4", "A4", "G4", "F#4", "Eb4", "D4"],
    jinsAsl: {
      name: "Jins Hijaz",
      tonicArabicName: "Dukah (D4)",
      intervalsInCents: [113, 272, 113],
      description: "Augmented second between Eb4 and F#4 (~272¢).",
    },
    jinsFar: {
      name: "Jins Nahwand",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [204, 91, 204],
      description:
        "Nahwand on G4 (alternates with upper Rast on G4 in Hijaz Misri).",
    },
    sayrNotes:
      "Dramatic and fiery. Focuses around D4, flares up with Eb4 and F#4, moves through G4 before settling back.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/hijaz.php",
  },
  {
    id: "hijaz-kar",
    name: "Hijazkar",
    arabicName: "حجاز كار",
    family: "Hijaz",
    tonicNote: "C4",
    tonicArabicName: "Rast (C4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["C4", "Db4", "E4", "F4", "G4", "Ab4", "B4", "C5", "Db5", "E5"],
    descendingNotes: ["E5", "Db5", "C5", "B4", "Ab4", "G4", "F4", "E4", "Db4", "C4"],
    jinsAsl: {
      name: "Jins Hijaz",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [113, 272, 113],
      description: "Hijaz on C4.",
    },
    jinsFar: {
      name: "Jins Nikriz",
      tonicArabicName: "Jiharkah (F4)",
      intervalsInCents: [204, 113, 272, 113],
      description: "Jins Nikriz centered on the fourth degree.",
      sourceUrl: "https://www.maqamworld.com/en/jins/nikriz.php",
    },
    JinsTop: [
      {
        name: "Jins Hijazkar",
        tonicArabicName: "Rast (C5)",
        intervalsInCents: [],
        description: "Jins Hijazkar on the octave, as described by MaqamWorld.",
        sourceUrl: "https://www.maqamworld.com/en/jins/hijazkar.php",
      },
    ],
    
    sayrNotes:
      "The source course begins at E5 and descends through D♭5, C5, B4, A♭4, G4, F4, E4, and D♭4 to the tonic C4.",
    transpositionAliases: [
      { name: "Shadd ‘Araban", tonicNote: "G3", note: "Hijazkar on low G" },
      { name: "Suzidil", tonicNote: "A3", note: "Hijazkar on low A" },
      { name: "Shahnaz", tonicNote: "D4", note: "Hijazkar on D" },
    ],
    sourceUrl: "https://www.maqamworld.com/en/maqam/hijazkar.php",
    
  },

  // --- 5. NAHWAND FAMILY ---
  {
    id: "nahwand",
    name: "Nahwand",
    arabicName: "نهوند",
    family: "Nahwand",
    tonicNote: "C4",
    tonicArabicName: "Rast (C4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "B4", "C5"],
    descendingNotes: ["C5", "Bb4", "Ab4", "G4", "F4", "Eb4", "D4", "C4"],
    jinsAsl: {
      name: "Jins Nahwand",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [200, 100, 200, 200],
      description: "Minor-sounding root tetrachord on C4.",
    },
    jinsFar: {
      name: "Jins Hijaz / Kurd",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [113, 272, 113],
      description:
        "Ascends using Hijaz on G (leading tone B4), descends using Kurd on G (Bb4).",
    },
    sayrNotes:
      "Harmonic minor ascent with melodic minor descending resolution.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/nahawand.php",
  },

  // --- 6. KURD FAMILY ---
  {
    id: "kurd",
    name: "Kurd",
    arabicName: "كرد",
    family: "Kurd",
    tonicNote: "D4",
    tonicArabicName: "Dukah (D4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["D4", "Eb4", "F4", "G4", "A4", "Bb4", "C5", "D5"],
    jinsAsl: {
      name: "Jins Kurd",
      tonicArabicName: "Dukah (D4)",
      intervalsInCents: [91, 204, 204],
      description: "Phrygian-like minor 2nd (Eb4) on Dukah.",
    },
    jinsFar: {
      name: "Jins Nahwand",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [204, 91, 204],
      description: "Nahwand on G4.",
    },
    sayrNotes:
      "Begins smoothly on D4, moves through Eb4 with tender Phrygian flavor to G4.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/kurd.php",
  },

  // --- 7. NIKRIZ FAMILY ---
  {
    id: "nikriz",
    name: "Nikriz",
    arabicName: "نكريز",
    family: "Nikriz",
    tonicNote: "C4",
    tonicArabicName: "Rast (C4)",
    ghammazArabicName: "Nawa (G4)",
    scaleNotes: ["C4", "D4", "Eb4", "F#4", "G4", "Ab4", "B4", "C5"],
    descendingNotes: ["C5", "B4", "Ab4", "G4", "F#4", "Eb4", "D4", "C4"],
    jinsAsl: {
      name: "Jins Nikriz",
      tonicArabicName: "Rast (C4)",
      intervalsInCents: [204, 113, 272, 113],
      description: "Five-note root jins of the Nikriz family.",
      sourceUrl: "https://www.maqamworld.com/en/jins/nikriz.php",
    },
    jinsFar: {
      name: "Jins Nahwand",
      tonicArabicName: "Nawa (G4)",
      intervalsInCents: [204, 91, 204],
      description: "Jins Nahwand centered on the fifth degree.",
      sourceUrl: "https://www.maqamworld.com/en/jins/nahawand.php",
    },
    sayrNotes:
      "The principal Nikriz maqam: Jins Nikriz on the tonic followed by Jins Nahwand on the fifth degree.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/nikriz.php",
  },

  // --- 8. INDEPENDENT MAQAMAT ---
  {
    id: "saba",
    name: "Saba",
    arabicName: "صبا",
    family: "Independent",
    tonicNote: "D4",
    tonicArabicName: "Dukah (D4)",
    ghammazArabicName: "Jiharkah (F4)",
    scaleNotes: ["D4", "Ed4", "F4", "Gb4", "A4", "Bb4", "C5", "Db5"],
    jinsAsl: {
      name: "Jins Saba",
      tonicArabicName: "Dukah (D4)",
      intervalsInCents: [136, 158, 113],
      description: "D4 to Gb4: uniquely includes a diminished 4th on Gb4.",
    },
    jinsFar: {
      name: "Jins Hijaz",
      tonicArabicName: "Jiharkah (F4)",
      intervalsInCents: [113, 272, 113],
      description: "Hijaz starts directly on the 3rd degree F4!",
    },
    sayrNotes:
      "Characterized by poignant sorrow and longing. The primary modulation is Hijaz starting on F4 (F4-Gb4-A4-Bb4).",
    sourceUrl: "https://www.maqamworld.com/en/maqam/saba.php",
  },

  // --- 9. AJAM FAMILY ---
  {
    id: "ajam",
    name: "Ajam / Ajam Ushayran",
    arabicName: "عجم / عجم عشيران",
    family: "Ajam",
    tonicNote: "Bb3",
    tonicArabicName: "qarar Ajam (Bb3)",
    ghammazArabicName: "Jiharkah (F4)",
    scaleNotes: ["Bb3", "C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"],
    jinsAsl: {
      name: "Jins Ajam",
      tonicArabicName: "qarar Ajam (Bb3)",
      intervalsInCents: [200, 200, 100, 200],
      description: "Major scale sound world.",
    },
    jinsFar: {
      name: "Jins Ajam",
      tonicArabicName: "Jiharkah (F4)",
      intervalsInCents: [200, 200, 100, 200],
      description: "Upper Ajam on F4.",
    },
    sayrNotes: "Majestic and bright. Emphasizes the major triad on Bb3 and F4.",
    sourceUrl: "https://www.maqamworld.com/en/maqam/ajam.php",
  },
];
