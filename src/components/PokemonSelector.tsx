import React from 'react'
import { Pokemon } from '../types/pokemon'
import './PokemonSelector.css'

interface PokemonSelectorProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filteredPokemon: Pokemon[]
  selectedPokemon: Pokemon | null
  onPokemonSelect: (pokemon: Pokemon) => void
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  searchTerm,
  onSearchChange,
  filteredPokemon,
  selectedPokemon,
  onPokemonSelect
}) => {
  const getTypeColor = (type: string): string => {
    const typeColors: { [key: string]: string } = {
      'Normal': '#A8A878',
      'Fire': '#F08030',
      'Water': '#6890F0',
      'Electric': '#F8D030',
      'Grass': '#78C850',
      'Ice': '#98D8D8',
      'Fighting': '#C03028',
      'Poison': '#A040A0',
      'Ground': '#E0C068',
      'Flying': '#A890F0',
      'Psychic': '#F85888',
      'Bug': '#A8B820',
      'Rock': '#B8A038',
      'Ghost': '#705898',
      'Dragon': '#7038F8',
      'Dark': '#705848',
      'Steel': '#B8B8D0',
      'Fairy': '#EE99AC'
    }
    return typeColors[type] || '#A8A878'
  }

  return (
    <div className="pokemon-selector">
      <h3>Select Pokémon</h3>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search Pokémon by name or type..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="pokemon-list">
        {filteredPokemon.map((pokemon) => (
          <div
            key={pokemon.id}
            className={`pokemon-item ${selectedPokemon?.id === pokemon.id ? 'selected' : ''}`}
            onClick={() => onPokemonSelect(pokemon)}
          >
            <div className="pokemon-sprite">
              <img 
                src={pokemon.sprites.front_default} 
                alt={pokemon.name}
                onError={(e) => {
                  e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
                }}
              />
            </div>
            <div className="pokemon-info">
              <div className="pokemon-header">
                <span className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</span>
                <span className="pokemon-name">{pokemon.name}</span>
              </div>
              <div className="pokemon-stats">
                <span className="stat">CP: {pokemon.maxCP}</span>
                <span className="stat">H: {pokemon.height}m</span>
                <span className="stat">W: {pokemon.weight}kg</span>
              </div>
            </div>
            <div className="pokemon-types">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPokemon && (
        <div className="selected-pokemon">
          <div className="selected-pokemon-header">
            <img 
              src={selectedPokemon.sprites.official_artwork} 
              alt={selectedPokemon.name}
              className="selected-pokemon-sprite"
              onError={(e) => {
                e.currentTarget.src = selectedPokemon.sprites.front_default
              }}
            />
            <div className="selected-pokemon-info">
              <h4>{selectedPokemon.name}</h4>
              <span className="pokemon-number">#{selectedPokemon.id.toString().padStart(3, '0')}</span>
            </div>
          </div>
          <div className="selected-pokemon-stats">
            <div className="stat">
              <span>Attack:</span>
              <span>{selectedPokemon.baseStats.attack}</span>
            </div>
            <div className="stat">
              <span>Defense:</span>
              <span>{selectedPokemon.baseStats.defense}</span>
            </div>
            <div className="stat">
              <span>Stamina:</span>
              <span>{selectedPokemon.baseStats.stamina}</span>
            </div>
            <div className="stat">
              <span>Max CP:</span>
              <span>{selectedPokemon.maxCP}</span>
            </div>
            <div className="stat">
              <span>Height:</span>
              <span>{selectedPokemon.height}m</span>
            </div>
            <div className="stat">
              <span>Weight:</span>
              <span>{selectedPokemon.weight}kg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PokemonSelector 