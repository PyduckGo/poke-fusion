// 真正的宝可梦杂交算法 - 突破照片限制，生成全新物种
import { Pokemon } from '../types/pokemon';
import { sampleSize } from 'lodash-es';

// 杂交配置
export interface HybridConfig {
  geneticMix: number; // 基因混合比例 0-1
  featureTransfer: boolean; // 特征转移
  colorHarmony: boolean; // 色彩和谐
  evolutionChain: boolean; // 进化链继承
}

// 默认配置
const defaultHybridConfig: HybridConfig = {
  geneticMix: 0.5,
  featureTransfer: true,
  colorHarmony: true,
  evolutionChain: true
};

// 特征类型定义
interface PokemonFeatures {
  bodyShape: string; // 身体形状
  colorPalette: string[]; // 颜色调色板
  specialFeatures: string[]; // 特殊特征
  size: 'small' | 'medium' | 'large'; // 体型
  habitat: string; // 栖息地
}

// 杂交结果
export interface HybridPokemon {
  id: string;
  name: string;
  sprite: string;
  features: PokemonFeatures;
  types: string[];
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  evolution: {
    canEvolve: boolean;
    nextStage?: string;
    evolutionLevel?: number;
  };
  generation: number;
}

// 特征数据库
const featureDatabase = {
  bodyShapes: [
    'quadruped', 'bipedal', 'serpentine', 'avian', 'aquatic', 
    'insectoid', 'plant-like', 'mineral', 'amorphous', 'mechanical'
  ],
  colorPalettes: {
    fire: ['#FF4500', '#FF6347', '#FF8C00', '#FFD700'],
    water: ['#1E90FF', '#00BFFF', '#87CEEB', '#B0E0E6'],
    grass: ['#228B22', '#32CD32', '#90EE90', '#98FB98'],
    electric: ['#FFD700', '#FFFF00', '#FFFACD', '#FFF8DC'],
    psychic: ['#9370DB', '#BA55D3', '#DDA0DD', '#E6E6FA'],
    dark: ['#2F4F4F', '#696969', '#708090', '#A9A9A9'],
    dragon: ['#8B0000', '#B22222', '#DC143C', '#FF6347'],
    fairy: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFE4E1']
  },
  specialFeatures: [
    'wings', 'horns', 'scales', 'fur', 'feathers', 'gills', 
    'antennae', 'claws', 'fangs', 'spikes', 'shell', 'crystals'
  ],
  habitats: [
    'forest', 'mountain', 'ocean', 'cave', 'grassland', 
    'desert', 'swamp', 'volcano', 'arctic', 'urban'
  ]
};

/**
 * 真正的杂交算法 - 生成全新宝可梦物种
 */
export class HybridFusion {
  /**
   * 创建杂交宝可梦
   */
  static async createHybrid(
    pokemonA: Pokemon,
    pokemonB: Pokemon,
    config: Partial<HybridConfig> = {}
  ): Promise<HybridPokemon> {
    const finalConfig = { ...defaultHybridConfig, ...config };
    
    // 提取特征
    const featuresA = this.extractFeatures(pokemonA);
    const featuresB = this.extractFeatures(pokemonB);
    
    // 基因混合
    const hybridFeatures = this.mixGenes(featuresA, featuresB, finalConfig.geneticMix);
    
    // 生成新物种
    const hybrid = this.generateNewSpecies(pokemonA, pokemonB, hybridFeatures, finalConfig);
    
    // 生成精灵图
    const sprite = await this.generateHybridSprite(pokemonA, pokemonB, hybridFeatures);
    
    return {
      ...hybrid,
      sprite
    };
  }

  /**
   * 提取宝可梦特征
   */
  static extractFeatures(pokemon: Pokemon): PokemonFeatures {
    // 基于类型推断特征
    const typeFeatures = this.getTypeFeatures(pokemon.type);
    
    // 基于ID推断体型
    const size = this.getSizeFromId(pokemon.id);
    
    // 基于名称推断栖息地
    const habitat = this.getHabitatFromName(pokemon.name);
    
    return {
      bodyShape: typeFeatures.bodyShape,
      colorPalette: typeFeatures.colors,
      specialFeatures: typeFeatures.features,
      size,
      habitat
    };
  }

