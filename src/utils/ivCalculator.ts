import { Pokemon, IVs, PvPRanking, League } from '../types/pokemon'

// CP Multipliers for half-levels (0-100, corresponding to levels 1-51)
// Source: https://www.reddit.com/r/TheSilphRoad/comments/jwjbw4/level_4550_expected_cpms_based/
const CP_MULTIPLIERS: { [key: number]: number } = {
  0: 0.0939999967813491,  // Level 1
  1: 0.135137430784308,   // Level 1.5
  2: 0.166397869586944,   // Level 2
  3: 0.192650914456886,   // Level 2.5
  4: 0.215732470154762,   // Level 3
  5: 0.236572655026622,   // Level 3.5
  6: 0.255720049142837,   // Level 4
  7: 0.273530381100769,   // Level 4.5
  8: 0.29024988412857,    // Level 5
  9: 0.306057381335773,   // Level 5.5
  10: 0.321087598800659,  // Level 6
  11: 0.335445032295077,  // Level 6.5
  12: 0.349212676286697,  // Level 7
  13: 0.36245774877879,   // Level 7.5
  14: 0.375235587358474,  // Level 8
  15: 0.387592411085168,  // Level 8.5
  16: 0.399567276239395,  // Level 9
  17: 0.41119354951725,   // Level 9.5
  18: 0.422500014305114,  // Level 10
  19: 0.432926413410414,  // Level 10.5
  20: 0.443107545375824,  // Level 11
  21: 0.453059953871985,  // Level 11.5
  22: 0.46279838681221,   // Level 12
  23: 0.472336077786704,  // Level 12.5
  24: 0.481684952974319,  // Level 13
  25: 0.490855810259008,  // Level 13.5
  26: 0.499858438968658,  // Level 14
  27: 0.508701756943992,  // Level 14.5
  28: 0.517393946647644,  // Level 15
  29: 0.525942508771329,  // Level 15.5
  30: 0.534354329109191,  // Level 16
  31: 0.542635762230353,  // Level 16.5
  32: 0.550792694091796,  // Level 17
  33: 0.558830599438087,  // Level 17.5
  34: 0.566754519939422,  // Level 18
  35: 0.574569148039264,  // Level 18.5
  36: 0.582278907299041,  // Level 19
  37: 0.589887911977272,  // Level 19.5
  38: 0.59740000963211,   // Level 20
  39: 0.604823657502073,  // Level 20.5
  40: 0.61215728521347,   // Level 21
  41: 0.61940411056605,   // Level 21.5
  42: 0.626567125320434,  // Level 22
  43: 0.633649181622743,  // Level 22.5
  44: 0.640652954578399,  // Level 23
  45: 0.647580963301656,  // Level 23.5
  46: 0.654435634613037,  // Level 24
  47: 0.661219263506722,  // Level 24.5
  48: 0.667934000492096,  // Level 25
  49: 0.674581899290818,  // Level 25.5
  50: 0.681164920330047,  // Level 26
  51: 0.687684905887771,  // Level 26.5
  52: 0.694143652915954,  // Level 27
  53: 0.700542893277978,  // Level 27.5
  54: 0.706884205341339,  // Level 28
  55: 0.713169102333341,  // Level 28.5
  56: 0.719399094581604,  // Level 29
  57: 0.725575616972598,  // Level 29.5
  58: 0.731700003147125,  // Level 30
  59: 0.734741011137376,  // Level 30.5
  60: 0.737769484519958,  // Level 31
  61: 0.740785574597326,  // Level 31.5
  62: 0.743789434432983,  // Level 32
  63: 0.746781208702482,  // Level 32.5
  64: 0.749761044979095,  // Level 33
  65: 0.752729105305821,  // Level 33.5
  66: 0.75568550825119,   // Level 34
  67: 0.758630366519684,  // Level 34.5
  68: 0.761563837528228,  // Level 35
  69: 0.764486065255226,  // Level 35.5
  70: 0.767397165298461,  // Level 36
  71: 0.77029727397159,   // Level 36.5
  72: 0.77318650484085,   // Level 37
  73: 0.776064945942412,  // Level 37.5
  74: 0.778932750225067,  // Level 38
  75: 0.781790064808426,  // Level 38.5
  76: 0.784636974334716,  // Level 39
  77: 0.787473583646825,  // Level 39.5
  78: 0.790300011634826,  // Level 40
  79: 0.792803950958807,  // Level 40.5
  80: 0.795300006866455,  // Level 41
  81: 0.79780392148697,   // Level 41.5
  82: 0.800300002098083,  // Level 42
  83: 0.802803892322847,  // Level 42.5
  84: 0.805299997329711,  // Level 43
  85: 0.807803863460723,  // Level 43.5
  86: 0.81029999256134,   // Level 44
  87: 0.812803834895026,  // Level 44.5
  88: 0.815299987792968,  // Level 45
  89: 0.817803806620319,  // Level 45.5
  90: 0.820299983024597,  // Level 46
  91: 0.822803778631297,  // Level 46.5
  92: 0.825299978256225,  // Level 47
  93: 0.827803750922782,  // Level 47.5
  94: 0.830299973487854,  // Level 48
  95: 0.832803753381377,  // Level 48.5
  96: 0.835300028324127,  // Level 49
  97: 0.837803755931569,  // Level 49.5
  98: 0.840300023555755,  // Level 50
  99: 0.842803729034748,  // Level 50.5
  100: 0.845300018787384  // Level 51 (max)
}

