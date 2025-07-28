import React, { useState, useEffect, useRef } from 'react'
import { Pokemon, IVs, PokemonIVResult } from '../types/pokemon'
import { getAllPokemon, findPokemonByName, searchPokemon, findPokemonById } from '../data/pokemonFromAPI'
import { calculatePvPRanking, calculateTotalIV, calculateIVPercentage, validateIVs, findOptimalLevel } from '../utils/ivCalculator'
import PokemonRankingModule from './PokemonRankingModule'
import './IVCalculator.css'

const IVCalculator: React.FC = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [ivs, setIvs] = useState<IVs>({ attack: null, defense: null, stamina: null })
  const [results, setResults] = useState<PokemonIVResult | null>(null)
  const [evolutionResults, setEvolutionResults] = useState<PokemonIVResult[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  
  // Refs for focus management
  const pokemonInputRef = useRef<HTMLInputElement>(null)
  const attackInputRef = useRef<HTMLInputElement>(null)
  const defenseInputRef = useRef<HTMLInputElement>(null)
  const staminaInputRef = useRef<HTMLInputElement>(null)

  // Focus on Pokemon search on mount
  useEffect(() => {
    pokemonInputRef.current?.focus()
  }, [])

  // Handle clicks outside of Pokemon suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const pokemonInputWrapper = document.querySelector('.pokemon-input-wrapper')
      
      if (pokemonInputWrapper && !pokemonInputWrapper.contains(target)) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

  useEffect(() => {
    const pokemon = getAllPokemon()
    if (searchTerm.trim() === '') {
      setFilteredPokemon(pokemon.slice(0, 10))
    } else {
      const filtered = searchPokemon(searchTerm).slice(0, 10)
      setFilteredPokemon(filtered)
    }
    setSuggestionIndex(0)
  }, [searchTerm])

  const handlePokemonSelect = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)
    setSearchTerm(pokemon.name)
    setShowSuggestions(false)
    setResults(null)
    setEvolutionResults([])
    // Focus on attack input after selection
    setTimeout(() => attackInputRef.current?.focus(), 100)
  }

  const handlePokemonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (filteredPokemon.length > 0) {
        handlePokemonSelect(filteredPokemon[suggestionIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIndex(prev => Math.min(prev + 1, filteredPokemon.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIndex(prev => Math.max(prev - 1, 0))
    }
  }

  const handleIVKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      nextRef.current?.focus()
    }
  }

  const handleIVChange = (field: keyof IVs, value: string) => {
    // Handle empty string or invalid input
    if (value === '' || value === null || value === undefined) {
      const newIvs = { ...ivs, [field]: null }
      setIvs(newIvs)
      return
    }
    
    // Parse the value and ensure it's within valid range
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 15) {
      return // Don't update if invalid
    }
    
    const newIvs = { ...ivs, [field]: numValue }
    setIvs(newIvs)
    
    if (selectedPokemon && validateIVs(newIvs)) {
      // Calculate results for selected Pokemon
      const pvpRankings = calculatePvPRanking(selectedPokemon, newIvs)
      const totalIV = calculateTotalIV(newIvs)
      const ivPercentage = calculateIVPercentage(newIvs)
      
      setResults({
        pokemon: selectedPokemon,
        ivs: newIvs,
        pvpRankings,
        totalIV,
        ivPercentage
      })

      // Calculate results for evolution chain
      const evolutionChain = selectedPokemon.evolutionChain
      const evolutionResultsArray: PokemonIVResult[] = []
      
      if (evolutionChain) {
        const currentIndex = evolutionChain.indexOf(selectedPokemon.id)
        if (currentIndex !== -1) {
          // Only show Pokemon that come AFTER the current Pokemon in the evolution chain
          for (let i = currentIndex + 1; i < evolutionChain.length; i++) {
            const evolutionId = evolutionChain[i]
            const evolutionPokemon = findPokemonById(evolutionId)
            if (evolutionPokemon) {
              const evolutionPvpRankings = calculatePvPRanking(evolutionPokemon, newIvs)
              const evolutionTotalIV = calculateTotalIV(newIvs)
              const evolutionIvPercentage = calculateIVPercentage(newIvs)
              
              evolutionResultsArray.push({
                pokemon: evolutionPokemon,
                ivs: newIvs,
                pvpRankings: evolutionPvpRankings,
                totalIV: evolutionTotalIV,
                ivPercentage: evolutionIvPercentage
              })
            }
          }
        }
      }
      
      setEvolutionResults(evolutionResultsArray)
    } else {
      setResults(null)
      setEvolutionResults([])
    }
  }

  return (
    <div className="iv-calculator">
      <div className="input-section">
        {/* Pokemon Selection */}
        <div className="pokemon-input-container">
          <div className="pokemon-input-wrapper">
            <input
              ref={pokemonInputRef}
              id="pokemon-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowSuggestions(true)
              }}
              onKeyDown={handlePokemonKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search Pokemon..."
              className="pokemon-input"
            />
            {showSuggestions && filteredPokemon.length > 0 && (
              <div className="suggestions">
                {filteredPokemon.map((pokemon, index) => (
                  <div
                    key={pokemon.id}
                    className={`suggestion ${index === suggestionIndex ? 'selected' : ''}`}
                    onClick={() => handlePokemonSelect(pokemon)}
                  >
                    <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                    <span>{pokemon.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* IV Inputs */}
        {selectedPokemon && (
          <div className="iv-inputs">
            <div className="iv-input-group">
              <label htmlFor="attack-input">ATK</label>
              <input
                ref={attackInputRef}
                id="attack-input"
                type="number"
                min="0"
                max="15"
                value={ivs.attack === null ? '' : ivs.attack.toString()}
                onChange={(e) => handleIVChange('attack', e.target.value)}
                onKeyDown={(e) => handleIVKeyDown(e, defenseInputRef)}
                className="iv-input"
              />
            </div>
            
            <div className="iv-input-group">
              <label htmlFor="defense-input">DEF</label>
              <input
                ref={defenseInputRef}
                id="defense-input"
                type="number"
                min="0"
                max="15"
                value={ivs.defense === null ? '' : ivs.defense.toString()}
                onChange={(e) => handleIVChange('defense', e.target.value)}
                onKeyDown={(e) => handleIVKeyDown(e, staminaInputRef)}
                className="iv-input"
              />
            </div>
            
            <div className="iv-input-group">
              <label htmlFor="stamina-input">HP</label>
              <input
                ref={staminaInputRef}
                id="stamina-input"
                type="number"
                min="0"
                max="15"
                value={ivs.stamina === null ? '' : ivs.stamina.toString()}
                onChange={(e) => handleIVChange('stamina', e.target.value)}
                className="iv-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="results-section">
          {/* Current Pokemon Module */}
          <PokemonRankingModule
            pokemon={results.pokemon}
            ivs={results.ivs}
            pvpRankings={results.pvpRankings}
            isEvolution={false}
          />

          {/* Evolution Modules */}
          {evolutionResults.map((evolutionResult) => (
            <PokemonRankingModule
              key={evolutionResult.pokemon.id}
              pokemon={evolutionResult.pokemon}
              ivs={evolutionResult.ivs}
              pvpRankings={evolutionResult.pvpRankings}
              isEvolution={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default IVCalculator 