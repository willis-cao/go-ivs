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

    // Get the Pokemon's species to determine if this is a form or base Pokemon
    let pokemonName = pokemon.name
    let displayName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)

    // If the Pokemon name contains a hyphen, check if it's a form or just part of the name
    if (pokemonName.includes('-')) {
      try {
        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        const species = speciesResponse.data
        // Format the base species name properly (handles Mr. Mime, Ho-Oh, etc.)
        const baseName = formatBaseName(species.name)

        // Only apply form formatting if this Pokemon has alternate forms AND this is not the base form
        // If the pokemon name matches the species name, it's the base form
        if (species.varieties && species.varieties.length > 1 && pokemonName !== species.name) {
          displayName = formatFormName(pokemonName, baseName)
        } else {
          // Either no varieties, or this is the base form - use the formatted base name
          displayName = baseName
        }
      } catch (error) {
        // If species fetch fails, use formatBaseName for safety
        displayName = formatBaseName(pokemonName)
      }
    }

    return {
      id: pokemon.id,
      name: displayName,
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

// Helper function to format base Pokemon names that contain hyphens
function formatBaseName(name) {
  // Special case: Mr. Mime family -> "Mr. Mime", "Mr. Rime"
  if (name.startsWith('mr-')) {
    const parts = name.split('-')
    return 'Mr. ' + parts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  }

  // For other Pokemon with hyphens in their base name (Ho-Oh, Porygon-Z, Kommo-o, Jangmo-o, etc.)
  // Just capitalize each part and keep the hyphen
  return name.split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}

// Helper function to format form names properly
function formatFormName(formName, baseName) {
  // Handle Mega forms
  if (formName.includes('mega-x')) {
    return `Mega ${baseName} X`
  } else if (formName.includes('mega-y')) {
    return `Mega ${baseName} Y`
  } else if (formName.includes('-mega')) {
    return `Mega ${baseName}`
  } else if (formName.startsWith('mega-')) {
    const parts = formName.split('-')
    return parts.length >= 3 ? `Mega ${baseName} ${parts[2].toUpperCase()}` : `Mega ${baseName}`
  }

  // Handle regional forms
  if (formName.includes('-alola')) return `${baseName} (Alola)`
  if (formName.includes('-galar')) return `${baseName} (Galar)`
  if (formName.includes('-hisui')) return `${baseName} (Hisui)`
  if (formName.includes('-paldea')) return `${baseName} (Paldea)`

  // Handle special forms - use parentheses format: "Pokemon (Form)"
  // Use baseName instead of extracting from formName to handle Pokemon with hyphens in their base names
  // Convert baseName to match the format in formName (lowercase, spaces->hyphens)
  const baseNameNormalized = baseName.toLowerCase().replace(/[.\s]/g, '-')

  // Extract the form suffix by removing the base name portion
  if (formName.startsWith(baseNameNormalized + '-')) {
    const formSuffix = formName.slice(baseNameNormalized.length + 1)
    const formattedSuffix = formSuffix.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    return `${baseName} (${formattedSuffix})`
  }

  // Fallback: if the above logic doesn't work, use the old approach
  const parts = formName.split('-')
  if (parts.length >= 2) {
    const formSuffix = parts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    return `${baseName} (${formSuffix})`
  }

  return formName.charAt(0).toUpperCase() + formName.slice(1)
}

// Improved function to fetch ALL relevant forms for a Pokemon
async function fetchAllPokemonForms(id) {
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

        // Determine form type and ID offset
        let formType = 'special'
        let idOffset = 30000 // Default for special forms

        if (formData.name.includes('mega') || formData.name.includes('megax') || formData.name.includes('megay')) {
          formType = 'mega'
          idOffset = 10000
        } else if (formData.name.includes('-alola') || formData.name.includes('-galar') ||
                   formData.name.includes('-hisui') || formData.name.includes('-paldea')) {
          formType = 'regional'
          idOffset = 20000
        }

        const baseStats = convertToPokemonGOStats(formData.stats)
        const maxCP = calculateMaxCP(baseStats)

        // Create unique ID based on form type
        const formId = parseInt(formData.id) + idOffset

        // Get base Pokemon name for formatting (use formatBaseName to handle hyphens properly)
        const baseName = formatBaseName(species.name)
        const displayName = formatFormName(formData.name, baseName)

        forms.push({
          id: formId,
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
          formType: formType,
          basePokemonId: id
        })

        console.log(`  ✓ Found ${formType} form: ${displayName}`)
      } catch (error) {
        console.warn(`  ✗ Could not fetch form ${variety.pokemon.name}`)
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
  const allForms = [] // Combined array for all forms

  console.log(`Fetching data for ${totalPokemon} Pokemon...`)

  // Process in batches of 10 to avoid overwhelming the API
  const batchSize = 10

  for (let batchStart = 1; batchStart <= totalPokemon; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, totalPokemon)
    console.log(`\n📦 Fetching batch ${batchStart}-${batchEnd}/${totalPokemon}...`)

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
        if (result.forms && result.forms.length > 0) {
          allForms.push(...result.forms)
        }
      }
    } catch (error) {
      console.error(`Error in batch ${batchStart}-${batchEnd}:`, error)
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  // Combine regular Pokemon and all forms
  const allPokemon = [...pokemonData, ...allForms]

  // Sort by ID
  allPokemon.sort((a, b) => a.id - b.id)

  // Count forms by type
  const megaCount = allForms.filter(f => f.formType === 'mega').length
  const regionalCount = allForms.filter(f => f.formType === 'regional').length
  const specialCount = allForms.filter(f => f.formType === 'special').length

  // Write to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'pokemonFromAPI.ts')
  const fileContent = `// Auto-generated Pokemon data from PokeAPI
// Generated on: ${new Date().toISOString()}
// Includes: Base Pokemon, Mega forms, Regional forms, and Special forms
// Note: Using correct Pokemon GO stat conversion formula from Pokemon GO Hub

import { Pokemon } from '../types/pokemon'

export const POKEMON_DATABASE: Pokemon[] = ${JSON.stringify(allPokemon, null, 2)}

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
  console.log(`\n✅ Successfully generated Pokemon data:`)
  console.log(`   📊 ${pokemonData.length} base Pokemon`)
  console.log(`   ⭐ ${megaCount} Mega forms`)
  console.log(`   🌍 ${regionalCount} Regional forms`)
  console.log(`   ✨ ${specialCount} Special forms`)
  console.log(`   📦 ${allPokemon.length} total entries`)
  console.log(`📁 Data saved to: ${outputPath}`)
}

// Helper function to fetch a single Pokemon with all its forms
async function fetchPokemonWithForms(id) {
  try {
    const pokemon = await fetchPokemonData(id)

    // Fetch evolution chain if available
    try {
      const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
      if (speciesResponse.data.evolution_chain?.url) {
        pokemon.evolutionChain = await fetchEvolutionChain(speciesResponse.data.evolution_chain.url)
      }
    } catch (error) {
      // Silent fail for evolution chain
    }

    // Fetch ALL forms
    let forms = []
    try {
      forms = await fetchAllPokemonForms(id)
      if (forms.length > 0) {
        console.log(`  🎭 ${pokemon.name} has ${forms.length} form(s)`)
      }
    } catch (error) {
      // Silent fail for forms
    }

    // Small delay between individual Pokemon requests
    await new Promise(resolve => setTimeout(resolve, 10))

    return { pokemon, forms }

  } catch (error) {
    console.error(`Failed to fetch Pokemon ${id}:`, error)
    return { pokemon: null, forms: [] }
  }
}

// Export formatting functions for testing
export { formatBaseName, formatFormName }

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAllPokemonData().catch(console.error)
}
