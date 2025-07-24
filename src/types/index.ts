// 宝可梦数据类型定义
export interface Pokemon {
  id: number;
  name: string;
  names?: Array<{
    language: { name: string };
    name: string;
  }>;
  sprites: {
    front_default: string;
    front_shiny?: string;
  };
  types: Array<{
    type: {
      name: string;
      url: string;
    };
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
  }>;
  cries?: {
    latest: string;
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
  cryUrl: string;
  generation: number;
}

// 配置选项
export interface ConfigOptions {
  fusionAlgorithm: 'xor' | 'blend' | 'chromatic';
  pixelSize: 8 | 16 | 32;
  animationEnabled: boolean;
  soundTheme: 'gba' | '8bit' | 'mute';
}

// 图鉴条目
export interface PokedexEntry {
  id: string;
  fusionResult: FusionResult;
  createdAt: Date;
  viewedCount: number;
}
