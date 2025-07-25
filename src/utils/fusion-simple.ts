// 简化的宝可梦融合算法
import { Pokemon } from '../types/pokemon';

// 简化的融合配置
export interface SimpleFusionConfig {
  shapeSource: 'first' | 'second' | 'blend';
  colorSource: 'first' | 'second' | 'blend';
  pixelSize: number;
}

// 简化的融合结果
export interface SimpleFusionResult {
  id: string;
  name: string;
  pokemonA: Pokemon;
  pokemonB: Pokemon;
  fusedSprite: string;
  types: string[];
  abilities: string[];
  height: number;
  weight: number;
}

// 简化的属性
interface SimpleStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

// 生成融合ID
export function generateSimpleFusionId(pokemon1: Pokemon, pokemon2: Pokemon): string {
  return `F${Math.min(pokemon1.id, pokemon2.id).toString().padStart(3, '0')}${Math.max(pokemon1.id, pokemon2.id).toString().padStart(3, '0')}`;
}

// 生成中文融合名称
export function generateSimpleChineseFusionName(name1: string, name2: string): string {
  const len1 = Math.ceil(name1.length / 2);
  const len2 = Math.floor(name2.length / 2);
  return name1.substring(0, len1) + name2.substring(name2.length - len2);
}

// 计算融合属性
export function calculateSimpleFusedTypes(type1: string[], type2: string[]): string[] {
  const combined = [...type1, ...type2];
  const unique = [...new Set(combined)];
  
  if (unique.length > 2) {
    const priority = ['龙', '超能力', '幽灵', '恶', '钢', '妖精'];
    return unique.sort((a, b) => {
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }).slice(0, 2);
  }
  
  return unique;
}

// 计算融合属性值
export function calculateSimpleFusedStats(stats1: any, stats2: any): any {
  return {
    hp: Math.round((stats1.hp + stats2.hp) / 2),
    attack: Math.round((stats1.attack + stats2.attack) / 2),
    defense: Math.round((stats1.defense + stats2.defense) / 2),
    specialAttack: Math.round((stats1.specialAttack + stats2.specialAttack) / 2),
    specialDefense: Math.round((stats1.specialDefense + stats2.specialDefense) / 2),
    speed: Math.round((stats1.speed + stats2.speed) / 2)
  };
}

// 简化的融合函数
export async function createSimpleFusion(
  pokemonA: Pokemon,
  pokemonB: Pokemon
): Promise<SimpleFusionResult> {
  const id = generateSimpleFusionId(pokemonA, pokemonB);
  const name = generateSimpleChineseFusionName(pokemonA.name, pokemonB.name);
  const types = calculateSimpleFusedTypes(pokemonA.type, pokemonB.type);
  
  // 模拟属性
  const height = Math.round(((pokemonA.height || 0) + (pokemonB.height || 0)) / 2);
  const weight = Math.round(((pokemonA.weight || 0) + (pokemonB.weight || 0)) / 2);
  
  // 模拟能力
  const abilities = ['特性1', '特性2', '隐藏特性'];
  
  // 生成精灵图URL
  const fusedSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonA.id}.png`;
  
  return {
    id,
    name,
    pokemonA,
    pokemonB,
    fusedSprite,
    types,
    abilities,
    height,
    weight
  };
}
