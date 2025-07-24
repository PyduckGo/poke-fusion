// 宝可梦数据 - 基于pokemon.json的完整TypeScript版本
import pokemonJson from './pokemon.json';

export interface Pokemon {
  id: number;
  name: string;
  english: string;
  type: string[];
  generation: number;
  height?: number;
  weight?: number;
}

// 使用完整的JSON数据
export const pokemonData: Pokemon[] = pokemonJson.map(p => ({
  ...p,
  height: Math.floor(Math.random() * 200) + 50,
  weight: Math.floor(Math.random() * 1000) + 50
}));

// 搜索函数
export const searchPokemon = (query: string, typeFilter?: string, idRange?: { min: number; max: number }) => {
  let results = pokemonData;

  // 文本搜索
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(pokemon => 
      pokemon.name.toLowerCase().includes(lowerQuery) || 
      pokemon.english.toLowerCase().includes(lowerQuery) || 
      pokemon.id.toString() === query
    );
  }

  // 类型筛选
  if (typeFilter) {
    results = results.filter(pokemon => pokemon.type.includes(typeFilter));
  }

  // ID范围筛选
  if (idRange) {
    results = results.filter(pokemon => 
      pokemon.id >= idRange.min && pokemon.id <= idRange.max
    );
  }

  return results;
};

// 根据ID获取宝可梦
export const getPokemonById = (id: number): Pokemon | undefined => {
  return pokemonData.find(pokemon => pokemon.id === id);
};

// 根据名称获取宝可梦
export const getPokemonByName = (name: string): Pokemon | undefined => {
  const lowerName = name.toLowerCase();
  return pokemonData.find(pokemon => 
    pokemon.name.toLowerCase() === lowerName || 
    pokemon.english.toLowerCase() === lowerName
  );
};

// 获取所有类型
export const getAllTypes = (): string[] => {
  const types = new Set<string>();
  pokemonData.forEach(pokemon => {
    pokemon.type.forEach(type => types.add(type));
  });
  return Array.from(types).sort();
};

// 获取ID范围
export const getIdRange = (): { min: number; max: number } => {
  const ids = pokemonData.map(p => p.id);
  return {
    min: Math.min(...ids),
    max: Math.max(...ids)
  };
};

// 获取特定世代的宝可梦
export const getPokemonByGeneration = (generation: number): Pokemon[] => {
  return pokemonData.filter(pokemon => pokemon.generation === generation);
};

// 获取随机宝可梦
export const getRandomPokemon = (): Pokemon => {
  const randomIndex = Math.floor(Math.random() * pokemonData.length);
  return pokemonData[randomIndex];
};

// 获取两只不同世代的随机宝可梦
export const getRandomPokemonPair = (): [Pokemon, Pokemon] => {
  const generations = [1, 2, 3];
  const gen1 = generations[Math.floor(Math.random() * generations.length)];
  let gen2 = generations[Math.floor(Math.random() * generations.length)];
  
  // 确保不同世代
  while (gen2 === gen1) {
    gen2 = generations[Math.floor(Math.random() * generations.length)];
  }
  
  const gen1Pokemon = getPokemonByGeneration(gen1);
  const gen2Pokemon = getPokemonByGeneration(gen2);
  
  const pokemon1 = gen1Pokemon[Math.floor(Math.random() * gen1Pokemon.length)];
  const pokemon2 = gen2Pokemon[Math.floor(Math.random() * gen2Pokemon.length)];
  
  return [pokemon1, pokemon2];
};
