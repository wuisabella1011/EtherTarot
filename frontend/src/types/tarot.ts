// ── Card Types ──

export type ArcanaType = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Orientation = 'upright' | 'reversed';
export type SpreadType = 'single' | 'three-card' | 'celtic-cross';
export type InterpretationTone = 'philosophical' | 'psychological';

export interface TarotCard {
  id: string;
  name_en: string;
  name_zh: string;
  arcana: ArcanaType;
  suit: Suit | null;
  number: number;
  keywords_upright: string[];
  keywords_reversed: string[];
  upright_meaning: string;
  reversed_meaning: string;
  psychological_archetype: string;
  symbolism: string;
  element: string | null;
  planet: string | null;
  zodiac: string | null;
  aspect_shadow: string;
  aspect_light: string;
  soul_question: string;
}

// ── Draw Types ──

export interface DrawnCard {
  card: TarotCard;
  position: string;
  orientation: Orientation;
  position_description: string;
}

export interface DrawResponse {
  cards: DrawnCard[];
  seed: string;
  timestamp: string;
}

// ── Spread Types ──

export interface SpreadPosition {
  id: string;
  label: string;
  description: string;
  grid_area: string;
}

export interface SpreadDefinition {
  type: SpreadType;
  name: string;
  name_zh: string;
  description: string;
  card_count: number;
  positions: SpreadPosition[];
}

// ── Interpretation Types ──

export interface DimensionSection {
  title: string;
  narrative: string;
}

export interface ThreeDimensions {
  situation: DimensionSection;
  dynamics: DimensionSection;
  transcendence: DimensionSection;
}

export interface CardNote {
  card_id: string;
  card_name: string;
  position: string;
  orientation: string;
  positional_meaning: string;
  key_symbol: string;
}

export interface InterpretationReport {
  overview: string;
  three_dimensions: ThreeDimensions;
  synthesis: string;
  card_notes: CardNote[];
}
