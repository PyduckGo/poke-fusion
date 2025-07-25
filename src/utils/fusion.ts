// 使用 any 类型绕过 Jimp 类型检查
declare const Jimp: any;

import { Pokemon, FusedPokemon, PokemonStats } from '../types/pokemon';
import pokemonData from '../data/pokemon.json';

// 生成融合ID
export function generateFusionId(pokemon1: Pokemon, pokemon2: Pokemon): string {
  return `F${Math.min(pokemon1.id, pokemon2.id).toString().padStart(3, '0')}${Math.max(pokemon1.id, pokemon2.id).toString().padStart(3, '0')}`;
}

// 生成中文融合名称
export function generateChineseFusionName(name1: string, name2: string): string {
  // 简单的名称融合算法
  const len1 = Math.ceil(name1.length / 2);
  const len2 = Math.floor(name2.length / 2);
  return name1.substring(0, len1) + name2.substring(name2.length - len2);
}

// 获取宝可梦像素图片
export async function getPokemonSprite(pokemonId: number): Promise<string> {
  // 使用PokeAPI获取官方像素图
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

// 融合两张图片
export async function fusePokemonSprites(
  sprite1Url: string,
  sprite2Url: string,
  useShape1: boolean = true
): Promise<string> {
  try {
    // 加载两张图片
    const [img1, img2] = await Promise.all([
      Jimp.read(sprite1Url),
      Jimp.read(sprite2Url)
    ]);

    // 确保图片大小一致
    const size = 512;
    img1.resize(size, size);
    img2.resize(size, size);

    // 创建融合图像
    const fused = new Jimp(size, size);

    // 使用tracking.js类似的特征点检测逻辑
    // 这里简化实现：使用形状遮罩进行融合
    const mask = createShapeMask(img1);
    
    // 将第二张图片的颜色应用到第一张图片的形状上
    img1.scan(0, 0, img1.bitmap.width, img1.bitmap.height, function(x: number, y: number, idx: number) {
      const alpha = img1.bitmap.data[idx + 3];
      if (alpha > 128) { // 非透明像素
        const color = img2.getPixelColor(x, y);
        fused.setPixelColor(color, x, y);
      }
    });

    // 应用像素化效果
    const pixelated = applyPixelation(fused, 8);
    
    return await pixelated.getBase64Async('image/png');
  } catch (error) {
    console.error('融合图片失败:', error);
    throw error;
  }
}

// 创建形状遮罩
function createShapeMask(image: any): boolean[][] {
  const mask: boolean[][] = [];
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x: number, y: number, idx: number) {
    if (!mask[y]) mask[y] = [];
    mask[y][x] = image.bitmap.data[idx + 3] > 128;
  });
  return mask;
}

// 应用像素化效果
function applyPixelation(image: any, pixelSize: number): any {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const result = new Jimp(width, height);

  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // 获取像素块的颜色
      const color = image.getPixelColor(x, y);
      
      // 填充整个像素块
      for (let py = 0; py < pixelSize && y + py < height; py++) {
        for (let px = 0; px < pixelSize && x + px < width; px++) {
          result.setPixelColor(color, x + px, y + py);
        }
      }
    }
  }

  return result;
}

// 计算融合属性
export function calculateFusedTypes(type1: string[], type2: string[]): string[] {
  // 合并并去重
  const combined = [...type1, ...type2];
  const unique = [...new Set(combined)];
  
  // 如果超过2种类型，选择最有代表性的2种
  if (unique.length > 2) {
    // 优先保留稀有类型
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
export function calculateFusedStats(stats1: PokemonStats, stats2: PokemonStats): PokemonStats {
  return {
    hp: Math.round((stats1.hp + stats2.hp) / 2),
    attack: Math.round((stats1.attack + stats2.attack) / 2),
    defense: Math.round((stats1.defense + stats2.defense) / 2),
    specialAttack: Math.round((stats1.specialAttack + stats2.specialAttack) / 2),
    specialDefense: Math.round((stats1.specialDefense + stats2.specialDefense) / 2),
    speed: Math.round((stats1.speed + stats2.speed) / 2)
  };
}

// 随机选择宝可梦
export function getRandomPokemonPair(): [Pokemon, Pokemon] {
  const gen1Pokemon = pokemonData.filter(p => p.generation === 1);
  const gen2Pokemon = pokemonData.filter(p => p.generation === 2);
  const gen3Pokemon = pokemonData.filter(p => p.generation === 3);
  
  // 从不同世代随机选择
  const generations = [gen1Pokemon, gen2Pokemon, gen3Pokemon];
  const selectedGens: Pokemon[] = [];
  
  while (selectedGens.length < 2) {
    const randomGen = generations[Math.floor(Math.random() * generations.length)];
    const randomPokemon = randomGen[Math.floor(Math.random() * randomGen.length)];
    
    if (!selectedGens.some(p => p.id === randomPokemon.id)) {
      selectedGens.push(randomPokemon);
    }
  }
  
  return [selectedGens[0], selectedGens[1]] as [Pokemon, Pokemon];
}

// 获取宝可梦详细数据
export async function getPokemonDetails(pokemonId: number) {
  // 这里可以集成PokeAPI获取更详细的数据
  const pokemon = pokemonData.find(p => p.id === pokemonId);
  if (!pokemon) throw new Error(`找不到ID为${pokemonId}的宝可梦`);
  
  return {
    ...pokemon,
    stats: {
      hp: 50 + Math.floor(Math.random() * 100),
      attack: 50 + Math.floor(Math.random() * 100),
      defense: 50 + Math.floor(Math.random() * 100),
      specialAttack: 50 + Math.floor(Math.random() * 100),
      specialDefense: 50 + Math.floor(Math.random() * 100),
      speed: 50 + Math.floor(Math.random() * 100)
    },
    abilities: ['特性1', '特性2', '隐藏特性']
  };
}

// 用户图片与宝可梦融合
export async function fuseUserImageWithPokemon(
  userImageUrl: string,
  pokemonSpriteUrl: string
): Promise<string> {
  try {
    const [userImg, pokemonImg] = await Promise.all([
      Jimp.read(userImageUrl),
      Jimp.read(pokemonSpriteUrl)
    ]);

    const size = 512;
    userImg.resize(size, size);
    pokemonImg.resize(size, size);

    // 创建融合图像，使用宝可梦形状，用户图片颜色
    const fused = new Jimp(size, size);
    
    // 使用宝可梦作为形状遮罩
    pokemonImg.scan(0, 0, pokemonImg.bitmap.width, pokemonImg.bitmap.height, function(x: number, y: number, idx: number) {
      const alpha = pokemonImg.bitmap.data[idx + 3];
      if (alpha > 128) {
        const userColor = userImg.getPixelColor(x, y);
        fused.setPixelColor(userColor, x, y);
      }
    });

    return await fused.getBase64Async(Jimp.MIME_PNG);
  } catch (error) {
    console.error('用户图片融合失败:', error);
    throw error;
  }
}
