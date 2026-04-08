// Instrument types for performer song selections

export enum InstrumentType {
  GUITAR = "Guitar",
  DRUMS = "Drums",
  BASS = "Bass",
  PIANO = "Piano",
  OTHER = "Other"
}

// Helper to get all instrument values as an array
export const INSTRUMENTS = Object.values(InstrumentType);
