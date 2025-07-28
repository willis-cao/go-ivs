import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Pokemon GO CP calculation constants
const CP_MULTIPLIER_51 = 0.845300018787384 // Level 51 CP multiplier (half-level index 100)

// Convert PokeAPI stats to Pokemon GO base stats using the correct formula
function convertToPokemonGOStats(pokeAPIStats) {
  const statsMap = {}
  pokeAPIStats.forEach(stat => {
    statsMap[stat.stat.name] = stat.base_stat
  })
  
  // Get the required stats
  const attack = statsMap['attack'] || 0
  const specialAttack = statsMap['special-attack'] || 0
  const speed = statsMap['speed'] || 75
  const defense = statsMap['defense'] || 0
  const specialDefense = statsMap['special-defense'] || 0
  const hp = statsMap['hp'] || 0
  
  // Calculate Base Attack using the correct formula
  const higher = Math.max(attack, specialAttack)
  const lower = Math.min(attack, specialAttack)
  const scaledAttack = Math.round(2 * ((7/8) * higher + (1/8) * lower))
  const speedMod = 1 + ((speed - 75) / 500)
  const baseAttack = Math.round(scaledAttack * speedMod)
  
  // Calculate Base Defense using the correct formula (different weighting)
  const higherDef = Math.max(defense, specialDefense)
  const lowerDef = Math.min(defense, specialDefense)
  const scaledDefense = Math.round(2 * ((5/8) * higherDef + (3/8) * lowerDef))
  const baseDefense = Math.round(scaledDefense * speedMod)
  
  // Calculate Base Stamina using the correct formula
  const baseStamina = Math.floor(hp * 1.75 + 50)
  
  return {
    attack: baseAttack,
    defense: baseDefense,
    stamina: baseStamina
  }
}

// Calculate max CP for level 51 with perfect IVs using the correct formula
function calculateMaxCP(stats) {
  const attack = stats.attack + 15 // Perfect IVs
  const defense = stats.defense + 15
  const stamina = stats.stamina + 15
  
  // Correct CP formula: CP = floor(max(10, (BaseAttack * BaseDefense^0.5 * BaseStamina^0.5 * CPM^2)/(10)))
  const cp = Math.floor(Math.max(10, (attack * Math.sqrt(defense) * Math.sqrt(stamina) * CP_MULTIPLIER_51 * CP_MULTIPLIER_51) / 10))
  
  return cp
}

async function fetchPokemonData(id) {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const pokemon = response.data
    
    const baseStats = convertToPokemonGOStats(pokemon.stats)
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

async function fetchEvolutionChain(evolutionChainUrl) {
  try {
    const response = await axios.get(evolutionChainUrl)
    const chain = response.data.chain
    
    const evolutionIds = []
    
    function traverseChain(chainLink) {
      if (chainLink.species) {
        const pokemonId = parseInt(chainLink.species.url.split('/').slice(-2)[0])
        evolutionIds.push(pokemonId)
      }
      
      if (chainLink.evolves_to) {
        chainLink.evolves_to.forEach((evolution) => {
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

async function fetchAllPokemonData() {
  const totalPokemon = 10 // Only fetch 10 Pokemon for faster testing
  const pokemonData = []
  
  console.log(`Fetching data for ${totalPokemon} Pokemon (testing mode)...`)
  
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
  const fileContent = `// Auto-generated Pokemon data from PokeAPI (TESTING MODE - 10 Pokemon only)
// Generated on: ${new Date().toISOString()}
// Note: Using correct Pokemon GO stat conversion formula from Pokemon GO Hub

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
  console.log(`✅ Successfully generated Pokemon data for ${pokemonData.length} Pokemon (testing mode)`)
  console.log(`📁 Data saved to: ${outputPath}`)
}

// Run the script
fetchAllPokemonData().catch(console.error) 