  /**
   * 根据类型获取特征
   */
  static getTypeFeatures(types: string[]): {
    bodyShape: string;
    colors: string[];
    features: string[];
  } {
    const primaryType = types[0];
    
    const typeMap: Record<string, any> = {
      '火': {
        bodyShape: 'quadruped',
        colors: featureDatabase.colorPalettes.fire,
        features: ['scales', 'spikes']
      },
      '水': {
        bodyShape: 'aquatic',
        colors: featureDatabase.colorPalettes.water,
        features: ['gills', 'fins']
      },
      '草': {
        bodyShape: 'plant-like',
        colors: featureDatabase.colorPalettes.grass,
        features: ['leaves', 'flowers']
      },
      '电': {
        bodyShape: 'bipedal',
        colors: featureDatabase.colorPalettes.electric,
        features: ['antennae', 'sparks']
      },
      '超能力': {
        bodyShape: 'bipedal',
        colors: featureDatabase.colorPalettes.psychic,
        features: ['crystals', 'aura']
      },
      '龙': {
        bodyShape: 'serpentine',
        colors: featureDatabase.colorPalettes.dragon,
        features: ['wings', 'horns', 'scales']
      },
      '恶': {
        bodyShape: 'quadruped',
        colors: featureDatabase.colorPalettes.dark,
        features: ['claws', 'fangs']
      },
      '妖精': {
        bodyShape: 'bipedal',
        colors: featureDatabase.colorPalettes.fairy,
        features: ['wings', 'sparkles']
      }
    };
    
    return typeMap[primaryType] || {
      bodyShape: 'bipedal',
      colors: ['#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3'],
      features: ['fur', 'claws']
    };
  }

  /**
   * 根据ID推断体型
   */
  static getSizeFromId(id: number): 'small' | 'medium' | 'large' {
    if (id <= 100) return 'small';
    if (id <= 200) return 'medium';
    return 'large';
  }

  /**
   * 根据名称推断栖息地
   */
  static getHabitatFromName(name: string): string {
    const habitatMap: Record<string, string> = {
      '龙': 'mountain',
      '水': 'ocean',
      '火': 'volcano',
      '草': 'forest',
      '雷': 'stormy',
      '冰': 'arctic',
      '超': 'psychic-realm'
    };
    
    for (const [key, habitat] of Object.entries(habitatMap)) {
      if (name.includes(key)) return habitat;
    }
    
    return 'grassland';
  }

  /**
   * 基因混合算法
   */
  static mixGenes(
    featuresA: PokemonFeatures,
    featuresB: PokemonFeatures,
    mixRatio: number
  ): PokemonFeatures {
    // 随机选择特征
    const random = () => Math.random();
    
    return {
      bodyShape: random() < mixRatio ? featuresA.bodyShape : featuresB.bodyShape,
      colorPalette: this.mixColorPalettes(featuresA.colorPalette, featuresB.colorPalette, mixRatio),
      specialFeatures: this.mixFeatures(featuresA.specialFeatures, featuresB.specialFeatures, mixRatio),
      size: random() < mixRatio ? featuresA.size : featuresB.size,
      habitat: random() < mixRatio ? featuresA.habitat : featuresB.habitat
    };
  }

  /**
   * 混合颜色调色板
   */
  static mixColorPalettes(
    paletteA: string[],
    paletteB: string[],
    ratio: number
  ): string[] {
    const mixed: string[] = [];
    const length = Math.max(paletteA.length, paletteB.length);
    
    for (let i = 0; i < length; i++) {
      const colorA = paletteA[i % paletteA.length];
      const colorB = paletteB[i % paletteB.length];
      
      if (Math.random() < ratio) {
        mixed.push(colorA);
      } else {
        mixed.push(colorB);
      }
    }
    
    return mixed;
  }

  /**
   * 混合特征
   */
  static mixFeatures(
    featuresA: string[],
    featuresB: string[],
    ratio: number
  ): string[] {
    const mixed = new Set<string>();
    
    // 从A中选择
    featuresA.forEach(feature => {
      if (Math.random() < ratio) mixed.add(feature);
    });
    
    // 从B中选择
    featuresB.forEach(feature => {
      if (Math.random() < (1 - ratio)) mixed.add(feature);
    });
    
    // 确保至少有一个特征
    if (mixed.size === 0) {
      mixed.add(featuresA[0] || featuresB[0] || 'fur');
    }
    
    return Array.from(mixed);
  }

