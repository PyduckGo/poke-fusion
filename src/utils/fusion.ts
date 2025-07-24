// 宝可梦融合算法实现 - 简化版本
import type { Pokemon, FusionResult } from '../types';
import { getChineseName } from './pokemonApi';

// 融合算法类型
export type FusionAlgorithm = 'xor' | 'blend' | 'chromatic';

// 创建融合宝可梦
export async function createFusion(
  pokemonA: Pokemon,
  pokemonB: Pokemon,
  algorithm: FusionAlgorithm = 'blend'
): Promise<FusionResult> {
  try {
    // 1. 获取精灵图片（使用Canvas API进行简单融合）
    const fusedSprite = await createFusedSprite(pokemonA.sprites.front_default, pokemonB.sprites.front_default, algorithm);

    // 2. 生成融合名称
    const fusedName = generateFusionName(pokemonA, pokemonB);

    // 3. 计算融合属性
    const fusedTypes = calculateFusedTypes(pokemonA.types, pokemonB.types);
    const fusedAbilities = calculateFusedAbilities(pokemonA.abilities, pokemonB.abilities);
    const fusedHeight = calculateFusedStat(pokemonA.height, pokemonB.height);
    const fusedWeight = calculateFusedStat(pokemonA.weight, pokemonB.weight);

    // 4. 生成唯一ID
    const fusionId = generateFusionId(pokemonA.id, pokemonB.id);

    return {
      id: fusionId,
      name: fusedName,
      pokemonA,
      pokemonB,
      fusedSprite,
      types: fusedTypes,
      abilities: fusedAbilities,
      height: fusedHeight,
      weight: fusedWeight,
      cryUrl: pokemonA.cries.latest,
      generation: Math.max(
        getPokemonGeneration(pokemonA.id),
        getPokemonGeneration(pokemonB.id)
      )
    };
  } catch (error) {
    console.error('融合失败:', error);
    throw new Error('无法创建融合宝可梦');
  }
}

// 使用Canvas创建融合精灵
async function createFusedSprite(spriteUrlA: string, spriteUrlB: string, algorithm: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas'));
      return;
    }

    canvas.width = 256;
    canvas.height = 256;

    const imgA = new Image();
    const imgB = new Image();

    imgA.crossOrigin = 'anonymous';
    imgB.crossOrigin = 'anonymous';

    let loadedCount = 0;
    
    const checkBothLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        // 绘制两张图片 - 启用平滑处理
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 清除画布
        ctx.clearRect(0, 0, 256, 256);
        
        switch (algorithm) {
          case 'xor':
            // XOR效果：使用globalCompositeOperation
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(imgA, 0, 0, 256, 256);
            ctx.globalCompositeOperation = 'xor';
            ctx.drawImage(imgB, 0, 0, 256, 256);
            break;
            
          case 'chromatic':
            // 色彩偏移效果 - 更自然的色彩混合
            ctx.globalCompositeOperation = 'source-over';
            ctx.filter = 'hue-rotate(45deg) saturate(1.2)';
            ctx.globalAlpha = 0.7;
            ctx.drawImage(imgA, 0, 0, 256, 256);
            ctx.filter = 'hue-rotate(-45deg) saturate(1.2)';
            ctx.globalAlpha = 0.7;
            ctx.drawImage(imgB, 0, 0, 256, 256);
            break;
            
          case 'blend':
          default:
            // 混合效果 - 使用更自然的混合
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.65;
            ctx.drawImage(imgA, 0, 0, 256, 256);
            ctx.globalAlpha = 0.65;
            ctx.drawImage(imgB, 0, 0, 256, 256);
            break;
        }

        // 应用像素化效果（可选）
        // const imageData = ctx.getImageData(0, 0, 256, 256);
        // const pixelated = pixelateImageData(imageData, 8);
        // ctx.putImageData(pixelated, 0, 0);

        resolve(canvas.toDataURL());
      }
    };

    imgA.onload = checkBothLoaded;
    imgB.onload = checkBothLoaded;
    imgA.onerror = reject;
    imgB.onerror = reject;

    imgA.src = spriteUrlA;
    imgB.src = spriteUrlB;
  });
}

