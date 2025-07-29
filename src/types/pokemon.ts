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