  /**
   * 生成新物种
   */
  static generateNewSpecies(
    pokemonA: Pokemon,
    pokemonB: Pokemon,
    features: PokemonFeatures,
    config: HybridConfig
  ): Omit<HybridPokemon, 'sprite'> {
    // 生成新名称
    const name = this.generateHybridName(pokemonA.name, pokemonB.name);
    
    // 生成新ID
    const id = `H${Date.now().toString(36).toUpperCase()}`;
    
    // 混合类型
    const types = this.mixTypes(pokemonA.type, pokemonB.type);
    
    // 混合能力
    const abilities = this.mixAbilities(pokemonA.name, pokemonB.name);
    
    // 混合属性
    const stats = this.mixStats(pokemonA, pokemonB, config.geneticMix);
    
    // 进化信息
    const evolution = this.generateEvolution(pokemonA, pokemonB, config.evolutionChain);
    
    // 世代
    const generation = Math.max(pokemonA.generation, pokemonB.generation);
    
    return {
      id,
      name,
      features,
      types,
      abilities,
      stats,
      evolution,
      generation
    };
  }

  /**
   * 生成杂交名称
   */
  static generateHybridName(nameA: string, nameB: string): string {
    // 中文名称混合算法
    const charsA = nameA.split('');
    const charsB = nameB.split('');
    
    // 取第一个字的前半部分和第二个字的后半部分
    const firstChar = charsA[0];
    const lastChar = charsB[charsB.length - 1];
    
    // 添加杂交标识
    const hybridSuffixes = ['兽', '灵', '怪', '王', '皇', '神', '魔', '妖'];
    const suffix = hybridSuffixes[Math.floor(Math.random() * hybridSuffixes.length)];
    
    return `${firstChar}${lastChar}${suffix}`;
  }

  /**
   * 混合类型
   */
  static mixTypes(typesA: string[], typesB: string[]): string[] {
    const allTypes = [...new Set([...typesA, ...typesB])];
    
    // 限制为最多2种类型
    if (allTypes.length <= 2) return allTypes;
    
    // 随机选择2种
    return sampleSize(allTypes, 2);
  }

  /**
   * 混合能力
   */
  static mixAbilities(nameA: string, nameB: string): string[] {
    const abilityMap: Record<string, string[]> = {
      '火': ['猛火', '火焰之躯', '日照'],
      '水': ['激流', '雨盘', '储水'],
      '草': ['茂盛', '叶绿素', '收获'],
      '电': ['静电', '避雷针', '电气引擎'],
      '超': ['同步', '精神力', '魔法防守'],
      '龙': ['精神力', '破格', '多重鳞片'],
      '恶': ['威吓', '紧张感', '恶作剧之心'],
      '妖': ['迷人之躯', '妖精皮肤', '薄雾制造者']
    };
    
    const abilities = new Set<string>();
    
    // 从两个宝可梦的名称中提取关键字
    const keywords = [nameA, nameB].map(name => {
      for (const [key, abs] of Object.entries(abilityMap)) {
        if (name.includes(key)) return abs;
      }
      return ['一般特性'];
    }).flat();
    
    // 随机选择2-3个能力
    const selected = sampleSize(keywords, Math.min(3, keywords.length));
    return selected;
  }

