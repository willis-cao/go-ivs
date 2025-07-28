import { Pokemon } from '../types/pokemon'

export const POKEMON_DATABASE: Pokemon[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    types: ['Grass', 'Poison'],
    baseStats: { attack: 118, defense: 111, stamina: 128 },
    maxCP: 1115,
    evolutionChain: [2, 3]
  },
  {
    id: 2,
    name: 'Ivysaur',
    types: ['Grass', 'Poison'],
    baseStats: { attack: 151, defense: 143, stamina: 155 },
    maxCP: 1632,
    evolutionChain: [3]
  },
  {
    id: 3,
    name: 'Venusaur',
    types: ['Grass', 'Poison'],
    baseStats: { attack: 198, defense: 189, stamina: 190 },
    maxCP: 2568,
    evolutionChain: []
  },
  {
    id: 4,
    name: 'Charmander',
    types: ['Fire'],
    baseStats: { attack: 116, defense: 93, stamina: 118 },
    maxCP: 980,
    evolutionChain: [5, 6]
  },
  {
    id: 5,
    name: 'Charmeleon',
    types: ['Fire'],
    baseStats: { attack: 158, defense: 126, stamina: 151 },
    maxCP: 1653,
    evolutionChain: [6]
  },
  {
    id: 6,
    name: 'Charizard',
    types: ['Fire', 'Flying'],
    baseStats: { attack: 223, defense: 173, stamina: 186 },
    maxCP: 2889,
    evolutionChain: []
  },
  {
    id: 7,
    name: 'Squirtle',
    types: ['Water'],
    baseStats: { attack: 94, defense: 121, stamina: 127 },
    maxCP: 946,
    evolutionChain: [8, 9]
  },
  {
    id: 8,
    name: 'Wartortle',
    types: ['Water'],
    baseStats: { attack: 126, defense: 155, stamina: 153 },
    maxCP: 1484,
    evolutionChain: [9]
  },
  {
    id: 9,
    name: 'Blastoise',
    types: ['Water'],
    baseStats: { attack: 171, defense: 207, stamina: 188 },
    maxCP: 2466,
    evolutionChain: []
  },
  {
    id: 25,
    name: 'Pikachu',
    types: ['Electric'],
    baseStats: { attack: 112, defense: 96, stamina: 111 },
    maxCP: 938,
    evolutionChain: [26]
  },
  {
    id: 26,
    name: 'Raichu',
    types: ['Electric'],
    baseStats: { attack: 193, defense: 151, stamina: 155 },
    maxCP: 2182,
    evolutionChain: []
  },
  {
    id: 133,
    name: 'Eevee',
    types: ['Normal'],
    baseStats: { attack: 104, defense: 114, stamina: 146 },
    maxCP: 1077,
    evolutionChain: [134, 135, 136, 196, 197, 470, 471, 700]
  },
  {
    id: 134,
    name: 'Vaporeon',
    types: ['Water'],
    baseStats: { attack: 205, defense: 161, stamina: 277 },
    maxCP: 3114,
    evolutionChain: []
  },
  {
    id: 135,
    name: 'Jolteon',
    types: ['Electric'],
    baseStats: { attack: 232, defense: 182, stamina: 163 },
    maxCP: 2730,
    evolutionChain: []
  },
  {
    id: 136,
    name: 'Flareon',
    types: ['Fire'],
    baseStats: { attack: 246, defense: 179, stamina: 163 },
    maxCP: 2643,
    evolutionChain: []
  },
  {
    id: 149,
    name: 'Dragonite',
    types: ['Dragon', 'Flying'],
    baseStats: { attack: 263, defense: 198, stamina: 209 },
    maxCP: 3792,
    evolutionChain: []
  },
  {
    id: 150,
    name: 'Mewtwo',
    types: ['Psychic'],
    baseStats: { attack: 300, defense: 182, stamina: 214 },
    maxCP: 4178,
    evolutionChain: []
  },
  {
    id: 151,
    name: 'Mew',
    types: ['Psychic'],
    baseStats: { attack: 210, defense: 210, stamina: 225 },
    maxCP: 3265,
    evolutionChain: []
  }
]

export const findPokemonById = (id: number): Pokemon | undefined => {
  return POKEMON_DATABASE.find(pokemon => pokemon.id === id)
}

export const findPokemonByName = (name: string): Pokemon | undefined => {
  return POKEMON_DATABASE.find(pokemon => 
    pokemon.name.toLowerCase().includes(name.toLowerCase())
  )
}

export const getAllPokemon = (): Pokemon[] => {
  return POKEMON_DATABASE
} 