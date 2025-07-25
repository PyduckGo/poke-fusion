// 融合算法选择器 - 统一接口管理多种融合方案
import { createPixelFusion, type FusionConfig as PixelFusionConfig } from './pixelFusion';
import { createAdvancedFusion, type FusionConfig as AdvancedFusionConfig } from './advancedFusion';
import { createGeneticFusion, type GeneticConfig } from './geneticFusion';

// 融合算法类型
export type FusionAlgorithm = 
  | 'pixel'      // 像素级融合
  | 'advanced'   // 高级解剖学融合
  | 'genetic'    // 基因级融合
  | 'hybrid';    // 混合融合

// 融合结果
export interface FusionResult {
  sprite: string;
  algorithm: FusionAlgorithm;
  metadata?: Record<string, any>;
}

// 融合配置
export interface FusionSelectorConfig {
  algorithm: FusionAlgorithm;
  pixelConfig?: Partial<PixelFusionConfig>;
  advancedConfig?: Partial<AdvancedFusionConfig>;
  geneticConfig?: Partial<GeneticConfig>;
  hybridConfig?: {
    primary: FusionAlgorithm;
    secondary: FusionAlgorithm;
    blendRatio: number;
  };
}

const defaultConfig: FusionSelectorConfig = {
  algorithm: 'genetic',
  pixelConfig: {},
  advancedConfig: {},
  geneticConfig: {},
  hybridConfig: {
    primary: 'genetic',
    secondary: 'advanced',
    blendRatio: 0.7
  }
};

/**
 * 融合算法选择器
 */
export class FusionAlgorithmSelector {
  private algorithms: Map<FusionAlgorithm, Function> = new Map();

  constructor() {
    this.initializeAlgorithms();
  }

  /**
   * 初始化算法映射
   */
  private initializeAlgorithms() {
    this.algorithms.set('pixel', createPixelFusion);
    this.algorithms.set('advanced', createAdvancedFusion);
    this.algorithms.set('genetic', async (urlA: string, urlB: string, config: any) => {
      const result = await createGeneticFusion(urlA, urlB, config);
      return result.sprite;
    });
    this.algorithms.set('hybrid', this.createHybridFusion.bind(this));
  }

  /**
   * 执行融合
   */
  async fuse(
    spriteUrlA: string,
    spriteUrlB: string,
    config: Partial<FusionSelectorConfig> = {}
  ): Promise<FusionResult> {
    const finalConfig = { ...defaultConfig, ...config };
    const algorithm = finalConfig.algorithm;

    try {
      const fusionFunction = this.algorithms.get(algorithm);
      if (!fusionFunction) {
        throw new Error(`未知的融合算法: ${algorithm}`);
      }

      let sprite: string;
      let metadata: Record<string, any> = {};

      switch (algorithm) {
        case 'pixel':
          sprite = await createPixelFusion(
            spriteUrlA, 
            spriteUrlB, 
            finalConfig.pixelConfig
          );
          metadata = { config: finalConfig.pixelConfig };
          break;

        case 'advanced':
          sprite = await createAdvancedFusion(
            spriteUrlA,
            spriteUrlB,
            finalConfig.advancedConfig
          );
          metadata = { config: finalConfig.advancedConfig };
          break;

        case 'genetic':
          const geneticResult = await createGeneticFusion(
            spriteUrlA,
            spriteUrlB,
            finalConfig.geneticConfig
          );
          sprite = geneticResult.sprite;
          metadata = {
            geneticCode: geneticResult.geneticCode,
            traits: geneticResult.traits,
            config: finalConfig.geneticConfig
          };
          break;

        case 'hybrid':
          sprite = await this.createHybridFusion(
            spriteUrlA,
            spriteUrlB,
            finalConfig.hybridConfig!
          );
          metadata = { config: finalConfig.hybridConfig };
          break;

        default:
          throw new Error(`不支持的融合算法: ${algorithm}`);
      }

      return {
        sprite,
        algorithm,
        metadata
      };
    } catch (error) {
      console.error(`融合失败 [${algorithm}]:`, error);
      throw error;
    }
  }