// 像素化图像数据
function pixelateImageData(imageData: ImageData, pixelSize: number): ImageData {
  const { width, height, data } = imageData;
  const newData = new Uint8ClampedArray(data);
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const pos = (y * width + x) * 4;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];
      
      // 填充像素块
      for (let py = 0; py < pixelSize && y + py < height; py++) {
        for (let px = 0; px < pixelSize && x + px < width; px++) {
          const newPos = ((y + py) * width + (x + px)) * 4;
          newData[newPos] = r;
          newData[newPos + 1] = g;
          newData[newPos + 2] = b;
          newData[newPos + 3] = a;
        }
      }
    }
  }
  
  return new ImageData(newData, width, height);
}

// 生成融合名称
function generateFusionName(pokemonA: Pokemon, pokemonB: Pokemon): string {
  const nameA = getChineseName(pokemonA);
  const nameB = getChineseName(pokemonB);
  
  // 简单的名称融合算法
  const splitPointA = Math.floor(nameA.length / 2);
  const splitPointB = Math.floor(nameB.length / 2);
  
  const firstHalf = nameA.substring(0, splitPointA);
  const secondHalf = nameB.substring(splitPointB);
  
  // 添加随机后缀
  const suffixes = ['兽', '龙', '鸟', '鱼', '花', '草', '火', '水', '雷', '冰'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)] || '兽';
  
  return firstHalf + secondHalf + suffix;
}

// 计算融合属性
function calculateFusedTypes(typesA: any[], typesB: any[]): string[] {
  const typeNamesA = typesA.map((t: any) => t.type.name);
  const typeNamesB = typesB.map((t: any) => t.type.name);
  
  // 合并并去重
  const allTypes = [...typeNamesA, ...typeNamesB];
  const uniqueTypes = [...new Set(allTypes)];
  
  // 最多保留2个属性
  if (uniqueTypes.length > 2) {
    return uniqueTypes.slice(0, 2);
  }
  
  return uniqueTypes;
}

// 计算融合特性
function calculateFusedAbilities(abilitiesA: any[], abilitiesB: any[]): string[] {
  const allAbilities = [...abilitiesA, ...abilitiesB];
  
  // 按权重排序（非隐藏特性优先）
  const sortedAbilities = allAbilities
    .filter((a: any) => !a.is_hidden)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((a: any) => a.ability.name);
  
  return sortedAbilities;
}

// 计算融合数值
function calculateFusedStat(statA: number, statB: number): number {
  // 使用平均值加一点随机性
  const average = (statA + statB) / 2;
  const variation = average * 0.2; // 20%的随机变化
  return Math.round(average + (Math.random() - 0.5) * variation);
}

// 生成融合ID
function generateFusionId(idA: number, idB: number): string {
  // 使用SHA-256类似的哈希算法生成唯一ID
  const combined = `${idA}-${idB}-${Date.now()}`;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return `F${Math.abs(hash).toString(16).toUpperCase()}`;
}

// 获取宝可梦世代
function getPokemonGeneration(pokemonId: number): number {
  if (pokemonId <= 151) return 1;
  if (pokemonId <= 251) return 2;
  if (pokemonId <= 386) return 3;
  if (pokemonId <= 493) return 4;
  if (pokemonId <= 649) return 5;
  if (pokemonId <= 721) return 6;
  if (pokemonId <= 809) return 7;
  if (pokemonId <= 905) return 8;
  return 9;
}

// 导出工具函数供测试使用
export {
  generateFusionName,
  calculateFusedTypes,
  calculateFusedAbilities,
  calculateFusedStat,
  generateFusionId
};
