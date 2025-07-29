# Pokemon GO IV Calculator

A React + TypeScript web application for calculating Pokemon GO IVs and PvP rankings across all leagues.

## Key Features

- **Instant PvP Rankings**: Get rankings for Great League (≤1500 CP), Ultra League (≤2500 CP), Master League (no limit), and Little Cup (≤500 CP)
- **Evolution Support**: See rankings for evolved forms when searching unevolved Pokemon
- **CP Integration**: Optional CP field to check if your Pokemon exceeds league limits
- **Accurate Calculations**: Uses precise Pokemon GO formulas for CP and stat product calculations
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Search Pokemon**: Type a Pokemon name and press Enter to select
2. **Enter IVs**: Input Attack, Defense, and HP IVs (0-15)
3. **Optional CP**: Add current CP to check league eligibility
4. **View Results**: See rankings, percentages, and optimal CPs for each league

## Development

```bash
npm install
npm run dev
```

## Data Source

This application uses [PokeAPI](https://pokeapi.co/) to fetch Pokemon data including base stats, sprites, and evolution chains.

## Disclaimer

This is an unofficial Pokemon GO tool created for educational and entertainment purposes. 

- **Not affiliated with**: Pokemon Company, Niantic, Nintendo, or any official Pokemon GO entities
- **Data accuracy**: While we strive for accuracy, rankings may vary from other sources
- **Game updates**: Pokemon GO mechanics and formulas may change, affecting calculation accuracy
- **Use at your own risk**: This tool is provided "as is" without warranties

## License

MIT License - feel free to use, modify, and distribute.
