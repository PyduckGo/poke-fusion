import pokemonData from './pokemon.json';
import type { Pokemon } from '../types/pokemon';

// 获取所有宝可梦
export function getAllPokemon(): Pokemon[] {
  return pokemonData as Pokemon[];
}

// 获取随机宝可梦
export function getRandomPokemon(): Pokemon {
  const pokemon = pokemonData as Pokemon[];
  const randomIndex = Math.floor(Math.random() * pokemon.length);
  return pokemon[randomIndex];
}

// 获取随机宝可梦对
export function getRandomPokemonPair(): [Pokemon, Pokemon] {
  const pokemon = pokemonData as Pokemon[];
  const indices = new Set<number>();
  
  while (indices.size < 2) {
    indices.add(Math.floor(Math.random() * pokemon.length));
  }
  
  const [index1, index2] = Array.from(indices);
  return [pokemon[index1], pokemon[index2]];
}

// 按世代获取宝可梦
export function getPokemonByGeneration(generation: number): Pokemon[] {
  return (pokemonData as Pokemon[]).filter(p => p.generation === generation);
}

// 按类型搜索宝可梦
export function searchPokemonByType(type: string): Pokemon[] {
  return (pokemonData as Pokemon[]).filter(p => p.type.includes(type));
}

// 按ID获取宝可梦
export function getPokemonById(id: number): Pokemon | undefined {
  return (pokemonData as Pokemon[]).find(p => p.id === id);
}

// 按名称搜索宝可梦
export function searchPokemonByName(name: string): Pokemon[] {
  const query = name.toLowerCase();
  return (pokemonData as Pokemon[]).filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.english.toLowerCase().includes(query)
  );
}

// 获取前三个世代的宝可梦
export function getFirstThreeGenerations(): Pokemon[] {
  return (pokemonData as Pokemon[]).filter(p => p.generation <= 3);
}

// 获取所有类型
export function getAllTypes(): string[] {
  const typesSet = new Set<string>();
  (pokemonData as Pokemon[]).forEach(pokemon => {
    pokemon.type.forEach(type => typesSet.add(type));
  });
  return Array.from(typesSet).sort();
}

// 导出宝可梦数据数组
export const pokemonDataArray = pokemonData as Pokemon[];