  /**
   * 混合属性
   */
  static mixStats(
    pokemonA: Pokemon,
    pokemonB: Pokemon,
    ratio: number
  ): HybridPokemon['stats'] {
    // 基础属性范围
    const baseStats = {
      hp: 50,
      attack: 50,
      defense: 50,
      spAttack: 50,
      spDefense: 50,
      speed: 50
    };
    
    // 根据ID调整属性
    const adjustStats = (id: number) => {
      const factor = (id % 100) / 100;
      return {
        hp: baseStats.hp + Math.floor(factor * 100),
        attack: baseStats.attack + Math.floor(factor * 100),
        defense: baseStats.defense + Math.floor(factor * 100),
        spAttack: baseStats.spAttack + Math.floor(factor * 100),
        spDefense: baseStats.spDefense + Math.floor(factor * 100),
        speed: baseStats.speed + Math.floor(factor * 100)
      };
    };
    
    const statsA = adjustStats(pokemonA.id);
    const statsB = adjustStats(pokemonB.id);
    
    // 混合属性
    return {
      hp: Math.round(statsA.hp * ratio + statsB.hp * (1 - ratio)),
      attack: Math.round(statsA.attack * ratio + statsB.attack * (1 - ratio)),
      defense: Math.round(statsA.defense * ratio + statsB.defense * (1 - ratio)),
      spAttack: Math.round(statsA.spAttack * ratio + statsB.spAttack * (1 - ratio)),
      spDefense: Math.round(statsA.spDefense * ratio + statsB.spDefense * (1 - ratio)),
      speed: Math.round(statsA.speed * ratio + statsB.speed * (1 - ratio))
    };
  }

  /**
   * 生成进化信息
   */
  static generateEvolution(
    pokemonA: Pokemon,
    pokemonB: Pokemon,
    useChain: boolean
  ): HybridPokemon['evolution'] {
    if (!useChain) {
      return { canEvolve: false };
    }
    
    // 根据ID决定是否可以进化
    const canEvolve = (pokemonA.id + pokemonB.id) % 3 === 0;
    
    if (canEvolve) {
      return {
        canEvolve: true,
        nextStage: `进化形态`,
        evolutionLevel: Math.floor((pokemonA.id + pokemonB.id) / 2)
      };
    }
    
    return { canEvolve: false };
  }

  /**
   * 生成杂交精灵图
   */
  static async generateHybridSprite(
    pokemonA: Pokemon,
    pokemonB: Pokemon,
    features: PokemonFeatures
  ): Promise<string> {
    // 使用Canvas API生成精灵图
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法创建canvas');
    }
    
