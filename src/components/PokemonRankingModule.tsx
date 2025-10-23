import React from 'react'
import { Pokemon, PvPRanking, IVs } from '../types/pokemon'

interface PokemonRankingModuleProps {
  pokemon: Pokemon
  ivs: IVs
  pvpRankings: PvPRanking[]
  isEvolution?: boolean
  currentCP?: number | null
  showLittleCup?: boolean
}

const PokemonRankingModule: React.FC<PokemonRankingModuleProps> = ({
  pokemon,
  ivs,
  pvpRankings,
  isEvolution = false,
  currentCP = null,
  showLittleCup = true
}) => {
  const getLeagueRanking = (leagueName: string) => {
    return pvpRankings.find(r => r.league === leagueName)
  }

  const renderRankingCards = () => {
    const hasLittleCup = pvpRankings.some(r => r.league === 'Little Cup')
    const gridClass = showLittleCup && hasLittleCup ? 'rankings-grid' : 'rankings-grid three-leagues'
    
    return (
      <div className={gridClass}>
        {pvpRankings.map((ranking) => (
          <div
            key={ranking.league}
            className={`ranking-card ${ranking.rank === -1 ? 'cp-exceeds-limit' : ''} ${
              ranking.rank >= 1 && ranking.rank <= 20 ? 'ranking-top-20' : ''
            } ${
              ranking.rank >= 21 && ranking.rank <= 100 ? 'ranking-top-100' : ''
            }`}
            data-league={ranking.league}
          >
            <h3>{ranking.league}</h3>
            <div className="league-limit">
              {ranking.league === 'Great League' ? '≤ 1500 CP' : 
                ranking.league === 'Ultra League' ? '≤ 2500 CP' :
                ranking.league === 'Little Cup' ? '≤ 500 CP' : 'No CP Limit'}
            </div>
            <div className={`ranking-number ${ranking.rank === -1 ? 'cp-exceeds-limit' : ''}`}>
              {ranking.rank === -1 ? 'CP Exceeds Limit' : `#${ranking.rank || '-'}`}
            </div>
            {ranking.rank !== -1 && (
              <>
                <div className="percent-perfect">{(ranking.percentPerfect || 0).toFixed(2)}%</div>
                <div className="actual-cp">{ranking.maxCP || '-'} CP</div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (isEvolution) {
    return (
      <div className="evolution-section">
        <div className="evolution-label">
          <div className="name-sprite-container">
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <h3>{pokemon.name}</h3>
          </div>
        </div>
        {renderRankingCards()}
      </div>
    )
  }

  return (
    <div className="pokemon-ranking-module">
      <div className="pokemon-display">
        <div className="name-sprite-container">
          <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          <h2>{pokemon.name}</h2>
        </div>
      </div>
      {renderRankingCards()}
    </div>
  )
}

export default PokemonRankingModule 