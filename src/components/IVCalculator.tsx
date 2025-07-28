import React, { useState, useEffect, useRef } from 'react'
import { Pokemon, IVs, PokemonIVResult } from '../types/pokemon'
import { getAllPokemon, findPokemonByName, searchPokemon } from '../data/pokemonFromAPI'
import { calculatePvPRanking, calculateTotalIV, calculateIVPercentage, validateIVs, findOptimalLevel } from '../utils/ivCalculator'
import './IVCalculator.css'

const IVCalculator: React.FC = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [ivs, setIvs] = useState<IVs>({ attack: 0, defense: 0, stamina: 0 })
  const [results, setResults] = useState<PokemonIVResult | null>(null)
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

  const handleIVChange = (field: keyof IVs, value: number) => {
    const newIvs = { ...ivs, [field]: value }
    setIvs(newIvs)
    
    if (selectedPokemon && validateIVs(newIvs)) {
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
    } else {
      setResults(null)
    }
  }

  const getLeagueRanking = (leagueName: string) => {
    if (!results) return null
    return results.pvpRankings.find(r => r.league === leagueName)
  }

  const getPokemonInfo = () => {
    if (!selectedPokemon || !results) return null
    
    const greatLeagueRanking = getLeagueRanking('Great League')
    const optimal = findOptimalLevel(selectedPokemon, ivs, 'Great League')
    
    return {
      cp: optimal.cp,
      level: optimal.level
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
                value={ivs.attack === 0 ? '0' : ivs.attack || ''}
                onChange={(e) => handleIVChange('attack', parseInt(e.target.value) || 0)}
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
                value={ivs.defense === 0 ? '0' : ivs.defense || ''}
                onChange={(e) => handleIVChange('defense', parseInt(e.target.value) || 0)}
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
                value={ivs.stamina === 0 ? '0' : ivs.stamina || ''}
                onChange={(e) => handleIVChange('stamina', parseInt(e.target.value) || 0)}
                className="iv-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="results-section">
          <div className="pokemon-display">
            <img src={selectedPokemon?.sprites.official_artwork} alt={selectedPokemon?.name} />
            <h2>{selectedPokemon?.name}</h2>
            <div className="iv-display">
              {ivs.attack}/{ivs.defense}/{ivs.stamina}
            </div>
          </div>

          <div className="rankings-grid">
            <div className="ranking-card great-league">
              <h3>Great League</h3>
              <div className="league-limit">≤ 1500 CP</div>
              <div className="ranking-number">#{getLeagueRanking('Great League')?.rank || '-'}</div>
              <div className="actual-cp">{getLeagueRanking('Great League')?.maxCP || '-'} CP</div>
            </div>
            
            <div className="ranking-card ultra-league">
              <h3>Ultra League</h3>
              <div className="league-limit">≤ 2500 CP</div>
              <div className="ranking-number">#{getLeagueRanking('Ultra League')?.rank || '-'}</div>
              <div className="actual-cp">{getLeagueRanking('Ultra League')?.maxCP || '-'} CP</div>
            </div>
            
            <div className="ranking-card master-league">
              <h3>Master League</h3>
              <div className="league-limit">No CP Limit</div>
              <div className="ranking-number">#{getLeagueRanking('Master League')?.rank || '-'}</div>
              <div className="actual-cp">{getLeagueRanking('Master League')?.maxCP || '-'} CP</div>
            </div>
            
            <div className="ranking-card little-cup">
              <h3>Little Cup</h3>
              <div className="league-limit">≤ 500 CP</div>
              <div className="ranking-number">#{getLeagueRanking('Little Cup')?.rank || '-'}</div>
              <div className="actual-cp">{getLeagueRanking('Little Cup')?.maxCP || '-'} CP</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IVCalculator 