// League CP limits
const LEAGUE_LIMITS: { [key in League]: number } = {
  'Great League': 1500,
  'Ultra League': 2500,
  'Master League': Infinity,
  'Little Cup': 500
}

// Convert Pokemon GO level to half-level index
function levelToHalfLevelIndex(level: number): number {
  return Math.max(0, (level - 1) * 2)
}

// Convert half-level index to Pokemon GO level
function halfLevelIndexToLevel(halfLevelIndex: number): number {
  return (halfLevelIndex / 2) + 1
}

// Correct Pokemon GO CP calculation formula
export const calculateCP = (pokemon: Pokemon, ivs: IVs, level: number): number => {
  const halfLevelIndex = levelToHalfLevelIndex(level)
  const cpMultiplier = CP_MULTIPLIERS[halfLevelIndex] || 0.094
  
  // Pokemon GO uses the base stats directly
  const attack = pokemon.baseStats.attack + ivs.attack
  const defense = pokemon.baseStats.defense + ivs.defense
  const stamina = pokemon.baseStats.stamina + ivs.stamina
  
  // Correct CP formula: CP = max(10, floor((BaseAttack + IV) * sqrt(BaseDefense + IV) * sqrt(BaseStamina + IV) * CPM^2 / 10))
  const cp = Math.max(10, Math.floor((attack * Math.sqrt(defense) * Math.sqrt(stamina) * cpMultiplier * cpMultiplier) / 10))
  
  return cp
}

export const calculateTotalIV = (ivs: IVs): number => {
  return ivs.attack + ivs.defense + ivs.stamina
}

export const calculateIVPercentage = (ivs: IVs): number => {
  const total = calculateTotalIV(ivs)
  return Math.round((total / 45) * 100)
}

export const findOptimalLevel = (pokemon: Pokemon, ivs: IVs, league: League): { level: number; cp: number } => {
  const cpLimit = LEAGUE_LIMITS[league]
  let optimalLevel = 1
  let optimalCP = 0

  // Check levels from 1 to 51 (max level in Pokemon GO)
  // We need to check every 0.5 level (half-levels) for true optimality
  for (let level = 1; level <= 51; level += 0.5) {
    const cp = calculateCP(pokemon, ivs, level)
    if (cp <= cpLimit && cp > optimalCP) {
      optimalCP = cp
      optimalLevel = level
    }
  }

  return { level: optimalLevel, cp: optimalCP }
}

