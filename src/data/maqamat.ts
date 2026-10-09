import { MaqamScale } from '../types/maqam';

export const MAQAM_FAMILIES = ['Rast', 'Bayati', 'Sikah', 'Hijaz', 'Nahwand', 'Kurd', 'Saba', 'Ajam'] as const;

export const MAQAM_DATASET: MaqamScale[] = [
  // --- 1. RAST FAMILY ---
  {
    id: 'rast',
    name: 'Rast',
    arabicName: 'راست',
    family: 'Rast',
    tonicNote: 'C4',
    tonicArabicName: 'Rast (C4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['C4', 'D4', 'Ed4', 'F4', 'G4', 'A4', 'Bd4', 'C5'],
    descendingNotes: ['C5', 'Bd4', 'A4', 'G4', 'F4', 'Ed4', 'D4', 'C4'],
    commas53Sequence: [9, 7, 6, 9, 9, 7, 6], // Rast on C + Rast on G
    jinsAsl: {
      name: 'Jins Rast',
      tonicArabicName: 'Rast (C4)',
      intervalsInCents: [204, 158, 138], // 9, 7, 6 commas
      description: 'Neutral 3rd (Sikah) on Ed4. The quintessential foundation of Arabic music.'
    },
    jinsFar: {
      name: 'Jins Rast (on G4) / Nahwand',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [204, 158, 138],
      description: 'Ascends with Rast on G4; often descends via upper Jins Nahwand (Bb4) on G4.'
    },
    sayrNotes: 'Starts on Qarar Rast (C4), firmly establishes Jins Rast up to Nawa (G4), develops upper Rast or Nahwand on G, then descends with emphasis on Sikah (Ed4) resolving to Rast.'
  },
  {
    id: 'suznak',
    name: 'Suznak',
    arabicName: 'سوزناك',
    family: 'Rast',
    tonicNote: 'C4',
    tonicArabicName: 'Rast (C4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['C4', 'D4', 'Ed4', 'F4', 'G4', 'Ab4', 'B4', 'C5'],
    commas53Sequence: [9, 7, 6, 9, 5, 12, 5],
    jinsAsl: {
      name: 'Jins Rast',
      tonicArabicName: 'Rast (C4)',
      intervalsInCents: [204, 158, 138],
      description: 'Root Rast on C4.'
    },
    jinsFar: {
      name: 'Jins Hijaz',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [113, 272, 113], // 5, 12, 5 commas
      description: 'Upper Hijaz on G4 creating distinctive dramatic tension.'
    },
    sayrNotes: 'Opens in lower Rast, moves to G4 to develop poignant Jins Hijaz melodies, and resolves down to C4.'
  },
  {
    id: 'nairuz',
    name: 'Nayruz / Niriz',
    arabicName: 'نيروز',
    family: 'Rast',
    tonicNote: 'C4',
    tonicArabicName: 'Rast (C4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['C4', 'D4', 'Ed4', 'F4', 'G4', 'Ad4', 'Bb4', 'C5'],
    commas53Sequence: [9, 7, 6, 9, 6, 7, 9],
    jinsAsl: {
      name: 'Jins Rast',
      tonicArabicName: 'Rast (C4)',
      intervalsInCents: [204, 158, 138],
      description: 'Rast on C4.'
    },
    jinsFar: {
      name: 'Jins Bayati',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [136, 158, 204],
      description: 'Secondary Bayati on G4 (with half-flat Ad4).'
    },
    sayrNotes: 'Blends the serenity of Rast with the yearning quality of Bayati on the 5th degree (G4).'
  },

  // --- 2. BAYATI FAMILY ---
  {
    id: 'bayati',
    name: 'Bayati',
    arabicName: 'بياتي',
    family: 'Bayati',
    tonicNote: 'D4',
    tonicArabicName: 'Dukah (D4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['D4', 'Ed4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
    descendingNotes: ['D5', 'C5', 'Bb4', 'A4', 'G4', 'F4', 'Ed4', 'D4'],
    commas53Sequence: [6, 7, 9, 9, 4, 9, 9], // Bayati on D + Nahwand on G
    jinsAsl: {
      name: 'Jins Bayati',
      tonicArabicName: 'Dukah (D4)',
      intervalsInCents: [136, 158, 204],
      description: 'Characteristic 3/4-tone on Ed4 (Sikah) resolving down to Dukah (D4).'
    },
    jinsFar: {
      name: 'Jins Nahwand',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [204, 91, 204],
      description: 'Secondary Nahwand on G4.'
    },
    sayrNotes: 'Extremely popular and versatile. Starts with lingering around Dukah (D4) and Sikah (Ed4), elevates to G4 for Nahwand or Bayat on A, descending gracefully.'
  },
  {
    id: 'bayati-shuri',
    name: 'Bayati Shuri (Karjighar)',
    arabicName: 'بياتي شورى / كارجغار',
    family: 'Bayati',
    tonicNote: 'D4',
    tonicArabicName: 'Dukah (D4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['D4', 'Ed4', 'F4', 'G4', 'Ab4', 'B4', 'C5', 'D5'],
    commas53Sequence: [6, 7, 9, 5, 12, 5, 9],
    jinsAsl: {
      name: 'Jins Bayati',
      tonicArabicName: 'Dukah (D4)',
      intervalsInCents: [136, 158, 204],
      description: 'Bayati on D4.'
    },
    jinsFar: {
      name: 'Jins Hijaz',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [113, 272, 113],
      description: 'Upper Hijaz on G4.'
    },
    sayrNotes: 'Combines the introspective nature of Bayati with the intense, ornate color of Hijaz on the dominant G4.'
  },
  {
    id: 'husayni',
    name: 'Husayni',
    arabicName: 'حسيني',
    family: 'Bayati',
    tonicNote: 'D4',
    tonicArabicName: 'Dukah (D4)',
    ghammazArabicName: 'Husayni (A4)',
    scaleNotes: ['D4', 'Ed4', 'F4', 'G4', 'A4', 'Bd4', 'C5', 'D5'],
    commas53Sequence: [6, 7, 9, 9, 6, 7, 9],
    jinsAsl: {
      name: 'Jins Bayati',
      tonicArabicName: 'Dukah (D4)',
      intervalsInCents: [136, 158, 204],
      description: 'Bayati on D4.'
    },
    jinsFar: {
      name: 'Jins Bayati (upper)',
      tonicArabicName: 'Husayni (A4)',
      intervalsInCents: [136, 158, 204],
      description: 'Bayati echoed on A4 with Awj (Bd4).'
    },
    sayrNotes: 'Begins prominently around A4 (Husayni), emphasizing upper Bayati or Kurd before dropping down to conclude on Dukah (D4).'
  },

  // --- 3. SIKAH FAMILY ---
  {
    id: 'sikah',
    name: 'Sikah',
    arabicName: 'سيكاه',
    family: 'Sikah',
    tonicNote: 'Ed4',
    tonicArabicName: 'Sikah (Ed4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['Ed4', 'F4', 'G4', 'A4', 'Bd4', 'C5', 'D5', 'Ed5'],
    commas53Sequence: [6, 9, 9, 7, 6, 9, 7],
    jinsAsl: {
      name: 'Jins Sikah',
      tonicArabicName: 'Sikah (Ed4)',
      intervalsInCents: [136, 204, 204],
      description: 'Rooted on half-flat Ed4. Authentic microtone tonic!'
    },
    jinsFar: {
      name: 'Jins Rast',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [204, 158, 138],
      description: 'Upper Rast starting on G4.'
    },
    sayrNotes: 'Tonic is Ed4 (Sikah). Never starts on standard D or C, but directly leans on the microtonal root Ed4.'
  },
  {
    id: 'huzam',
    name: 'Huzam',
    arabicName: 'هزام',
    family: 'Sikah',
    tonicNote: 'Ed4',
    tonicArabicName: 'Sikah (Ed4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['Ed4', 'F4', 'G4', 'Ab4', 'B4', 'C5', 'D5', 'Ed5'],
    commas53Sequence: [6, 9, 5, 12, 5, 9, 7],
    jinsAsl: {
      name: 'Jins Sikah',
      tonicArabicName: 'Sikah (Ed4)',
      intervalsInCents: [136, 204, 204],
      description: 'Sikah on Ed4.'
    },
    jinsFar: {
      name: 'Jins Hijaz',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [113, 272, 113],
      description: 'Hijaz on G4 featuring Ab4 and B4.'
    },
    sayrNotes: 'The most commonly performed maqam in the Sikah family, full of devotional and evocative vocal inflections.'
  },
  {
    id: 'iraq',
    name: 'Iraq',
    arabicName: 'عراق',
    family: 'Sikah',
    tonicNote: 'Bd3',
    tonicArabicName: 'Iraq (Bd3)',
    ghammazArabicName: 'Dukah (D4)',
    scaleNotes: ['Bd3', 'C4', 'D4', 'Ed4', 'F4', 'G4', 'A4', 'Bd4'],
    commas53Sequence: [6, 9, 6, 7, 9, 9, 7],
    jinsAsl: {
      name: 'Jins Sikah',
      tonicArabicName: 'Iraq (Bd3)',
      intervalsInCents: [136, 204, 204],
      description: 'Rooted low on Qarar Bd3.'
    },
    jinsFar: {
      name: 'Jins Bayati',
      tonicArabicName: 'Dukah (D4)',
      intervalsInCents: [136, 158, 204],
      description: 'Bayati on D4.'
    },
    sayrNotes: 'Low register Sikah variant transposed to Qarar Iraq (Bd3).'
  },

  // --- 4. HIJAZ FAMILY ---
  {
    id: 'hijaz',
    name: 'Hijaz',
    arabicName: 'حجاز',
    family: 'Hijaz',
    tonicNote: 'D4',
    tonicArabicName: 'Dukah (D4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['D4', 'Eb4', 'F#4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
    descendingNotes: ['D5', 'C5', 'Bb4', 'A4', 'G4', 'F#4', 'Eb4', 'D4'],
    commas53Sequence: [5, 12, 5, 9, 4, 9, 9], // 5, 12, 5 commas = Jins Hijaz
    jinsAsl: {
      name: 'Jins Hijaz',
      tonicArabicName: 'Dukah (D4)',
      intervalsInCents: [113, 272, 113],
      description: 'Augmented second between Eb4 and F#4 (12 commas).'
    },
    jinsFar: {
      name: 'Jins Nahwand',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [204, 91, 204],
      description: 'Nahwand on G4 (alternates with upper Rast on G4 in Hijaz Misri).'
    },
    sayrNotes: 'Dramatic and fiery. Focuses around D4, flares up with Eb4 and F#4, moves through G4 before settling back.'
  },
  {
    id: 'hijaz-kar',
    name: 'Hijaz Kar',
    arabicName: 'حجاز كار',
    family: 'Hijaz',
    tonicNote: 'C4',
    tonicArabicName: 'Rast (C4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['C4', 'Db4', 'E4', 'F4', 'G4', 'Ab4', 'B4', 'C5'],
    commas53Sequence: [5, 12, 5, 9, 5, 12, 5],
    jinsAsl: {
      name: 'Jins Hijaz',
      tonicArabicName: 'Rast (C4)',
      intervalsInCents: [113, 272, 113],
      description: 'Hijaz on C4.'
    },
    jinsFar: {
      name: 'Jins Hijaz',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [113, 272, 113],
      description: 'Symmetrical upper Hijaz on G4.'
    },
    sayrNotes: 'Double Hijaz trichord/tetrachord. Descending sayr starting from C5 down to C4.'
  },

  // --- 5. NAHWAND FAMILY ---
  {
    id: 'nahwand',
    name: 'Nahwand',
    arabicName: 'نهوند',
    family: 'Nahwand',
    tonicNote: 'C4',
    tonicArabicName: 'Rast (C4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'B4', 'C5'],
    descendingNotes: ['C5', 'Bb4', 'Ab4', 'G4', 'F4', 'Eb4', 'D4', 'C4'],
    commas53Sequence: [9, 4, 9, 9, 4, 9, 9],
    jinsAsl: {
      name: 'Jins Nahwand',
      tonicArabicName: 'Rast (C4)',
      intervalsInCents: [204, 91, 204],
      description: 'Minor-sounding root tetrachord on C4.'
    },
    jinsFar: {
      name: 'Jins Hijaz / Kurd',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [113, 272, 113],
      description: 'Ascends using Hijaz on G (leading tone B4), descends using Kurd on G (Bb4).'
    },
    sayrNotes: 'Harmonic minor ascent with melodic minor descending resolution.'
  },

  // --- 6. KURD FAMILY ---
  {
    id: 'kurd',
    name: 'Kurd',
    arabicName: 'كرد',
    family: 'Kurd',
    tonicNote: 'D4',
    tonicArabicName: 'Dukah (D4)',
    ghammazArabicName: 'Nawa (G4)',
    scaleNotes: ['D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'],
    commas53Sequence: [4, 9, 9, 9, 4, 9, 9],
    jinsAsl: {
      name: 'Jins Kurd',
      tonicArabicName: 'Dukah (D4)',
      intervalsInCents: [91, 204, 204],
      description: 'Phrygian-like minor 2nd (Eb4) on Dukah.'
    },
    jinsFar: {
      name: 'Jins Nahwand',
      tonicArabicName: 'Nawa (G4)',
      intervalsInCents: [204, 91, 204],
      description: 'Nahwand on G4.'
    },
    sayrNotes: 'Begins smoothly on D4, moves through Eb4 with tender Phrygian flavor to G4.'
  },

  // --- 7. SABA FAMILY ---
  {
    id: 'saba',
    name: 'Saba',
    arabicName: 'صبا',
    family: 'Saba',
    tonicNote: 'D4',
    tonicArabicName: 'Dukah (D4)',
    ghammazArabicName: 'Jiharkah (F4)',
    scaleNotes: ['D4', 'Ed4', 'F4', 'Gb4', 'A4', 'Bb4', 'C5', 'Db5'],
    commas53Sequence: [6, 7, 5, 12, 5, 9, 4],
    jinsAsl: {
      name: 'Jins Saba',
      tonicArabicName: 'Dukah (D4)',
      intervalsInCents: [136, 158, 113],
      description: 'D4 to Gb4: uniquely includes a diminished 4th on Gb4.'
    },
    jinsFar: {
      name: 'Jins Hijaz',
      tonicArabicName: 'Jiharkah (F4)',
      intervalsInCents: [113, 272, 113],
      description: 'Hijaz starts directly on the 3rd degree F4!'
    },
    sayrNotes: 'Characterized by poignant sorrow and longing. The primary modulation is Hijaz starting on F4 (F4-Gb4-A4-Bb4).'
  },

  // --- 8. AJAM FAMILY ---
  {
    id: 'ajam',
    name: 'Ajam / Ajam Ushayran',
    arabicName: 'عجم / عجم عشيران',
    family: 'Ajam',
    tonicNote: 'Bb3',
    tonicArabicName: 'qarar Ajam (Bb3)',
    ghammazArabicName: 'Jiharkah (F4)',
    scaleNotes: ['Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4'],
    commas53Sequence: [9, 8, 5, 9, 9, 8, 5],
    jinsAsl: {
      name: 'Jins Ajam',
      tonicArabicName: 'qarar Ajam (Bb3)',
      intervalsInCents: [204, 181, 113],
      description: 'Major scale sound world.'
    },
    jinsFar: {
      name: 'Jins Ajam',
      tonicArabicName: 'Jiharkah (F4)',
      intervalsInCents: [204, 181, 113],
      description: 'Upper Ajam on F4.'
    },
    sayrNotes: 'Majestic and bright. Emphasizes the major triad on Bb3 and F4.'
  }
];
