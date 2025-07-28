import React from 'react'
import { Pokemon, IVs } from '../types/pokemon'
import './IVInputForm.css'

interface IVInputFormProps {
  ivs: IVs
  onIVChange: (ivs: IVs) => void
  pokemon: Pokemon
}

const IVInputForm: React.FC<IVInputFormProps> = ({ ivs, onIVChange, pokemon }) => {
  const handleIVChange = (stat: keyof IVs, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 0 && numValue <= 15) {
      const newIvs = { ...ivs, [stat]: numValue }
      onIVChange(newIvs)
    }
  }

  const getIVColor = (value: number): string => {
    if (value >= 13) return '#4CAF50' // Green for high IVs
    if (value >= 10) return '#FF9800' // Orange for medium IVs
    if (value >= 7) return '#FFC107'  // Yellow for low-medium IVs
    return '#F44336' // Red for low IVs
  }

  const totalIV = ivs.attack + ivs.defense + ivs.stamina
  const ivPercentage = Math.round((totalIV / 45) * 100)

  return (
    <div className="iv-input-form">
      <h3>Enter IVs</h3>
      
      <div className="iv-inputs">
        <div className="iv-input-group">
          <label htmlFor="attack-iv">Attack IV:</label>
          <input
            id="attack-iv"
            type="number"
            min="0"
            max="15"
            value={ivs.attack}
            onChange={(e) => handleIVChange('attack', e.target.value)}
            className="iv-input"
            style={{ borderColor: getIVColor(ivs.attack) }}
          />
          <div className="iv-bar">
            <div 
              className="iv-fill" 
              style={{ 
                width: `${(ivs.attack / 15) * 100}%`,
                backgroundColor: getIVColor(ivs.attack)
              }}
            />
          </div>
        </div>

        <div className="iv-input-group">
          <label htmlFor="defense-iv">Defense IV:</label>
          <input
            id="defense-iv"
            type="number"
            min="0"
            max="15"
            value={ivs.defense}
            onChange={(e) => handleIVChange('defense', e.target.value)}
            className="iv-input"
            style={{ borderColor: getIVColor(ivs.defense) }}
          />
          <div className="iv-bar">
            <div 
              className="iv-fill" 
              style={{ 
                width: `${(ivs.defense / 15) * 100}%`,
                backgroundColor: getIVColor(ivs.defense)
              }}
            />
          </div>
        </div>

        <div className="iv-input-group">
          <label htmlFor="stamina-iv">Stamina IV:</label>
          <input
            id="stamina-iv"
            type="number"
            min="0"
            max="15"
            value={ivs.stamina}
            onChange={(e) => handleIVChange('stamina', e.target.value)}
            className="iv-input"
            style={{ borderColor: getIVColor(ivs.stamina) }}
          />
          <div className="iv-bar">
            <div 
              className="iv-fill" 
              style={{ 
                width: `${(ivs.stamina / 15) * 100}%`,
                backgroundColor: getIVColor(ivs.stamina)
              }}
            />
          </div>
        </div>
      </div>

      <div className="iv-summary">
        <div className="total-iv">
          <span>Total IV:</span>
          <span className="total-iv-value">{totalIV}/45</span>
        </div>
        <div className="iv-percentage">
          <span>IV Percentage:</span>
          <span className="iv-percentage-value">{ivPercentage}%</span>
        </div>
        <div className="iv-rating">
          <span>Rating:</span>
          <span className="iv-rating-value">
            {ivPercentage >= 90 ? 'Perfect' :
             ivPercentage >= 80 ? 'Excellent' :
             ivPercentage >= 70 ? 'Good' :
             ivPercentage >= 60 ? 'Average' : 'Poor'}
          </span>
        </div>
      </div>

      <div className="quick-iv-buttons">
        <h4>Quick IV Presets</h4>
        <div className="preset-buttons">
          <button 
            onClick={() => onIVChange({ attack: 15, defense: 15, stamina: 15 })}
            className="preset-button perfect"
          >
            15/15/15 (Perfect)
          </button>
          <button 
            onClick={() => onIVChange({ attack: 0, defense: 15, stamina: 15 })}
            className="preset-button pvp"
          >
            0/15/15 (PvP)
          </button>
          <button 
            onClick={() => onIVChange({ attack: 15, defense: 0, stamina: 0 })}
            className="preset-button attack"
          >
            15/0/0 (Attack)
          </button>
        </div>
      </div>
    </div>
  )
}

export default IVInputForm 