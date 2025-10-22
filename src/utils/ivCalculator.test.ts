import { describe, it, expect } from 'vitest'
import {
  calculateCP,
  calculateTotalIV,
  calculateIVPercentage,
  findOptimalLevel,
  calculatePvPRanking,
  reverseCalculateLevel,
  validateIVs
} from './ivCalculator'
import { Pokemon, IVs, League } from '../types/pokemon'

// Test Pokemon data
const charizard: Pokemon = {
  id: 6,
  name: "Charizard",
  types: ["Fire", "Flying"],
  baseStats: {
    attack: 223,
    defense: 173,
    stamina: 186
  },
  maxCP: 3305,
  height: 1.7,
  weight: 90.5,
  sprites: {
    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
    official_artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
  },
  evolutionChain: [4, 5, 6]
}

const megaCharizardX: Pokemon = {
  id: 20034,
  name: "Mega Charizard X",
  types: ["Fire", "Dragon"],
  baseStats: {
    attack: 273,
    defense: 213,
    stamina: 186
  },
  maxCP: 4405,
  height: 1.7,
  weight: 110.5,
  sprites: {
    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10034.png",
    official_artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10034.png"
  },
  isMega: true,
  basePokemonId: 6
}

const bulbasaur: Pokemon = {
  id: 1,
  name: "Bulbasaur",
  types: ["Grass", "Poison"],
  baseStats: {
    attack: 118,
    defense: 111,
    stamina: 128
  },
  maxCP: 1275,
  height: 0.7,
  weight: 6.9,
  sprites: {
    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    official_artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
  },
  evolutionChain: [1, 2, 3]
}

const venusaur: Pokemon = {
  id: 3,
  name: "Venusaur",
  types: ["Grass", "Poison"],
  baseStats: {
    attack: 198,
    defense: 189,
    stamina: 190
  },
  maxCP: 3112,
  height: 2,
  weight: 100,
  sprites: {
    front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
    official_artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png"
  },
  evolutionChain: [1, 2, 3]
}

