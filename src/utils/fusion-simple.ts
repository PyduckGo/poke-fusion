// 简化的宝可梦融合工具，避免复杂的类型问题
import { Pokemon, FusedPokemon, PokemonStats } from '../types/pokemon';
import pokemonData from '../data/pokemon.json';

// 生成融合ID
export function generateFusionId(pokemon1: Pokemon, pokemon2: Pokemon): string {
  return `F${String(Math.min(pokemon1.id, pokemon2.id)).padStart(3, '0')}${String(Math.max(pokemon1.id, pokemon2.id)).padStart(3, '0')}`;
}

// 生成中文融合名称
export function generateChineseFusionName(name1: string, name2: string): string {
  const len1 = Math.ceil(name1.length / 2);
  const len2 = Math.floor(name2.length / 2);
  return name1.substring(0, len1) + name2.substring(name2.length - len2);
}

// 获取宝可梦像素图片URL
export function getPokemonSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

// 计算融合属性
export function calculateFusedTypes(type1: string[], type2: string[]): string[] {
  const combined = [...type1, ...type2];
  const unique = Array.from(new Set(combined));
  
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
  const gen1Pokemon = pokemonData.filter((p: Pokemon) => p.generation === 1);
  const gen2Pokemon = pokemonData.filter((p: Pokemon) => p.generation === 2);
  const gen3Pokemon = pokemonData.filter((p: Pokemon) => p.generation === 3);
  
  const generations = [gen1Pokemon, gen2Pokemon, gen3Pokemon];
  const selectedGens: Pokemon[] = [];
  
  while (selectedGens.length < 2) {
    const randomGen = generations[Math.floor(Math.random() * generations.length)];
    const randomPokemon = randomGen[Math.floor(Math.random() * randomGen.length)];
    
    if (!selectedGens.some((p: Pokemon) => p.id === randomPokemon.id)) {
      selectedGens.push(randomPokemon);
    }
  }
  
  return [selectedGens[0], selectedGens[1]];
}

// 获取宝可梦详细数据
export function getPokemonDetails(pokemonId: number) {
  const pokemon = pokemonData.find((p: Pokemon) => p.id === pokemonId);
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

// 模拟图片融合（使用Canvas API）
export async function fusePokemonSprites(
  sprite1Url: string,
  sprite2Url: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(sprite1Url);
      return;
    }

    canvas.width = 512;
    canvas.height = 512;

    const img1 = new Image();
    const img2 = new Image();

    img1.onload = () => {
      img2.onload = () => {
        // 绘制第一张图片（形状）
        ctx.drawImage(img1, 0, 0, 512, 512);
        
        // 获取图像数据
        const imageData1 = ctx.getImageData(0, 0, 512, 512);
        const imageData2 = ctx.createImageData(512, 512);
        
        // 创建临时canvas绘制第二张图片
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          resolve(sprite1Url);
          return;
        }
        tempCanvas.width = 512;
        tempCanvas.height = 512;
        tempCtx.drawImage(img2, 0, 0, 512, 512);
        const img2Data = tempCtx.getImageData(0, 0, 512, 512);

        // 融合逻辑：使用第一张图片的形状，第二张图片的颜色
        for (let i = 0; i < imageData1.data.length; i += 4) {
          const alpha = imageData1.data[i + 3];
          if (alpha > 128) {
            // 使用第二张图片的颜色
            imageData2.data[i] = img2Data.data[i];     // R
            imageData2.data[i + 1] = img2Data.data[i + 1]; // G
            imageData2.data[i + 2] = img2Data.data[i + 2]; // B
            imageData2.data[i + 3] = 255; // Alpha
          } else {
            // 透明像素
            imageData2.data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData2, 0, 0);
        
        // 应用像素化效果
        applyPixelation(ctx, 512, 512, 8);
        
        resolve(canvas.toDataURL());
      };
      img2.src = sprite2Url;
    };
    img1.src = sprite1Url;
  });
}

// 应用像素化效果
function applyPixelation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelSize: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // 获取像素块的颜色
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      // 填充整个像素块
      for (let py = 0; py < pixelSize && y + py < height; py++) {
        for (let px = 0; px < pixelSize && x + px < width; px++) {
          const targetIndex = ((y + py) * width + (x + px)) * 4;
          data[targetIndex] = r;
          data[targetIndex + 1] = g;
          data[targetIndex + 2] = b;
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// 用户图片与宝可梦融合
export async function fuseUserImageWithPokemon(
  userImageUrl: string,
  pokemonSpriteUrl: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(userImageUrl);
      return;
    }

    canvas.width = 512;
    canvas.height = 512;

    const userImg = new Image();
    const pokemonImg = new Image();

    userImg.onload = () => {
      pokemonImg.onload = () => {
        // 绘制宝可梦作为形状遮罩
        ctx.drawImage(pokemonImg, 0, 0, 512, 512);
        
        const maskData = ctx.getImageData(0, 0, 512, 512);
        ctx.clearRect(0, 0, 512, 512);
        
        // 绘制用户图片
        ctx.drawImage(userImg, 0, 0, 512, 512);
        const userData = ctx.getImageData(0, 0, 512, 512);
        
        // 应用形状遮罩
        for (let i = 0; i < maskData.data.length; i += 4) {
          const alpha = maskData.data[i + 3];
          if (alpha <= 128) {
            userData.data[i + 3] = 0; // 设置为透明
          }
        }
        
        ctx.putImageData(userData, 0, 0);
        
        // 应用像素化效果
        applyPixelation(ctx, 512, 512, 8);
        
        resolve(canvas.toDataURL());
      };
      pokemonImg.src = pokemonSpriteUrl;
    };
    userImg.src = userImageUrl;
  });
}

// 创建融合宝可梦
export async function createFusedPokemon(
  pokemon1: Pokemon,
  pokemon2: Pokemon
): Promise<FusedPokemon> {
  const [details1, details2] = [getPokemonDetails(pokemon1.id), getPokemonDetails(pokemon2.id)];
  
  const fusedId = generateFusionId(pokemon1, pokemon2);
  const fusedName = generateChineseFusionName(pokemon1.name, pokemon2.name);
  const fusedTypes = calculateFusedTypes(pokemon1.type, pokemon2.type);
  const fusedStats = calculateFusedStats(details1.stats, details2.stats);
  
  const sprite1Url = getPokemonSpriteUrl(pokemon1.id);
  const sprite2Url = getPokemonSpriteUrl(pokemon2.id);
  const fusedImage = await fusePokemonSprites(sprite1Url, sprite2Url);
  
  return {
    id: fusedId,
    name: fusedName,
    original1: pokemon1,
    original2: pokemon2,
    fusedImage,
    types: fusedTypes,
    abilities: [...details1.abilities, ...details2.abilities],
    stats: fusedStats,
    cry: `融合宝可梦${fusedName}的叫声`
  };
}