  /**
   * 创建混合融合
   */
  private async createHybridFusion(
    urlA: string,
    urlB: string,
    config: { primary: FusionAlgorithm; secondary: FusionAlgorithm; blendRatio: number }
  ): Promise<string> {
    const { primary, secondary, blendRatio } = config;

    // 获取两种算法的结果
    const [primaryResult, secondaryResult] = await Promise.all([
      this.fuse(urlA, urlB, { algorithm: primary }),
      this.fuse(urlA, urlB, { algorithm: secondary })
    ]);

    // 创建混合画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 512;

    // 加载两张融合图像
    const [img1, img2] = await Promise.all([
      this.loadImage(primaryResult.sprite),
      this.loadImage(secondaryResult.sprite)
    ]);

    // 混合绘制
    ctx.globalAlpha = 1;
    ctx.drawImage(img1, 0, 0, 512, 512);
    
    ctx.globalAlpha = 1 - blendRatio;
    ctx.drawImage(img2, 0, 0, 512, 512);
    
    ctx.globalAlpha = 1;

    return canvas.toDataURL();
  }

  /**
   * 加载图像
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * 获取可用算法列表
   */
  getAvailableAlgorithms(): FusionAlgorithm[] {
    return Array.from(this.algorithms.keys());
  }

  /**
   * 获取算法描述
   */
  getAlgorithmDescription(algorithm: FusionAlgorithm): string {
    const descriptions = {
      pixel: '像素级融合 - 基于像素的颜色和形状混合，适合复古风格',
      advanced: '高级解剖学融合 - 基于身体部位的智能分割和重组',
      genetic: '基因级融合 - 模拟真实遗传机制，包含突变和显隐性',
      hybrid: '混合融合 - 结合多种算法的优势，创造独特效果'
    };
    return descriptions[algorithm] || '未知算法';
  }

