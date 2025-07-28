import React from 'react'
import { Pokemon, PvPRanking, IVs } from '../types/pokemon'

interface PokemonRankingModuleProps {
  pokemon: Pokemon
  ivs: IVs
  pvpRankings: PvPRanking[]
  isEvolution?: boolean
}

const PokemonRankingModule: React.FC<PokemonRankingModuleProps> = ({
  pokemon,
  ivs,
  pvpRankings,
  isEvolution = false
}) => {
  const getLeagueRanking = (leagueName: string) => {
    return pvpRankings.find(r => r.league === leagueName)
  }

  const renderRankingCards = () => {
    return (
      <div className="rankings-grid">
        <div className="ranking-card" data-league="Great League">
          <h3>Great League</h3>
          <div className="league-limit">≤ 1500 CP</div>
          <div className="ranking-number">#{getLeagueRanking('Great League')?.rank || '-'}</div>
          <div className="percent-perfect">{(getLeagueRanking('Great League')?.percentPerfect || 0).toFixed(2)}%</div>
          <div className="actual-cp">{getLeagueRanking('Great League')?.maxCP || '-'} CP</div>
        </div>
        
        <div className="ranking-card" data-league="Ultra League">
          <h3>Ultra League</h3>
          <div className="league-limit">≤ 2500 CP</div>
          <div className="ranking-number">#{getLeagueRanking('Ultra League')?.rank || '-'}</div>
          <div className="percent-perfect">{(getLeagueRanking('Ultra League')?.percentPerfect || 0).toFixed(2)}%</div>
          <div className="actual-cp">{getLeagueRanking('Ultra League')?.maxCP || '-'} CP</div>
        </div>
        
        <div className="ranking-card" data-league="Master League">
          <h3>Master League</h3>
          <div className="league-limit">No CP Limit</div>
          <div className="ranking-number">#{getLeagueRanking('Master League')?.rank || '-'}</div>
          <div className="percent-perfect">{(getLeagueRanking('Master League')?.percentPerfect || 0).toFixed(2)}%</div>
          <div className="actual-cp">{getLeagueRanking('Master League')?.maxCP || '-'} CP</div>
        </div>
        
        <div className="ranking-card" data-league="Little Cup">
          <h3>Little Cup</h3>
          <div className="league-limit">≤ 500 CP</div>
          <div className="ranking-number">#{getLeagueRanking('Little Cup')?.rank || '-'}</div>
          <div className="percent-perfect">{(getLeagueRanking('Little Cup')?.percentPerfect || 0).toFixed(2)}%</div>
          <div className="actual-cp">{getLeagueRanking('Little Cup')?.maxCP || '-'} CP</div>
        </div>
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
          <div className="iv-display">
            {(ivs.attack ?? '-')}/{(ivs.defense ?? '-')}/{(ivs.stamina ?? '-')}
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
        <div className="iv-display">
          {(ivs.attack ?? '-')}/{(ivs.defense ?? '-')}/{(ivs.stamina ?? '-')}
        </div>
      </div>
      {renderRankingCards()}
    </div>
  )
}

export default PokemonRankingModule 