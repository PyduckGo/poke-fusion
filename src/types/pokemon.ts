// 宝可梦基础类型定义
export interface Pokemon {
  id: number;
  name: string;
  english: string;
  type: string[];
  generation: number;
}

// 融合宝可梦类型
export interface FusedPokemon {
  id: string;
  name: string;
  original1: Pokemon;
  original2: Pokemon;
  fusedImage: string;
  types: string[];
  abilities: string[];
  stats: PokemonStats;
  cry: string;
}

// 宝可梦属性
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

// 融合配置
export interface FusionConfig {
  useRandom: boolean;
  pokemon1?: Pokemon;
  pokemon2?: Pokemon;
  userImage?: string;
  customName?: string;
}

// 像素化配置
export interface PixelConfig {
  size: number;
  palette: string[];
  dithering: boolean;
}