export const calculatePvPRanking = (pokemon: Pokemon, ivs: IVs): PvPRanking[] => {
  const leagues: League[] = ['Great League', 'Ultra League', 'Master League', 'Little Cup']
  const rankings: PvPRanking[] = []

  leagues.forEach(league => {
    const { level, cp } = findOptimalLevel(pokemon, ivs, league)
    const totalIV = calculateTotalIV(ivs)
    const ivPercentage = calculateIVPercentage(ivs)
    
    // Calculate actual ranking based on IV combinations
    let rank = 1
    let percentPerfect = 100
    
    if (league === 'Master League') {
      // For Master League, perfect IVs (15/15/15) should always be #1
      if (ivs.attack === 15 && ivs.defense === 15 && ivs.stamina === 15) {
        rank = 1
        percentPerfect = 100
      } else {
        // Calculate how many IV combinations are better than current one
        let betterCombinations = 0
        for (let a = 0; a <= 15; a++) {
          for (let d = 0; d <= 15; d++) {
            for (let s = 0; s <= 15; s++) {
              const otherTotal = a + d + s
              const currentTotal = totalIV
              
              // If other combination has higher total IVs, it's better
              if (otherTotal > currentTotal) {
                betterCombinations++
              } else if (otherTotal === currentTotal) {
                // If same total, compare individual stats (attack first, then defense, then stamina)
                if (a > ivs.attack) {
                  betterCombinations++
                } else if (a === ivs.attack && d > ivs.defense) {
                  betterCombinations++
                } else if (a === ivs.attack && d === ivs.defense && s > ivs.stamina) {
                  betterCombinations++
                }
              }
            }
          }
        }
        rank = betterCombinations + 1
        // For Master League, percent perfect is based on total IVs
        percentPerfect = (totalIV / 45) * 100
      }
    } else {
      // For Great and Ultra League, rank based on stat product at optimal level
      const currentHalfLevelIndex = levelToHalfLevelIndex(level)
      const currentCpMultiplier = CP_MULTIPLIERS[currentHalfLevelIndex]
      
      // Calculate current stat product using correct formula
      const currentAttack = (pokemon.baseStats.attack + ivs.attack) * currentCpMultiplier
      const currentDefense = (pokemon.baseStats.defense + ivs.defense) * currentCpMultiplier
      const currentStamina = Math.floor((pokemon.baseStats.stamina + ivs.stamina) * currentCpMultiplier)
      const currentStatProduct = currentStamina * currentAttack * currentDefense
      
      let betterCombinations = 0
      let totalValidCombinations = 0
      let rank1StatProduct = 0
      
      // First pass: find rank 1 stat product
      for (let a = 0; a <= 15; a++) {
        for (let d = 0; d <= 15; d++) {
          for (let s = 0; s <= 15; s++) {
            const otherIvs = { attack: a, defense: d, stamina: s }
            const otherOptimal = findOptimalLevel(pokemon, otherIvs, league)
            
            if (otherOptimal.cp > 0 && otherOptimal.cp <= LEAGUE_LIMITS[league]) {
              const otherHalfLevelIndex = levelToHalfLevelIndex(otherOptimal.level)
              const otherCpMultiplier = CP_MULTIPLIERS[otherHalfLevelIndex]
              
              const otherAttack = (pokemon.baseStats.attack + a) * otherCpMultiplier
              const otherDefense = (pokemon.baseStats.defense + d) * otherCpMultiplier
              const otherStamina = Math.floor((pokemon.baseStats.stamina + s) * otherCpMultiplier)
              const otherStatProduct = otherStamina * otherAttack * otherDefense
              
              if (rank1StatProduct === 0 || otherStatProduct > rank1StatProduct) {
                rank1StatProduct = otherStatProduct
              }
            }
          }
        }
      }
      
      // Second pass: calculate ranking and percent perfect
      for (let a = 0; a <= 15; a++) {
        for (let d = 0; d <= 15; d++) {
          for (let s = 0; s <= 15; s++) {
            const otherIvs = { attack: a, defense: d, stamina: s }
            const otherOptimal = findOptimalLevel(pokemon, otherIvs, league)
            
            // Only compare if the other combination can fit within the league CP limit
            // and has a valid CP (greater than 0)
            if (otherOptimal.cp > 0 && otherOptimal.cp <= LEAGUE_LIMITS[league]) {
              totalValidCombinations++
              const otherHalfLevelIndex = levelToHalfLevelIndex(otherOptimal.level)
              const otherCpMultiplier = CP_MULTIPLIERS[otherHalfLevelIndex]
              
              // Calculate other stat product using correct formula
              const otherAttack = (pokemon.baseStats.attack + a) * otherCpMultiplier
              const otherDefense = (pokemon.baseStats.defense + d) * otherCpMultiplier
              const otherStamina = Math.floor((pokemon.baseStats.stamina + s) * otherCpMultiplier)
              const otherStatProduct = otherStamina * otherAttack * otherDefense
              
              // Higher stat product = better performance
              if (otherStatProduct > currentStatProduct) {
                betterCombinations++
              } else if (otherStatProduct === currentStatProduct) {
                // If same stat product, prefer higher total IVs
                const otherTotal = a + d + s
                if (otherTotal > totalIV) {
                  betterCombinations++
                }
              }
            }
          }
        }
      }
      
      // Rank is how many combinations are better + 1
      // But we need to ensure we're ranking within the valid combinations only
      rank = betterCombinations + 1
      
      // Calculate percent perfect
      if (rank1StatProduct > 0) {
        percentPerfect = (currentStatProduct / rank1StatProduct) * 100
      }
    }
    
    rankings.push({
      league,
      rank,
      percentage: ivPercentage,
      maxCP: cp,
      level,
      percentPerfect
    })
  })

  return rankings
}

export const validateIVs = (ivs: IVs): boolean => {
  return ivs.attack >= 0 && ivs.attack <= 15 &&
         ivs.defense >= 0 && ivs.defense <= 15 &&
         ivs.stamina >= 0 && ivs.stamina <= 15
} 