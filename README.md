# Pokemon GO IV Calculator

A modern web application built with React and TypeScript that helps Pokemon GO players efficiently calculate and analyze their Pokemon's IVs (Individual Values) and receive immediate information about PvP rankings across all leagues.

## Features

### 🎯 Core Functionality
- **Pokemon Selection**: Search and select from a curated database of Pokemon
- **IV Input**: Easy-to-use form for entering Attack, Defense, and Stamina IVs (0-15)
- **Real-time Calculation**: Instant IV percentage and total IV calculation
- **PvP Rankings**: View rankings across Great League, Ultra League, and Master League
- **Visual Feedback**: Color-coded IV bars and ranking indicators

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with beautiful gradients
- **Type Badges**: Color-coded Pokemon type indicators
- **Quick Presets**: One-click IV presets for common scenarios (Perfect, PvP, Attack)
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Instant Results**: Real-time updates as you modify IVs

### 📊 Analysis Features
- **IV Breakdown**: Detailed view of individual IV stats
- **Percentage Rating**: Automatic IV quality assessment
- **League Analysis**: Optimal CP and level calculations for each league
- **Smart Recommendations**: Contextual advice based on IV combinations
- **Ranking Visualization**: Visual progress bars for PvP rankings

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with modern design patterns
- **State Management**: React Hooks
- **Type Safety**: Full TypeScript implementation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd go-ivs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

### 1. Select a Pokemon
- Use the search bar to find your Pokemon
- Click on a Pokemon from the list to select it
- View base stats and type information

### 2. Enter IVs
- Input Attack, Defense, and Stamina IVs (0-15)
- Use quick preset buttons for common IV combinations
- Watch real-time IV percentage updates

### 3. View Results
- See detailed IV breakdown and percentage
- Check PvP rankings for all leagues
- Read personalized recommendations
- View optimal CP and level for each league

## Pokemon Database

The application includes a curated database of popular Pokemon with:
- Base stats (Attack, Defense, Stamina)
- Type information
- Evolution chains
- Max CP values

Currently includes Pokemon from the original 151, with focus on:
- Starter Pokemon and evolutions
- Popular PvP Pokemon
- Legendary Pokemon
- Eevee and its evolutions

## IV Calculation Logic

### CP Formula
```
CP = (Attack + IV_Attack) × √(Defense + IV_Defense) × √(Stamina + IV_Stamina) × CP_Multiplier² / 10
```

### League Limits
- **Great League**: 1500 CP
- **Ultra League**: 2500 CP
- **Master League**: No CP limit

### IV Percentage
```
IV_Percentage = (Total_IV / 45) × 100
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Add more Pokemon to the database
- [ ] Implement actual PvP ranking algorithms
- [ ] Add Pokemon sprites and images
- [ ] Include move sets and type effectiveness
- [ ] Add IV appraisal simulation
- [ ] Export/share functionality
- [ ] Dark mode theme
- [ ] Offline support with PWA

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Pokemon GO community for IV calculation formulas
- PvPoke for inspiration on PvP rankings
- React and TypeScript communities for excellent tooling
