import React from 'react'
import { PokemonIVResult } from '../types/pokemon'
import './ResultsDisplay.css'

interface ResultsDisplayProps {
  results: PokemonIVResult
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const getRankColor = (rank: number): string => {
    if (rank <= 10) return '#4CAF50' // Green for top 10
    if (rank <= 50) return '#8BC34A' // Light green for top 50
    if (rank <= 100) return '#FFC107' // Yellow for top 100
    if (rank <= 500) return '#FF9800' // Orange for top 500
    return '#F44336' // Red for lower ranks
  }

  const getRankText = (rank: number): string => {
    if (rank === 1) return '1st'
    if (rank === 2) return '2nd'
    if (rank === 3) return '3rd'
    return `${rank}th`
  }

  const getIVRating = (percentage: number): string => {
    if (percentage >= 90) return 'Perfect'
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 70) return 'Good'
    if (percentage >= 60) return 'Average'
    return 'Poor'
  }

  return (
    <div className="results-display">
      <div className="results-header">
        <h3>IV Analysis Results</h3>
        <div className="pokemon-title">
          <h4>{results.pokemon.name}</h4>
          <span className="pokemon-number">#{results.pokemon.id.toString().padStart(3, '0')}</span>
        </div>
      </div>

      <div className="iv-breakdown">
        <h4>IV Breakdown</h4>
        <div className="iv-stats">
          <div className="iv-stat">
            <span className="stat-label">Attack:</span>
            <span className="stat-value">{results.ivs.attack}/15</span>
          </div>
          <div className="iv-stat">
            <span className="stat-label">Defense:</span>
            <span className="stat-value">{results.ivs.defense}/15</span>
          </div>
          <div className="iv-stat">
            <span className="stat-label">Stamina:</span>
            <span className="stat-value">{results.ivs.stamina}/15</span>
          </div>
          <div className="iv-stat total">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{results.totalIV}/45</span>
          </div>
        </div>
        
        <div className="iv-overview">
          <div className="iv-percentage-display">
            <span className="percentage-value">{results.ivPercentage}%</span>
            <span className="percentage-label">IV Percentage</span>
          </div>
          <div className="iv-rating-display">
            <span className="rating-value">{getIVRating(results.ivPercentage)}</span>
            <span className="rating-label">Rating</span>
          </div>
        </div>
      </div>

      <div className="pvp-rankings">
        <h4>PvP Rankings</h4>
        <div className="league-rankings">
          {results.pvpRankings.map((ranking) => (
            <div key={ranking.league} className="league-ranking">
              <div className="league-header">
                <h5>{ranking.league}</h5>
                <span 
                  className="rank-badge"
                  style={{ backgroundColor: getRankColor(ranking.rank) }}
                >
                  {getRankText(ranking.rank)}
                </span>
              </div>
              
              <div className="ranking-details">
                <div className="ranking-stat">
                  <span>Rank:</span>
                  <span className="rank-number">#{ranking.rank}</span>
                </div>
                <div className="ranking-stat">
                  <span>Max CP:</span>
                  <span>{ranking.maxCP}</span>
                </div>
                <div className="ranking-stat">
                  <span>Level:</span>
                  <span>{ranking.level}</span>
                </div>
                <div className="ranking-stat">
                  <span>IV %:</span>
                  <span>{ranking.percentage}%</span>
                </div>
              </div>

              <div className="ranking-bar">
                <div 
                  className="ranking-fill"
                  style={{ 
                    width: `${Math.max(0, 100 - ranking.rank)}%`,
                    backgroundColor: getRankColor(ranking.rank)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recommendations">
        <h4>Recommendations</h4>
        <div className="recommendation-content">
          {results.ivPercentage >= 90 && (
            <div className="recommendation good">
              <span className="recommendation-icon">⭐</span>
              <span>Excellent IVs! This Pokemon is great for all leagues.</span>
            </div>
          )}
          
          {results.pvpRankings.some(r => r.rank <= 50) && (
            <div className="recommendation good">
              <span className="recommendation-icon">🏆</span>
              <span>Top-tier PvP performance in some leagues!</span>
            </div>
          )}
          
          {results.ivs.attack === 0 && results.ivs.defense >= 13 && results.ivs.stamina >= 13 && (
            <div className="recommendation pvp">
              <span className="recommendation-icon">⚔️</span>
              <span>Perfect PvP IVs! Low attack for better bulk.</span>
            </div>
          )}
          
          {results.ivPercentage < 70 && (
            <div className="recommendation warning">
              <span className="recommendation-icon">⚠️</span>
              <span>Consider finding a Pokemon with better IVs.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsDisplay 