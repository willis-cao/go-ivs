export interface Pokemon {
  id: number
  name: string
  types: string[]
  baseStats: {
    attack: number
    defense: number
    stamina: number
  }
  maxCP: number
  height: number // in meters
  weight: number // in kg
  sprites: {
    front_default: string
    official_artwork: string
  }
  evolutionChain?: number[]
  isMega?: boolean // Indicates if this is a Mega form
  basePokemonId?: number // ID of the base Pokemon (for Mega forms)
  isRegional?: boolean // Indicates if this is a regional form
  region?: string // Region name (Alola, Galar, Hisui, Paldea, etc.)
}

export interface IVs {
  attack: number | null
  defense: number | null
  stamina: number | null
}

export interface HistoryEntry {
  id: string
  pokemon: Pokemon
  ivs: IVs
  cp: number | null
  timestamp: number
  rankingSummary: string
}

export interface PvPRanking {
  league: string
  rank: number
  percentage: number
  maxCP: number
  level: number
  percentPerfect: number
}

export interface PokemonIVResult {
  pokemon: Pokemon
  ivs: IVs
  pvpRankings: PvPRanking[]
  totalIV: number
  ivPercentage: number
}

export type League = 'Great League' | 'Ultra League' | 'Master League' | 'Little Cup' 