    canvas.width = 512;
    canvas.height = 512;
    
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    features.colorPalette.forEach((color, index) => {
      gradient.addColorStop(index / features.colorPalette.length, color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // 绘制基本形状
    this.drawBodyShape(ctx, features.bodyShape, features.colorPalette[0]);
    
    // 添加特殊特征
    features.specialFeatures.forEach(feature => {
      this.drawFeature(ctx, feature, features.colorPalette[1]);
    });
    
    // 添加像素化效果
    this.applyPixelation(ctx, 512, 512);
    
    return canvas.toDataURL();
  }

  /**
   * 绘制身体形状
   */
  static drawBodyShape(
    ctx: CanvasRenderingContext2D,
    shape: string,
    color: string
  ): void {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    switch (shape) {
      case 'quadruped':
        // 四足形状
        ctx.beginPath();
        ctx.ellipse(256, 300, 80, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'bipedal':
        // 双足形状
        ctx.beginPath();
        ctx.ellipse(256, 280, 60, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'serpentine':
        // 蛇形
        ctx.beginPath();
        ctx.moveTo(150, 256);
        ctx.quadraticCurveTo(256, 150, 362, 256);
        ctx.quadraticCurveTo(256, 362, 150, 256);
        ctx.fill();
        ctx.stroke();
        break;
        
      default:
        // 默认圆形
        ctx.beginPath();
        ctx.arc(256, 256, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
  }

  /**
   * 绘制特殊特征
   */
  static drawFeature(
    ctx: CanvasRenderingContext2D,
    feature: string,
    color: string
  ): void {
    ctx.fillStyle = color;
    
    switch (feature) {
      case 'wings':
        // 翅膀
        ctx.beginPath();
        ctx.ellipse(180, 200, 40, 20, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(332, 200, 40, 20, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'horns':
        // 角
        ctx.beginPath();
        ctx.moveTo(240, 180);
        ctx.lineTo(230, 150);
        ctx.lineTo(250, 150);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(272, 180);
        ctx.lineTo(262, 150);
        ctx.lineTo(282, 150);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'spikes':
        // 尖刺
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = 256 + Math.cos(angle) * 120;
          const y = 256 + Math.sin(angle) * 120;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        break;
    }
  }

  /**
   * 应用像素化效果
   */
  static applyPixelation(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pixelSize: number = 4
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const newImageData = ctx.createImageData(width, height);
    
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const index = (y * width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];
        
        // 填充像素块
        for (let py = 0; py < pixelSize && y + py < height; py++) {
          for (let px = 0; px < pixelSize && x + px < width; px++) {
            const targetIndex = ((y + py) * width + (x + px)) * 4;
            newImageData.data[targetIndex] = r;
            newImageData.data[targetIndex + 1] = g;
            newImageData.data[targetIndex + 2] = b;
            newImageData.data[targetIndex + 3] = a;
          }
        }
      }
    }
    
    ctx.putImageData(newImageData, 0, 0);
  }
}

/**
 * 用户照片与宝可梦的杂交
 */
export class UserPokemonHybrid {
  /**
   * 创建用户与宝可梦的杂交
   */
  static async createUserHybrid(
    userImage: string,
    pokemon: Pokemon,
    userName: string,
    config: Partial<HybridConfig> = {}
  ): Promise<HybridPokemon> {
    const finalConfig = { ...defaultHybridConfig, ...config };
    
    // 提取用户特征（模拟）
    const userFeatures: PokemonFeatures = {
      bodyShape: 'bipedal',
      colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      specialFeatures: ['human-like', 'clothing'],
      size: 'medium',
      habitat: 'urban'
    };
    
    // 提取宝可梦特征
    const pokemonFeatures = HybridFusion.extractFeatures(pokemon);
    
    // 混合特征
    const hybridFeatures = HybridFusion.mixGenes(userFeatures, pokemonFeatures, 0.6);
    
    // 生成新物种
    const hybrid = HybridFusion.generateNewSpecies(
      { ...pokemon, name: userName } as Pokemon,
      pokemon,
      hybridFeatures,
      finalConfig
    );
    
    // 生成精灵图
    const sprite = await this.generateUserHybridSprite(userImage, pokemon, hybridFeatures);
    
    return {
      ...hybrid,
      name: `${userName}${pokemon.name}兽`,
      sprite
    };
  }

  /**
   * 生成用户杂交精灵图
   */
  private static async generateUserHybridSprite(
    userImage: string,
    pokemon: Pokemon,
    features: PokemonFeatures
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法创建canvas');
    }
    
    canvas.width = 512;
    canvas.height = 512;
    
    // 加载用户图片
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // 绘制用户图片作为背景
        ctx.drawImage(img, 0, 0, 512, 512);
        
        // 应用宝可梦特征
        HybridFusion.drawBodyShape(ctx, features.bodyShape, features.colorPalette[0]);
        
        // 添加特殊特征
        features.specialFeatures.forEach(feature => {
          HybridFusion.drawFeature(ctx, feature, features.colorPalette[1]);
        });
        
        // 应用像素化效果
        HybridFusion.applyPixelation(ctx, 512, 512);
        
        resolve(canvas.toDataURL());
      };
      
      img.onerror = reject;
      img.src = userImage;
    });
  }
}

// 导出工具函数
export const hybridUtils = {
  /**
   * 批量生成杂交宝可梦
   */
  async batchCreateHybrids(
    pokemonList: Pokemon[],
    count: number = 10
  ): Promise<HybridPokemon[]> {
    const hybrids: HybridPokemon[] = [];
    
    for (let i = 0; i < count; i++) {
      const [pokemonA, pokemonB] = sampleSize(pokemonList, 2);
      const hybrid = await HybridFusion.createHybrid(pokemonA, pokemonB);
      hybrids.push(hybrid);
    }
    
    return hybrids;
  },

  /**
   * 保存杂交结果
   */
  saveHybrid(hybrid: HybridPokemon): void {
    const hybrids = JSON.parse(localStorage.getItem('hybridPokemon') || '[]');
    hybrids.push(hybrid);
    localStorage.setItem('hybridPokemon', JSON.stringify(hybrids));
  },

  /**
   * 加载保存的杂交结果
   */
  loadHybrids(): HybridPokemon[] {
    return JSON.parse(localStorage.getItem('hybridPokemon') || '[]');
  }
};
