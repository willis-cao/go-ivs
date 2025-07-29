import React, { useState, useEffect, useRef } from 'react'
import { Pokemon, IVs, PokemonIVResult, HistoryEntry } from '../types/pokemon'
import { 
  calculatePvPRanking, 
  calculateTotalIV, 
  calculateIVPercentage, 
  validateIVs,
  reverseCalculateLevel,
  calculateCP
} from '../utils/ivCalculator'
import { getAllPokemon, findPokemonByName, searchPokemon, findPokemonById } from '../data/pokemonFromAPI'
import PokemonRankingModule from './PokemonRankingModule'
import './IVCalculator.css'

const IVCalculator: React.FC = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [ivs, setIvs] = useState<IVs>({ attack: null, defense: null, stamina: null })
  const [currentCP, setCurrentCP] = useState<number | null>(null)
  const [results, setResults] = useState<PokemonIVResult | null>(null)
  const [evolutionResults, setEvolutionResults] = useState<PokemonIVResult[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  
  // Advanced Options state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [bestBuddyBoost, setBestBuddyBoost] = useState(true)
  const [useXLCandy, setUseXLCandy] = useState(true)
  const [showLittleCup, setShowLittleCup] = useState(true)
  
  // Refs for focus management
  const pokemonInputRef = useRef<HTMLInputElement>(null)
  const atkInputRef = useRef<HTMLInputElement>(null)
  const defInputRef = useRef<HTMLInputElement>(null)
  const hpInputRef = useRef<HTMLInputElement>(null)
  const cpInputRef = useRef<HTMLInputElement>(null)

  // Focus on Pokemon search on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      pokemonInputRef.current?.focus()
    }, 100)
    
    return () => clearTimeout(timer)
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
      const filtered = searchPokemon(searchTerm)
      // Show up to 100 results to balance usability and performance
      setFilteredPokemon(filtered.slice(0, 100))
    }
    setSuggestionIndex(0)
  }, [searchTerm])

  const generateRankingSummary = (pokemon: Pokemon, ivs: IVs, cp: number | null, bestBuddyBoost: boolean, useXLCandy: boolean, showLittleCup: boolean): string => {
    if (!validateIVs(ivs)) return ''
    
    // Calculate rankings for the main Pokemon
    const pvpRankings = calculatePvPRanking(pokemon, ivs, cp, bestBuddyBoost, useXLCandy, showLittleCup)
    
    // Get all rankings (main Pokemon + evolutions)
    const allRankings: { league: string, rank: number, pokemonName: string }[] = []
    
    // Add main Pokemon rankings
    pvpRankings.forEach(ranking => {
      if (ranking.rank >= 1 && ranking.rank <= 100) {
        allRankings.push({
          league: ranking.league,
          rank: ranking.rank,
          pokemonName: pokemon.name
        })
      }
    })
    
    // Add evolution rankings
    const evolutionChain = pokemon.evolutionChain
    if (evolutionChain) {
      const currentIndex = evolutionChain.indexOf(pokemon.id)
      if (currentIndex !== -1) {
        for (let i = currentIndex + 1; i < evolutionChain.length; i++) {
          const evolutionId = evolutionChain[i]
          const evolutionPokemon = findPokemonById(evolutionId)
          if (evolutionPokemon) {
            let evolutionCP = null
            if (cp !== null && cp !== undefined) {
              const currentLevel = reverseCalculateLevel(pokemon, ivs, cp)
              evolutionCP = calculateCP(evolutionPokemon, ivs, currentLevel)
            }
            
            const evolutionPvpRankings = calculatePvPRanking(evolutionPokemon, ivs, evolutionCP, bestBuddyBoost, useXLCandy, showLittleCup)
            evolutionPvpRankings.forEach(ranking => {
              if (ranking.rank >= 1 && ranking.rank <= 100) {
                allRankings.push({
                  league: ranking.league,
                  rank: ranking.rank,
                  pokemonName: evolutionPokemon.name
                })
              }
            })
          }
        }
      }
    }
    
    // Sort by evolution order (base Pokemon first, then evolutions), then by league order (GL->UL->ML->LC)
    const leagueOrder = ['GL', 'UL', 'ML', 'LC']
    const leagueAbbreviations: { [key: string]: string } = {
      'Great League': 'GL',
      'Ultra League': 'UL', 
      'Master League': 'ML',
      'Little Cup': 'LC'
    }
    
    const sortedRankings = allRankings.sort((a, b) => {
      // First sort by evolution order (base Pokemon first)
      const isBaseA = a.pokemonName === pokemon.name
      const isBaseB = b.pokemonName === pokemon.name
      
      if (isBaseA && !isBaseB) return -1
      if (!isBaseA && isBaseB) return 1
      
      // If both are same evolution level, sort by league order
      const leagueA = leagueAbbreviations[a.league]
      const leagueB = leagueAbbreviations[b.league]
      const leagueIndexA = leagueOrder.indexOf(leagueA)
      const leagueIndexB = leagueOrder.indexOf(leagueB)
      
      return leagueIndexA - leagueIndexB
    })
    
    // Build summary string with all rankings
    const summaryParts: string[] = []
    sortedRankings.forEach(ranking => {
      const leagueAbbr = leagueAbbreviations[ranking.league]
      const rankText = ranking.rank.toString()
      const pokemonSuffix = ranking.pokemonName !== pokemon.name ? ` (${ranking.pokemonName})` : ''
      const fullRanking = `${leagueAbbr} #${rankText}${pokemonSuffix}`
      
      if (ranking.rank <= 20) {
        summaryParts.push(`**${fullRanking}**`)
      } else {
        summaryParts.push(fullRanking)
      }
    })
    
    const finalSummary = summaryParts.join(', ')
    return finalSummary
  }

  const renderRankingSummary = (summary: string) => {
    if (!summary) return null
    
    // Split by commas and process each part
    const parts = summary.split(', ')
    return parts.map((part, index) => {
      // Check if this part contains bold formatting (**entire ranking**)
      const boldMatch = part.match(/^\*\*(.*)\*\*$/)
      if (boldMatch) {
        return (
          <span key={index}>
            <strong>{boldMatch[1]}</strong>
            {index < parts.length - 1 ? ', ' : ''}
          </span>
        )
      } else {
        return (
          <span key={index}>
            {part}
            {index < parts.length - 1 ? ', ' : ''}
          </span>
        )
      }
    })
  }

  const addToHistory = (pokemon: Pokemon, ivs: IVs, cp: number | null) => {
    const rankingSummary = generateRankingSummary(pokemon, ivs, cp, bestBuddyBoost, useXLCandy, showLittleCup)
    
    const newEntry: HistoryEntry = {
      id: `${pokemon.id}-${ivs.attack}-${ivs.defense}-${ivs.stamina}-${cp}`,
      pokemon,
      ivs: { ...ivs },
      cp,
      timestamp: Date.now(),
      rankingSummary
    }
    
    setHistory(prev => [newEntry, ...prev.filter(entry => entry.id !== newEntry.id)])
  }

  const handleHistoryClick = (entry: HistoryEntry) => {
    // Check if this is the same as current state
    const isSamePokemon = selectedPokemon?.id === entry.pokemon.id
    const isSameIvs = ivs.attack === entry.ivs.attack && 
                     ivs.defense === entry.ivs.defense && 
                     ivs.stamina === entry.ivs.stamina
    const isSameCP = currentCP === entry.cp
    
    if (isSamePokemon && isSameIvs && isSameCP) {
      // Same entry, just recalculate results
      if (validateIVs(entry.ivs)) {
        calculateResults(entry.pokemon, entry.ivs, entry.cp)
      }
    } else {
      // Different entry, update state and add to history
      setSelectedPokemon(entry.pokemon)
      setIvs(entry.ivs)
      setCurrentCP(entry.cp)
      setSearchTerm(entry.pokemon.name)
      setResults(null)
      setEvolutionResults([])
      
      if (validateIVs(entry.ivs)) {
        calculateResults(entry.pokemon, entry.ivs, entry.cp)
      }
    }
  }

  const handlePokemonSelect = (pokemon: Pokemon) => {
    // Add current state to history if it exists
    if (selectedPokemon && validateIVs(ivs)) {
      addToHistory(selectedPokemon, ivs, currentCP)
    }
    
    setSelectedPokemon(pokemon)
    setSearchTerm(pokemon.name)
    setFilteredPokemon([])
    setSuggestionIndex(0)
    setShowSuggestions(false)
    setResults(null)
    setEvolutionResults([])
    // Clear all input fields when a new Pokemon is selected
    setIvs({ attack: null, defense: null, stamina: null })
    setCurrentCP(null)
    // Focus on attack input after selection
    setTimeout(() => atkInputRef.current?.focus(), 100)
  }

  const handlePokemonInputFocus = () => {
    // Only clear the search query when focusing on the Pokemon input if there's already a selected Pokemon
    if (selectedPokemon) {
      setSearchTerm('')
      setFilteredPokemon([])
      setSuggestionIndex(0)
      setShowSuggestions(false)
    }
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

  const handleIVKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | null>, prevRef?: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      nextRef?.current?.focus()
    } else if (e.key === 'Tab' && e.shiftKey && prevRef) {
      e.preventDefault()
      prevRef.current?.focus()
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
      calculateResults(selectedPokemon, newIvs, currentCP)
    } else {
      setResults(null)
      setEvolutionResults([])
    }
  }

  const handleCPChange = (value: string) => {
    let newCP: number | null = null
    
    if (value === '' || value === null || value === undefined) {
      newCP = null
    } else {
      const numValue = parseInt(value)
      if (isNaN(numValue) || numValue < 0) {
        newCP = null
      } else {
        newCP = numValue
      }
    }
    
    setCurrentCP(newCP)
    
    // Recalculate results if we have a Pokemon and valid IVs
    if (selectedPokemon && validateIVs(ivs)) {
      calculateResults(selectedPokemon, ivs, newCP)
    }
  }

  const handleInputBlur = () => {
    // Add to history when user leaves any input field (if we have a Pokemon and valid IVs)
    if (selectedPokemon && validateIVs(ivs)) {
      addToHistory(selectedPokemon, ivs, currentCP)
    }
  }

  const handleAdvancedOptionChange = () => {
    // Recalculate results when advanced options change
    if (selectedPokemon && validateIVs(ivs)) {
      calculateResults(selectedPokemon, ivs, currentCP)
    }
  }

  const calculateResults = (pokemon: Pokemon, newIvs: IVs, cp?: number | null, newBestBuddyBoost?: boolean, newUseXLCandy?: boolean, newShowLittleCup?: boolean) => {
    // Use the passed CP value or fall back to currentCP state
    const cpToUse = cp !== undefined ? cp : currentCP
    
    // Use passed advanced options or fall back to state
    const buddyBoost = newBestBuddyBoost !== undefined ? newBestBuddyBoost : bestBuddyBoost
    const xlCandy = newUseXLCandy !== undefined ? newUseXLCandy : useXLCandy
    const littleCup = newShowLittleCup !== undefined ? newShowLittleCup : showLittleCup
    
    // Calculate results for selected Pokemon
    const pvpRankings = calculatePvPRanking(pokemon, newIvs, cpToUse, buddyBoost, xlCandy, littleCup)
    const totalIV = calculateTotalIV(newIvs)
    const ivPercentage = calculateIVPercentage(newIvs)
    
    setResults({
      pokemon,
      ivs: newIvs,
      pvpRankings,
      totalIV,
      ivPercentage
    })

    // Calculate results for evolution chain
    const evolutionChain = pokemon.evolutionChain
    const evolutionResultsArray: PokemonIVResult[] = []
    
    if (evolutionChain) {
      const currentIndex = evolutionChain.indexOf(pokemon.id)
      if (currentIndex !== -1) {
        // Only show Pokemon that come AFTER the current Pokemon in the evolution chain
        for (let i = currentIndex + 1; i < evolutionChain.length; i++) {
          const evolutionId = evolutionChain[i]
          const evolutionPokemon = findPokemonById(evolutionId)
          if (evolutionPokemon) {
            // If we have a current CP, reverse-calculate the level and then calculate the evolved Pokemon's CP at that level
            let evolutionCP = null
            if (cpToUse !== null && cpToUse !== undefined) {
              const currentLevel = reverseCalculateLevel(pokemon, newIvs, cpToUse)
              evolutionCP = calculateCP(evolutionPokemon, newIvs, currentLevel)
            }
            
            const evolutionPvpRankings = calculatePvPRanking(evolutionPokemon, newIvs, evolutionCP, buddyBoost, xlCandy, littleCup)
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
              onFocus={handlePokemonInputFocus}
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
                {searchPokemon(searchTerm).length > 100 && (
                  <div className="suggestion-more-results">
                    <span>Showing 100 of {searchPokemon(searchTerm).length} results. Type more to narrow down.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* IV Inputs */}
        {selectedPokemon && (
          <div className="iv-inputs">
            <div className="iv-input-group">
              <label htmlFor="atk-input">ATK</label>
              <input
                ref={atkInputRef}
                id="atk-input"
                type="number"
                min="0"
                max="15"
                value={ivs.attack === null ? '' : ivs.attack.toString()}
                onChange={(e) => handleIVChange('attack', e.target.value)}
                onKeyDown={(e) => handleIVKeyDown(e, defInputRef, pokemonInputRef)}
                onBlur={handleInputBlur}
                className="iv-input"
              />
            </div>
            <div className="iv-input-group">
              <label htmlFor="def-input">DEF</label>
              <input
                ref={defInputRef}
                id="def-input"
                type="number"
                min="0"
                max="15"
                value={ivs.defense === null ? '' : ivs.defense.toString()}
                onChange={(e) => handleIVChange('defense', e.target.value)}
                onKeyDown={(e) => handleIVKeyDown(e, hpInputRef, atkInputRef)}
                onBlur={handleInputBlur}
                className="iv-input"
              />
            </div>
            <div className="iv-input-group">
              <label htmlFor="hp-input">HP</label>
              <input
                ref={hpInputRef}
                id="hp-input"
                type="number"
                min="0"
                max="15"
                value={ivs.stamina === null ? '' : ivs.stamina.toString()}
                onChange={(e) => handleIVChange('stamina', e.target.value)}
                onKeyDown={(e) => handleIVKeyDown(e, cpInputRef, defInputRef)}
                onBlur={handleInputBlur}
                className="iv-input"
              />
            </div>
            <div className="iv-input-group cp-group">
              <label htmlFor="cp-input">
                CP
                <span className="optional-text">(optional)</span>
              </label>
              <input
                ref={cpInputRef}
                id="cp-input"
                type="number"
                min="0"
                value={currentCP === null ? '' : currentCP.toString()}
                onChange={(e) => handleCPChange(e.target.value)}
                onKeyDown={(e) => handleIVKeyDown(e, undefined, hpInputRef)}
                onBlur={handleInputBlur}
                className="iv-input cp-input"
              />
            </div>
          </div>
        )}

        {/* Advanced Options Panel */}
        <div className="advanced-options-section">
          <button
            className="advanced-options-toggle"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            Advanced Options {showAdvancedOptions ? '▼' : '▶'}
          </button>
          
          {showAdvancedOptions && (
            <div className="advanced-options-panel">
              <div className="advanced-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bestBuddyBoost}
                    onChange={(e) => {
                      const newBestBuddyBoost = e.target.checked
                      setBestBuddyBoost(newBestBuddyBoost)
                      // Recalculate immediately with new values
                      if (selectedPokemon && validateIVs(ivs)) {
                        const newMaxLevel = (useXLCandy ? 50 : 40) + (newBestBuddyBoost ? 1 : 0)
                        calculateResults(selectedPokemon, ivs, currentCP, newBestBuddyBoost, useXLCandy, showLittleCup)
                      }
                    }}
                  />
                  <span className="checkmark"></span>
                  Best Buddy Boost (Max Level +1)
                </label>
                <div className="option-description">
                  When checked, increase the max level by 1.
                </div>
              </div>
              
              <div className="advanced-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={useXLCandy}
                    onChange={(e) => {
                      const newUseXLCandy = e.target.checked
                      setUseXLCandy(newUseXLCandy)
                      // Recalculate immediately with new values
                      if (selectedPokemon && validateIVs(ivs)) {
                        const newMaxLevel = (newUseXLCandy ? 50 : 40) + (bestBuddyBoost ? 1 : 0)
                        calculateResults(selectedPokemon, ivs, currentCP, bestBuddyBoost, newUseXLCandy, showLittleCup)
                      }
                    }}
                  />
                  <span className="checkmark"></span>
                  Use XL Candy (Max Level 50)
                </label>
                <div className="option-description">
                  When unchecked, the maximum level taken into consideration is 40.
                </div>
              </div>
              
              <div className="advanced-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showLittleCup}
                    onChange={(e) => {
                      const newShowLittleCup = e.target.checked
                      setShowLittleCup(newShowLittleCup)
                      // Recalculate immediately with new values
                      if (selectedPokemon && validateIVs(ivs)) {
                        calculateResults(selectedPokemon, ivs, currentCP, bestBuddyBoost, useXLCandy, newShowLittleCup)
                      }
                    }}
                  />
                  <span className="checkmark"></span>
                  Show Little Cup Rankings
                </label>
                <div className="option-description">
                  When unchecked, Little Cup rankings will not be calculated or displayed.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="history-section">
          <h3>History</h3>
          {history.length > 0 ? (
            <div className="history-list">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="history-entry"
                  onClick={() => handleHistoryClick(entry)}
                >
                  <img src={entry.pokemon.sprites.front_default} alt={entry.pokemon.name} />
                  <div className="history-details">
                    <div className="history-name-ivs-cp">
                      <span className="history-name">{entry.pokemon.name}</span>
                      <span className="history-ivs">
                        {entry.ivs.attack ?? '-'}/{entry.ivs.defense ?? '-'}/{entry.ivs.stamina ?? '-'}
                      </span>
                      {entry.cp && <span className="history-cp">{entry.cp} CP</span>}
                    </div>
                    {entry.rankingSummary && (
                      <div className="history-ranking-summary">
                        {renderRankingSummary(entry.rankingSummary)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="history-empty">
              Your previous searches will be saved here.
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results ? (
        <div className="results-section">
          {/* Current Pokemon Module */}
          <PokemonRankingModule
            pokemon={results.pokemon}
            ivs={results.ivs}
            pvpRankings={results.pvpRankings}
            isEvolution={false}
            currentCP={currentCP}
            showLittleCup={showLittleCup}
          />

          {/* Evolution Modules */}
          {evolutionResults.map((evolutionResult) => (
            <PokemonRankingModule
              key={evolutionResult.pokemon.id}
              pokemon={evolutionResult.pokemon}
              ivs={evolutionResult.ivs}
              pvpRankings={evolutionResult.pvpRankings}
              isEvolution={true}
              currentCP={currentCP}
              showLittleCup={showLittleCup}
            />
          ))}
        </div>
      ) : (
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-icon">
              {/* Clean shield shape - simple inverted pentagon */}
              <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#764ba2', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <path d="M 20 25 L 60 15 L 100 25 Q 100 75 60 110 Q 20 75 20 25 Z" fill="url(#shieldGrad)" stroke="#ffffff" strokeWidth="3"/>
                <text x="60" y="70" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="32" fontWeight="800" textAnchor="middle" fill="#ffffff">IV</text>
              </svg>
            </div>
            <h1 className="welcome-title">GO IVs</h1>
            <p className="welcome-subtitle">Start typing the name of a Pokemon to begin...</p>
            <div className="welcome-links">
              <a 
                href="https://github.com/willis-cao/go-ivs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-link"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IVCalculator 