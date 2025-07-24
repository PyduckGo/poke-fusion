// 宝可梦API工具类
import { PokemonClient } from 'pokenode-ts';
import type { Pokemon } from '../types';

const P = new PokemonClient();

// 缓存已获取的宝可梦数据
const pokemonCache = new Map<number, Pokemon>();

// 类型中文映射
const typeChineseMap: Record<string, string> = {
  normal: '一般',
  fire: '火',
  water: '水',
  electric: '电',
  grass: '草',
  ice: '冰',
  fighting: '格斗',
  poison: '毒',
  ground: '地面',
  flying: '飞行',
  psychic: '超能力',
  bug: '虫',
  rock: '岩石',
  ghost: '幽灵',
  dragon: '龙',
  dark: '恶',
  steel: '钢',
  fairy: '妖精'
};

// 特性中文映射（简化版）
const abilityChineseMap: Record<string, string> = {
  'stench': '恶臭',
  'drizzle': '降雨',
  'speed-boost': '加速',
  'battle-armor': '战斗盔甲',
  'sturdy': '结实',
  'damp': '湿气',
  'limber': '柔软',
  'sand-veil': '沙隐',
  'static': '静电',
  'volt-absorb': '蓄电',
  'water-absorb': '储水',
  'oblivious': '迟钝',
  'cloud-nine': '无关天气',
  'compound-eyes': '复眼',
  'insomnia': '不眠',
  'color-change': '变色',
  'immunity': '免疫',
  'flash-fire': '引火',
  'own-tempo': '我行我素',
  'suction-cups': '吸盘',
  'intimidate': '威吓',
  'shadow-tag': '踩影',
  'rough-skin': '粗糙皮肤',
  'wonder-guard': '神奇守护',
  'levitate': '飘浮',
  'effect-spore': '孢子',
  'synchronize': '同步',
  'clear-body': '净体',
  'natural-cure': '自然回复',
  'lightning-rod': '避雷针',
  'serene-grace': '天恩',
  'swift-swim': '悠游自如',
  'chlorophyll': '叶绿素',
  'illuminate': '发光',
  'trace': '复制',
  'huge-power': '大力士',
  'poison-point': '毒刺',
  'inner-focus': '精神力',
  'magma-armor': '熔岩铠甲',
  'water-veil': '水幕',
  'magnet-pull': '磁力',
  'soundproof': '隔音',
  'rain-dish': '雨盘',
  'sand-stream': '扬沙',
  'pressure': '压迫感',
  'thick-fat': '厚脂肪',
  'early-bird': '早起',
  'flame-body': '火焰之躯',
  'run-away': '逃跑',
  'keen-eye': '锐利目光',
  'hyper-cutter': '怪力钳',
  'pickup': '捡拾',
  'truant': '懒惰',
  'hustle': '活力',
  'cute-charm': '迷人之躯',
  'plus': '正电',
  'minus': '负电',
  'forecast': '阴晴不定',
  'sticky-hold': '黏着',
  'shed-skin': '蜕皮',
  'guts': '毅力',
  'marvel-scale': '神奇鳞片',
  'liquid-ooze': '污泥浆',
  'overgrow': '茂盛',
  'blaze': '猛火',
  'torrent': '激流',
  'swarm': '虫之预感'
};

// 获取随机宝可梦
export async function getRandomPokemon(): Promise<Pokemon> {
  // 宝可梦ID范围：1-1025（截至第9世代）
  const maxPokemon = 1025;
  const randomId = Math.floor(Math.random() * maxPokemon) + 1;
  
  return getPokemonById(randomId);
}

// 根据ID获取宝可梦
export async function getPokemonById(id: number): Promise<Pokemon> {
  // 检查缓存
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id)!;
  }

  try {
    const pokemon = await P.getPokemonById(id);
    const species = await P.getPokemonSpeciesById(id);
    
    // 合并数据
    const mergedPokemon: Pokemon = {
      ...pokemon,
      names: species.names,
      cries: {
        latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
      }
    } as Pokemon;
    
    // 缓存结果
    pokemonCache.set(id, mergedPokemon);
    return mergedPokemon;
  } catch (error) {
    console.error(`获取宝可梦 ${id} 失败:`, error);
    throw error;
  }
}

// 获取两只不同世代的随机宝可梦
export async function getRandomPokemonPair(): Promise<[Pokemon, Pokemon]> {
  const generations = [
    { start: 1, end: 151 },   // 第1世代
    { start: 152, end: 251 }, // 第2世代
    { start: 252, end: 386 }, // 第3世代
    { start: 387, end: 493 }, // 第4世代
    { start: 494, end: 649 }, // 第5世代
    { start: 650, end: 721 }, // 第6世代
    { start: 722, end: 809 }, // 第7世代
    { start: 810, end: 905 }, // 第8世代
    { start: 906, end: 1025 } // 第9世代
  ];

  // 随机选择两个不同世代
  const selectedGenerations: Array<{ start: number; end: number }> = [];
  while (selectedGenerations.length < 2) {
    const gen = generations[Math.floor(Math.random() * generations.length)];
    if (!selectedGenerations.includes(gen)) {
      selectedGenerations.push(gen);
    }
  }

  // 从选中的世代中随机选择宝可梦
  const [gen1, gen2] = selectedGenerations;
  const id1 = Math.floor(Math.random() * (gen1.end - gen1.start + 1)) + gen1.start;
  const id2 = Math.floor(Math.random() * (gen2.end - gen2.start + 1)) + gen2.start;

  const [pokemon1, pokemon2] = await Promise.all([
    getPokemonById(id1),
    getPokemonById(id2)
  ]);

  return [pokemon1, pokemon2];
}

// 获取宝可梦的中文名称
export function getChineseName(pokemon: Pokemon | null): string {
  if (!pokemon) return '未知宝可梦';
  const chineseName = pokemon.names?.find(
    name => name.language.name === 'zh-Hans'
  );
  return chineseName?.name || pokemon.name;
}

// 获取类型中文名
export function getTypeChinese(type: string): string {
  return typeChineseMap[type] || type;
}

// 获取特性中文名
export function getAbilityChinese(ability: string): string {
  return abilityChineseMap[ability] || ability;
}

// 预加载宝可梦数据
export async function preloadPokemonData(count: number = 50) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    promises.push(getPokemonById(randomId));
  }
  await Promise.allSettled(promises);
}
