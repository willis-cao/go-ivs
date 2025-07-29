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

async function fetchPokemonForms(id) {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    const species = response.data
    
    if (!species.varieties || species.varieties.length <= 1) {
      return [] // No additional forms
    }
    
    const forms = []
    
    for (const variety of species.varieties) {
      if (variety.is_default) continue // Skip the default form (already fetched)
      
      try {
        const formResponse = await axios.get(variety.pokemon.url)
        const formData = formResponse.data
        
        // Only include Mega forms
        if (formData.name.includes('mega') || formData.name.includes('megax') || formData.name.includes('megay')) {
          const baseStats = convertToPokemonGOStats(formData.stats)
          const maxCP = calculateMaxCP(baseStats)
          
          // Create a unique ID for the Mega form
          const megaId = parseInt(formData.id) + 10000 // Use 10000+ for Mega forms
          
          // Fix the naming to be more readable
          let displayName = formData.name
          
          // Handle different Mega naming patterns from the API
          if (formData.name.endsWith('-mega-x')) {
            // Pattern: "charizard-mega-x"
            const parts = formData.name.split('-')
            const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
            displayName = `Mega ${baseName} X`
          } else if (formData.name.endsWith('-mega-y')) {
            // Pattern: "charizard-mega-y"
            const parts = formData.name.split('-')
            const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
            displayName = `Mega ${baseName} Y`
          } else if (formData.name.endsWith('-mega')) {
            // Pattern: "charizard-mega", "blastoise-mega", etc.
            const parts = formData.name.split('-')
            const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
            displayName = `Mega ${baseName}`
          } else if (formData.name.includes('mega-')) {
            // Pattern: "mega-charizard-x" or "mega-charizard"
            const parts = formData.name.split('-')
            if (parts.length >= 3) {
              const baseName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
              const megaType = parts[2].toUpperCase()
              displayName = `Mega ${baseName} ${megaType}`
            } else if (parts.length === 2) {
              // Handle cases like "mega-charizard"
              const baseName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
              displayName = `Mega ${baseName}`
            }
          } else if (formData.name.includes('megax')) {
            // Pattern: "charizard-megax" (fallback)
            const parts = formData.name.split('-')
            const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
            displayName = `Mega ${baseName} X`
          } else if (formData.name.includes('megay')) {
            // Pattern: "charizard-megay" (fallback)
            const parts = formData.name.split('-')
            const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
            displayName = `Mega ${baseName} Y`
          }
          
          forms.push({
            id: megaId,
            name: displayName,
            types: formData.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
            baseStats,
            maxCP,
            height: formData.height / 10,
            weight: formData.weight / 10,
            sprites: {
              front_default: formData.sprites.front_default,
              official_artwork: formData.sprites.other['official-artwork'].front_default
            },
            isMega: true,
            basePokemonId: id
          })
        }
      } catch (error) {
        console.warn(`Could not fetch form ${variety.pokemon.name} for Pokemon ${id}`)
      }
    }
    
    return forms
  } catch (error) {
    console.warn(`Could not fetch forms for Pokemon ${id}`)
    return []
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
  const totalPokemon = 1025 // Fetch ALL Pokemon (up to current generation)
  const pokemonData = []
  const megaForms = [] // NEW: Array to store Mega forms
  
  console.log(`Fetching data for ${totalPokemon} Pokemon...`)
  
  // Process in batches of 10 to avoid overwhelming the API
  const batchSize = 10
  
  for (let batchStart = 1; batchStart <= totalPokemon; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, totalPokemon)
    console.log(`Fetching batch ${batchStart}-${batchEnd}/${totalPokemon}...`)
    
    const batchPromises = []
    
    for (let id = batchStart; id <= batchEnd; id++) {
      batchPromises.push(fetchPokemonWithForms(id))
    }
    
    try {
      const batchResults = await Promise.all(batchPromises)
      
      for (const result of batchResults) {
        if (result.pokemon) {
          pokemonData.push(result.pokemon)
        }
        if (result.megaForms && result.megaForms.length > 0) {
          megaForms.push(...result.megaForms)
        }
      }
    } catch (error) {
      console.error(`Error in batch ${batchStart}-${batchEnd}:`, error)
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 50)) // Reduced batch delay for faster fetching
  }
  
  // NEW: Combine regular Pokemon and Mega forms
  const allPokemon = [...pokemonData, ...megaForms]
  
  // Sort by ID
  allPokemon.sort((a, b) => a.id - b.id) // Sort the combined array
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'pokemonFromAPI.ts')
  const fileContent = `// Auto-generated Pokemon data from PokeAPI (including Mega forms) // UPDATED COMMENT
// Generated on: ${new Date().toISOString()}
// Note: Using correct Pokemon GO stat conversion formula from Pokemon GO Hub

import { Pokemon } from '../types/pokemon'

export const POKEMON_DATABASE: Pokemon[] = ${JSON.stringify(allPokemon, null, 2)} // Use allPokemon

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
  console.log(`✅ Successfully generated Pokemon data for ${pokemonData.length} regular Pokemon and ${megaForms.length} Mega forms`) // UPDATED LOG
  console.log(`📁 Data saved to: ${outputPath}`)
}

// Helper function to fetch a single Pokemon with all its forms
async function fetchPokemonWithForms(id) {
  try {
    console.log(`Fetching Pokemon ${id}...`)
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
    
    // NEW: Fetch Mega forms if available
    let megaForms = []
    try {
      const forms = await fetchPokemonForms(id)
      if (forms.length > 0) {
        megaForms = forms
        console.log(`Found ${forms.length} Mega form(s) for ${pokemon.name}`)
      }
    } catch (error) {
      console.warn(`Could not fetch Mega forms for Pokemon ${id}`)
    }
    
    // Small delay between individual Pokemon requests
    await new Promise(resolve => setTimeout(resolve, 10)) // 10ms delay for faster fetching
    
    return { pokemon, megaForms }
    
  } catch (error) {
    console.error(`Failed to fetch Pokemon ${id}:`, error)
    return { pokemon: null, megaForms: [] }
  }
}

// Run the script
fetchAllPokemonData().catch(console.error) 