describe('ivCalculator', () => {
  describe('calculateCP', () => {
    it('should calculate CP correctly for Charizard 15/15/15 at level 51', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      const cp = calculateCP(charizard, ivs, 51)
      expect(cp).toBe(3305)
    })

    it('should calculate CP correctly for Charizard 15/14/15 at level 51', () => {
      const ivs: IVs = { attack: 15, defense: 14, stamina: 15 }
      const cp = calculateCP(charizard, ivs, 51)
      expect(cp).toBe(3296)
    })

    it('should calculate CP correctly for Charizard 0/0/0 at level 40', () => {
      const ivs: IVs = { attack: 0, defense: 0, stamina: 0 }
      const cp = calculateCP(charizard, ivs, 40)
      expect(cp).toBe(2498)
    })

    it('should calculate CP correctly for Mega Charizard X 15/15/15 at level 51', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      const cp = calculateCP(megaCharizardX, ivs, 51)
      expect(cp).toBe(4405)
    })

    it('should calculate CP correctly for Bulbasaur 15/15/15 at level 20', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      const cp = calculateCP(bulbasaur, ivs, 20)
      expect(cp).toBe(637)
    })

    it('should have minimum CP of 10', () => {
      const ivs: IVs = { attack: 0, defense: 0, stamina: 0 }
      const cp = calculateCP(bulbasaur, ivs, 1)
      expect(cp).toBe(12)
    })
  })

  describe('calculateTotalIV', () => {
    it('should calculate total IV correctly for 15/15/15', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      expect(calculateTotalIV(ivs)).toBe(45)
    })

    it('should calculate total IV correctly for 0/0/0', () => {
      const ivs: IVs = { attack: 0, defense: 0, stamina: 0 }
      expect(calculateTotalIV(ivs)).toBe(0)
    })

    it('should calculate total IV correctly for 10/12/14', () => {
      const ivs: IVs = { attack: 10, defense: 12, stamina: 14 }
      expect(calculateTotalIV(ivs)).toBe(36)
    })
  })

  describe('calculateIVPercentage', () => {
    it('should calculate IV percentage correctly for 15/15/15', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      expect(calculateIVPercentage(ivs)).toBe(100)
    })

    it('should calculate IV percentage correctly for 0/0/0', () => {
      const ivs: IVs = { attack: 0, defense: 0, stamina: 0 }
      expect(calculateIVPercentage(ivs)).toBe(0)
    })

    it('should calculate IV percentage correctly for 10/10/10', () => {
      const ivs: IVs = { attack: 10, defense: 10, stamina: 10 }
      expect(calculateIVPercentage(ivs)).toBe(67)
    })
  })

  describe('findOptimalLevel', () => {
    it('should find optimal level for Great League', () => {
      const ivs: IVs = { attack: 0, defense: 15, stamina: 15 }
      const result = findOptimalLevel(charizard, ivs, 'Great League', 50)
      expect(result.level).toBe(19)
      expect(result.cp).toBe(1469)
    })

    it('should find optimal level for Ultra League', () => {
      const ivs: IVs = { attack: 0, defense: 15, stamina: 15 }
      const result = findOptimalLevel(charizard, ivs, 'Ultra League', 50)
      expect(result.level).toBe(34.5)
      expect(result.cp).toBe(2494)
    })

    it('should find optimal level for Little Cup', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      const result = findOptimalLevel(bulbasaur, ivs, 'Little Cup', 50)
      expect(result.level).toBe(15.5)
      expect(result.cp).toBe(493)
    })

    it('should max out at maxLevel for Master League', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      const result = findOptimalLevel(charizard, ivs, 'Master League', 51)
      expect(result.level).toBe(51)
      expect(result.cp).toBe(3305)
    })
  })

  describe('calculatePvPRanking', () => {
    describe('Charizard - Master League', () => {
      it('should rank 15/15/15 as #1 in Master League with XL candy', () => {
        const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
        const rankings = calculatePvPRanking(charizard, ivs, null, false, true, false)
        const masterLeague = rankings.find(r => r.league === 'Master League')

        expect(masterLeague).toBeDefined()
        expect(masterLeague!.rank).toBe(1)
        expect(masterLeague!.maxCP).toBe(3266)
        expect(masterLeague!.level).toBe(50)
        expect(masterLeague!.percentPerfect).toBe(100)
      })

      it('should rank 15/14/15 correctly in Master League with best buddy and XL', () => {
        const ivs: IVs = { attack: 15, defense: 14, stamina: 15 }
        const rankings = calculatePvPRanking(charizard, ivs, null, true, true, false)
        const masterLeague = rankings.find(r => r.league === 'Master League')

        expect(masterLeague).toBeDefined()
        expect(masterLeague!.rank).toBe(5)
        expect(masterLeague!.maxCP).toBe(3296)
        expect(masterLeague!.level).toBe(51)
      })

      it('should rank 14/15/15 differently than 15/14/15 in Master League', () => {
        const ivs1: IVs = { attack: 14, defense: 15, stamina: 15 }
        const ivs2: IVs = { attack: 15, defense: 14, stamina: 15 }

        const rankings1 = calculatePvPRanking(charizard, ivs1, null, true, true, false)
        const rankings2 = calculatePvPRanking(charizard, ivs2, null, true, true, false)

        const master1 = rankings1.find(r => r.league === 'Master League')
        const master2 = rankings2.find(r => r.league === 'Master League')

        expect(master1!.rank).not.toBe(master2!.rank)
      })
    })

    describe('Charizard - Great League', () => {
      it('should rank 0/15/15 highly in Great League', () => {
        const ivs: IVs = { attack: 0, defense: 15, stamina: 15 }
        const rankings = calculatePvPRanking(charizard, ivs, null, false, true, false)
        const greatLeague = rankings.find(r => r.league === 'Great League')

        expect(greatLeague).toBeDefined()
        expect(greatLeague!.rank).toBe(235)
        expect(greatLeague!.maxCP).toBe(1469)
        expect(greatLeague!.percentPerfect).toBeGreaterThan(95)
      })

      it('should rank 15/15/15 poorly in Great League', () => {
        const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
        const rankings = calculatePvPRanking(charizard, ivs, null, false, true, false)
        const greatLeague = rankings.find(r => r.league === 'Great League')

        expect(greatLeague).toBeDefined()
        expect(greatLeague!.rank).toBe(1666)
      })
    })

    describe('Charizard - Ultra League', () => {
      it('should find optimal ranking for Ultra League', () => {
        const ivs: IVs = { attack: 0, defense: 14, stamina: 15 }
        const rankings = calculatePvPRanking(charizard, ivs, null, false, true, false)
        const ultraLeague = rankings.find(r => r.league === 'Ultra League')

        expect(ultraLeague).toBeDefined()
        expect(ultraLeague!.maxCP).toBeLessThanOrEqual(2500)
        expect(ultraLeague!.rank).toBeGreaterThan(0)
        expect(ultraLeague!.rank).toBeLessThanOrEqual(4096)
      })
    })

    describe('Bulbasaur - Little Cup', () => {
      it('should rank in Little Cup correctly', () => {
        const ivs: IVs = { attack: 0, defense: 15, stamina: 15 }
        const rankings = calculatePvPRanking(bulbasaur, ivs, null, false, false, true)
        const littleCup = rankings.find(r => r.league === 'Little Cup')

        expect(littleCup).toBeDefined()
        expect(littleCup!.maxCP).toBeLessThanOrEqual(500)
        expect(littleCup!.rank).toBeGreaterThan(0)
      })
    })

    describe('Mega Charizard X', () => {
      it('should calculate correct CP for Mega in Master League', () => {
        const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
        const rankings = calculatePvPRanking(megaCharizardX, ivs, null, false, true, false)
        const masterLeague = rankings.find(r => r.league === 'Master League')

        expect(masterLeague).toBeDefined()
        expect(masterLeague!.rank).toBe(1)
        expect(masterLeague!.maxCP).toBe(4353)
      })
    })

    describe('Multiple Leagues', () => {
      it('should return rankings for all 4 leagues when showLittleCup is true', () => {
        const ivs: IVs = { attack: 10, defense: 10, stamina: 10 }
        const rankings = calculatePvPRanking(venusaur, ivs, null, false, true, true)

        expect(rankings).toHaveLength(4)
        expect(rankings.map(r => r.league)).toEqual([
          'Great League',
          'Ultra League',
          'Master League',
          'Little Cup'
        ])
      })

      it('should return rankings for 3 leagues when showLittleCup is false', () => {
        const ivs: IVs = { attack: 10, defense: 10, stamina: 10 }
        const rankings = calculatePvPRanking(venusaur, ivs, null, false, true, false)

        expect(rankings).toHaveLength(3)
        expect(rankings.map(r => r.league)).toEqual([
          'Great League',
          'Ultra League',
          'Master League'
        ])
      })
    })

    describe('XL Candy and Best Buddy variations', () => {
      it('should have different max CP with XL candy enabled vs disabled', () => {
        const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }

        const withXL = calculatePvPRanking(charizard, ivs, null, false, true, false)
        const withoutXL = calculatePvPRanking(charizard, ivs, null, false, false, false)

        const masterWithXL = withXL.find(r => r.league === 'Master League')
        const masterWithoutXL = withoutXL.find(r => r.league === 'Master League')

        expect(masterWithXL!.maxCP).toBeGreaterThan(masterWithoutXL!.maxCP)
      })

      it('should have different max CP with best buddy enabled', () => {
        const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }

        const withBuddy = calculatePvPRanking(charizard, ivs, null, true, true, false)
        const withoutBuddy = calculatePvPRanking(charizard, ivs, null, false, true, false)

        const masterWithBuddy = withBuddy.find(r => r.league === 'Master League')
        const masterWithoutBuddy = withoutBuddy.find(r => r.league === 'Master League')

        expect(masterWithBuddy!.maxCP).toBeGreaterThan(masterWithoutBuddy!.maxCP)
        expect(masterWithBuddy!.level).toBe(51)
        expect(masterWithoutBuddy!.level).toBe(50)
      })
    })
  })

  describe('reverseCalculateLevel', () => {
    it('should reverse calculate level from CP correctly', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      const targetCP = 3266 // Charizard 15/15/15 at level 50
      const level = reverseCalculateLevel(charizard, ivs, targetCP)
      expect(level).toBe(50)
    })

    it('should find closest level when exact match does not exist', () => {
      const ivs: IVs = { attack: 10, defense: 10, stamina: 10 }
      const targetCP = 2000
      const level = reverseCalculateLevel(charizard, ivs, targetCP)
      const calculatedCP = calculateCP(charizard, ivs, level)
      expect(Math.abs(calculatedCP - targetCP)).toBeLessThanOrEqual(10)
    })
  })

  describe('validateIVs', () => {
    it('should validate correct IVs', () => {
      const ivs: IVs = { attack: 15, defense: 15, stamina: 15 }
      expect(validateIVs(ivs)).toBe(true)
    })

    it('should validate IVs at minimum', () => {
      const ivs: IVs = { attack: 0, defense: 0, stamina: 0 }
      expect(validateIVs(ivs)).toBe(true)
    })

    it('should invalidate IVs above 15', () => {
      const ivs: IVs = { attack: 16, defense: 15, stamina: 15 }
      expect(validateIVs(ivs)).toBe(false)
    })

    it('should invalidate negative IVs', () => {
      const ivs: IVs = { attack: -1, defense: 15, stamina: 15 }
      expect(validateIVs(ivs)).toBe(false)
    })

    it('should invalidate null IVs', () => {
      const ivs: IVs = { attack: null as any, defense: 15, stamina: 15 }
      expect(validateIVs(ivs)).toBe(false)
    })
  })
})