  /**
   * 批量融合比较
   */
  async compareAlgorithms(
    spriteUrlA: string,
    spriteUrlB: string,
    algorithms: FusionAlgorithm[] = ['pixel', 'advanced', 'genetic']
  ): Promise<Record<FusionAlgorithm, FusionResult>> {
    const results: Record<string, FusionResult> = {};

    const promises = algorithms.map(async (algorithm) => {
      try {
        const result = await this.fuse(spriteUrlA, spriteUrlB, { algorithm });
        results[algorithm] = result;
      } catch (error) {
        console.error(`算法 ${algorithm} 失败:`, error);
        results[algorithm] = {
          sprite: '',
          algorithm,
          metadata: { error: (error as Error).message }
        };
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * 智能推荐算法
   */
  async recommendAlgorithm(
    spriteUrlA: string,
    spriteUrlB: string
  ): Promise<{
    recommended: FusionAlgorithm;
    reasons: string[];
    preview: FusionResult;
  }> {
    const algorithms: FusionAlgorithm[] = ['pixel', 'advanced', 'genetic'];
    const results = await this.compareAlgorithms(spriteUrlA, spriteUrlB, algorithms);

    // 分析图像特征
    const [imgA, imgB] = await Promise.all([
      this.loadImage(spriteUrlA),
      this.loadImage(spriteUrlB)
    ]);

    const features = await this.analyzeImageFeatures(imgA, imgB);
    const reasons: string[] = [];

    let recommended: FusionAlgorithm = 'genetic';

    // 基于特征推荐算法
    if (features.bothSimpleSprites) {
      recommended = 'pixel';
      reasons.push('两个精灵都是简单的像素风格，像素融合效果最佳');
    } else if (features.highDetail) {
      recommended = 'advanced';
      reasons.push('精灵细节丰富，高级融合能更好地保留特征');
    } else if (features.diverseColors) {
      recommended = 'genetic';
      reasons.push('颜色差异较大，基因融合能创造更自然的过渡');
    } else {
      recommended = 'genetic';
      reasons.push('基因融合提供最佳的通用性和创造性');
    }

    return {
      recommended,
      reasons,
      preview: results[recommended]
    };
  }

  /**
   * 分析图像特征
   */
  private async analyzeImageFeatures(imgA: HTMLImageElement, imgB: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 64;
    canvas.height = 64;

    // 分析图像A
    ctx.drawImage(imgA, 0, 0, 64, 64);
    const dataA = ctx.getImageData(0, 0, 64, 64);
    
    // 分析图像B
    ctx.clearRect(0, 0, 64, 64);
    ctx.drawImage(imgB, 0, 0, 64, 64);
    const dataB = ctx.getImageData(0, 0, 64, 64);

    // 计算特征
    const features = {
      bothSimpleSprites: this.isSimpleSprite(dataA) && this.isSimpleSprite(dataB),
      highDetail: this.hasHighDetail(dataA) || this.hasHighDetail(dataB),
      diverseColors: this.hasDiverseColors(dataA) || this.hasDiverseColors(dataB),
      similarSize: Math.abs(imgA.width - imgB.width) < 50
    };

    return features;
  }

  /**
   * 检测是否为简单精灵
   */
  private isSimpleSprite(imageData: ImageData): boolean {
    const { data } = imageData;
    let colorCount = 0;
    const colors = new Set<string>();

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 128) {
        const key = `${data[i]},${data[i+1]},${data[i+2]}`;
        colors.add(key);
        if (colors.size > 16) return false;
      }
    }

    return colors.size <= 8;
  }

  /**
   * 检测高细节
   */
  private hasHighDetail(imageData: ImageData): boolean {
    const { data } = imageData;
    let edgeCount = 0;

    for (let y = 1; y < 63; y++) {
      for (let x = 1; x < 63; x++) {
        const index = (y * 64 + x) * 4;
        if (data[index + 3] > 128) {
          // 检查边缘
          const neighbors = [
            data[((y-1) * 64 + x) * 4 + 3],
            data[((y+1) * 64 + x) * 4 + 3],
            data[(y * 64 + (x-1)) * 4 + 3],
            data[(y * 64 + (x+1)) * 4 + 3]
          ];
          
          if (neighbors.some(a => a <= 128)) {
            edgeCount++;
          }
        }
      }
    }

    return edgeCount > 100;
  }

  /**
   * 检测颜色多样性
   */
  private hasDiverseColors(imageData: ImageData): boolean {
    const { data } = imageData;
    const colors = new Set<string>();

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 128) {
        const r = Math.floor(data[i] / 32) * 32;
        const g = Math.floor(data[i + 1] / 32) * 32;
        const b = Math.floor(data[i + 2] / 32) * 32;
        colors.add(`${r},${g},${b}`);
      }
    }

    return colors.size > 8;
  }
}

/**
 * 便捷函数：执行融合
 */
export async function createFusion(
  spriteUrlA: string,
  spriteUrlB: string,
  config?: Partial<FusionSelectorConfig>
) {
  const selector = new FusionAlgorithmSelector();
  return selector.fuse(spriteUrlA, spriteUrlB, config);
}

/**
 * 批量比较算法
 */
export async function compareFusionAlgorithms(
  spriteUrlA: string,
  spriteUrlB: string,
  algorithms?: FusionAlgorithm[]
) {
  const selector = new FusionAlgorithmSelector();
  return selector.compareAlgorithms(spriteUrlA, spriteUrlB, algorithms);
}

/**
 * 获取推荐算法
 */
export async function getRecommendedAlgorithm(
  spriteUrlA: string,
  spriteUrlB: string
) {
  const selector = new FusionAlgorithmSelector();
  return selector.recommendAlgorithm(spriteUrlA, spriteUrlB);
}
