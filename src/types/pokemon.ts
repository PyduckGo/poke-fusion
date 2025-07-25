// 宝可梦类型定义
export interface Pokemon {
  id: number;
  name: string;
  english: string;
  type: string[];
  generation: number;
  height?: number;
  weight?: number;
  abilities?: string[];
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
}

// 融合结果类型
export interface FusionResult {
  id: string;
  name: string;
  pokemonA: Pokemon;
  pokemonB: Pokemon;
  fusedSprite: string;
  types: string[];
  abilities: string[];
  height: number;
  weight: number;
  generation: number;
}

// 用户照片融合结果
export interface UserFusionResult {
  id: string;
  name: string;
  userImage: string;
  pokemon: Pokemon;
  fusedSprite: string;
  types: string[];
  abilities: string[];
  generation: number;
}
