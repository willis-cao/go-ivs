import axios from 'axios'
import fs from 'fs'
import path from 'path'

interface PokeAPIPokemon {
  id: number
  name: string
  types: Array<{ type: { name: string } }>
  stats: Array<{
    base_stat: number
    stat: { name: string }
  }>
  height: number
  weight: number
  sprites: {
    front_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  evolution_chain?: {
    url: string
  }
}

interface PokemonData {
  id: number
  name: string
  types: string[]
  baseStats: {
    attack: number
    defense: number
    stamina: number
  }
  maxCP: number
  height: number
  weight: number
  sprites: {
    front_default: string
    official_artwork: string
  }
  evolutionChain?: number[]
}

// Pokemon GO CP calculation constants
const CP_MULTIPLIER_40 = 0.79030001 // Level 40 CP multiplier
const BASE_ATTACK_MULTIPLIER = 0.5
const BASE_DEFENSE_MULTIPLIER = 0.5
const BASE_STAMINA_MULTIPLIER = 0.5

// Convert PokeAPI stats to Pokemon GO stats
function convertStats(pokeAPIStats: PokeAPIPokemon['stats']): { attack: number; defense: number; stamina: number } {
  const statsMap: { [key: string]: number } = {}
  
  pokeAPIStats.forEach(stat => {
    statsMap[stat.stat.name] = stat.base_stat
  })
  
  // Pokemon GO uses different stat calculations
  // Attack = (Base Attack * 2 + 15) * 0.5
  // Defense = (Base Defense * 2 + 15) * 0.5  
  // Stamina = (Base HP * 2 + 15) * 0.5
  const attack = Math.floor((statsMap['attack'] * 2 + 15) * BASE_ATTACK_MULTIPLIER)
  const defense = Math.floor((statsMap['defense'] * 2 + 15) * BASE_DEFENSE_MULTIPLIER)
  const stamina = Math.floor((statsMap['hp'] * 2 + 15) * BASE_STAMINA_MULTIPLIER)
  
  return { attack, defense, stamina }
}

// Calculate max CP for level 40
function calculateMaxCP(stats: { attack: number; defense: number; stamina: number }): number {
  const attack = stats.attack + 15 // Perfect IVs
  const defense = stats.defense + 15
  const stamina = stats.stamina + 15
  
  return Math.floor(attack * Math.sqrt(defense) * Math.sqrt(stamina) * CP_MULTIPLIER_40 * CP_MULTIPLIER_40 / 10)
}

async function fetchPokemonData(id: number): Promise<PokemonData> {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const pokemon: PokeAPIPokemon = response.data
    
    const baseStats = convertStats(pokemon.stats)
    const maxCP = calculateMaxCP(baseStats)
    
    return {
      id: pokemon.id,
      name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
      types: pokemon.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
      baseStats,
      maxCP,
      height: pokemon.height / 10, // Convert to meters
      weight: pokemon.weight / 10, // Convert to kg
      sprites: {
        front_default: pokemon.sprites.front_default,
        official_artwork: pokemon.sprites.other['official-artwork'].front_default
      }
    }
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error)
    throw error
  }
}

async function fetchEvolutionChain(evolutionChainUrl: string): Promise<number[]> {
  try {
    const response = await axios.get(evolutionChainUrl)
    const chain = response.data.chain
    
    const evolutionIds: number[] = []
    
    function traverseChain(chainLink: any) {
      if (chainLink.species) {
        const pokemonId = parseInt(chainLink.species.url.split('/').slice(-2)[0])
        evolutionIds.push(pokemonId)
      }
      
      if (chainLink.evolves_to) {
        chainLink.evolves_to.forEach((evolution: any) => {
          traverseChain(evolution)
        })
      }
    }
    
    traverseChain(chain)
    return evolutionIds
  } catch (error) {
    console.error('Error fetching evolution chain:', error)
    return []
  }
}

async function fetchAllPokemonData(): Promise<void> {
  const totalPokemon = 151 // Start with original 151 Pokemon
  const pokemonData: PokemonData[] = []

  console.log(`Fetching data for ${totalPokemon} Pokemon...`)

  for (let id = 1; id <= totalPokemon; id++) {
    try {
      console.log(`Fetching Pokemon ${id}/${totalPokemon}...`)
      const pokemon = await fetchPokemonData(id)

      // Fetch evolution chain if available
      try {
        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        if (speciesResponse.data.evolution_chain?.url) {
          pokemon.evolutionChain = await fetchEvolutionChain(speciesResponse.data.evolution_chain.url)
        }
      } catch (error) {
        console.warn(`Could not fetch evolution chain for Pokemon ${id}`)
      }

      pokemonData.push(pokemon)

      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`Failed to fetch Pokemon ${id}:`, error)
    }
  }
  
  // Sort by ID
  pokemonData.sort((a, b) => a.id - b.id)
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'pokemonFromAPI.ts')
  const fileContent = `// Auto-generated Pokemon data from PokeAPI
// Generated on: ${new Date().toISOString()}

import { Pokemon } from '../types/pokemon'

export const POKEMON_DATABASE: Pokemon[] = ${JSON.stringify(pokemonData, null, 2)}

export const findPokemonById = (id: number): Pokemon | undefined => {
  return POKEMON_DATABASE.find(pokemon => pokemon.id === id)
}

export const findPokemonByName = (name: string): Pokemon | undefined => {
  return POKEMON_DATABASE.find(pokemon =>
    pokemon.name.toLowerCase().includes(name.toLowerCase())
  )
}

export const getAllPokemon = (): Pokemon[] => {
  return POKEMON_DATABASE
}

export const searchPokemon = (query: string): Pokemon[] => {
  const lowerQuery = query.toLowerCase()
  return POKEMON_DATABASE.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    pokemon.types.some(type => type.toLowerCase().includes(lowerQuery))
  )
}
`

  fs.writeFileSync(outputPath, fileContent)
  console.log(`✅ Successfully generated Pokemon data for ${pokemonData.length} Pokemon`)
  console.log(`📁 Data saved to: ${outputPath}`)
}

// Run the script
fetchAllPokemonData().catch(console.error) 