// 基因级宝可梦融合算法 - 基于遗传学的智能杂交
// 模拟真实生物遗传机制，包含显隐性基因、突变等特性

interface Gene {
  type: 'color' | 'shape' | 'pattern' | 'size' | 'feature';
  value: any;
  dominance: number; // 0-1，显性程度
  mutationRate: number; // 突变概率
}

interface GeneticProfile {
  primaryColor: Gene;
  secondaryColor: Gene;
  bodyShape: Gene;
  headShape: Gene;
  pattern: Gene;
  size: Gene;
  specialFeatures: Gene[];
}

interface FusionGene {
  parentA: Gene;
  parentB: Gene;
  inherited: Gene;
  mutation?: Gene;
}

export interface GeneticConfig {
  mutationRate: number; // 全局突变率
  dominanceBias: 'random' | 'parentA' | 'parentB';
  featureMixing: 'blend' | 'select' | 'hybrid';
  colorInheritance: 'dominant' | 'blend' | 'gradient';
  sizeCalculation: 'average' | 'dominant' | 'random';
}

const defaultGeneticConfig: GeneticConfig = {
  mutationRate: 0.05,
  dominanceBias: 'random',
  featureMixing: 'hybrid',
  colorInheritance: 'blend',
  sizeCalculation: 'average'
};

/**
 * 基因级融合算法
 * 模拟孟德尔遗传定律和现代遗传学
 */
export class GeneticPokemonFusion {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private geneticProfileA: GeneticProfile | null = null;
  private geneticProfileB: GeneticProfile | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = 512;
    this.canvas.height = 512;
  }

  /**
   * 执行基因级融合
   */
  async fuseGenetically(
    spriteUrlA: string,
    spriteUrlB: string,
    config: Partial<GeneticConfig> = {}
  ): Promise<{
    sprite: string;
    geneticCode: string;
    traits: Record<string, any>;
  }> {
    const finalConfig = { ...defaultGeneticConfig, ...config };
    
    try {
      // 加载并分析父代
      const [imgA, imgB] = await Promise.all([
        this.loadImage(spriteUrlA),
        this.loadImage(spriteUrlB)
      ]);

      // 提取基因特征
      this.geneticProfileA = await this.extractGeneticProfile(imgA);
      this.geneticProfileB = await this.extractGeneticProfile(imgB);

      // 执行基因杂交
      const offspringGenes = this.performGeneticCrossover(
        this.geneticProfileA,
        this.geneticProfileB,
        finalConfig
      );

      // 生成融合精灵
      const fusedSprite = await this.renderGeneticFusion(offspringGenes);

      // 生成遗传代码
      const geneticCode = this.generateGeneticCode(offspringGenes);

      // 提取特征
      const traits = this.extractTraits(offspringGenes);

      return {
        sprite: fusedSprite,
        geneticCode,
        traits
      };
    } catch (error) {
      console.error('基因融合失败:', error);
      throw error;
    }
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
   * 提取基因特征
   */
  private async extractGeneticProfile(img: HTMLImageElement): Promise<GeneticProfile> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 128;
    canvas.height = 128;

    // 缩放图像
    ctx.drawImage(img, 0, 0, 128, 128);
    const imageData = ctx.getImageData(0, 0, 128, 128);

    // 提取颜色基因
    const colors = this.analyzeColorGenes(imageData);
    
    // 提取形状基因
    const shapes = this.analyzeShapeGenes(imageData);
    
    // 提取特征基因
    const features = this.analyzeFeatureGenes(imageData);

    return {
      primaryColor: {
        type: 'color',
        value: colors.primary,
        dominance: Math.random() * 0.5 + 0.5,
        mutationRate: 0.02
      },
      secondaryColor: {
        type: 'color',
        value: colors.secondary,
        dominance: Math.random() * 0.5 + 0.5,
        mutationRate: 0.02
      },
      bodyShape: {
        type: 'shape',
        value: shapes.body,
        dominance: Math.random() * 0.5 + 0.5,
        mutationRate: 0.03
      },
      headShape: {
        type: 'shape',
        value: shapes.head,
        dominance: Math.random() * 0.5 + 0.5,
        mutationRate: 0.03
      },
      pattern: {
        type: 'pattern',
        value: features.pattern,
        dominance: Math.random() * 0.5 + 0.5,
        mutationRate: 0.01
      },
      size: {
        type: 'size',
        value: features.size,
        dominance: Math.random() * 0.5 + 0.5,
        mutationRate: 0.01
      },
      specialFeatures: features.special.map(f => ({
        type: 'feature',
        value: f,
        dominance: Math.random() * 0.5 + 0.5,
        mutationRate: 0.04
      }))
    };
  }

  /**
   * 分析颜色基因
   */
  private analyzeColorGenes(imageData: ImageData) {
    const { data } = imageData;
    const colorCounts = new Map<string, number>();

    // 统计颜色分布
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.floor(data[i] / 32) * 32;
      const g = Math.floor(data[i + 1] / 32) * 32;
      const b = Math.floor(data[i + 2] / 32) * 32;
      const a = data[i + 3];

      if (a > 128) {
        const key = `${r},${g},${b}`;
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
      }
    }

    // 获取主导颜色
    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      primary: sortedColors[0] ? `rgb(${sortedColors[0][0]})` : '#888888',
      secondary: sortedColors[1] ? `rgb(${sortedColors[1][0]})` : '#666666'
    };
  }

  /**
   * 分析形状基因
   */
  private analyzeShapeGenes(imageData: ImageData) {
    const { data, width, height } = imageData;
    
    // 计算边界框
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (data[index + 3] > 128) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          pixelCount++;
        }
      }
    }

    const aspectRatio = (maxX - minX) / (maxY - minY);
    const density = pixelCount / (width * height);

    return {
      body: {
        width: maxX - minX,
        height: maxY - minY,
        aspectRatio,
        density
      },
      head: {
        // 简化的头部检测
        top: minY,
        center: (minX + maxX) / 2
      }
    };
  }

  /**
   * 分析特征基因
   */
  private analyzeFeatureGenes(imageData: ImageData) {
    const { data, width, height } = imageData;
    
    // 检测特殊特征
    const features = [];
    
    // 检测是否有尖刺/角
    let spikeCount = 0;
    for (let y = 0; y < height / 3; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (data[index + 3] > 128 && this.isSpikePixel(data, x, y, width, height)) {
          spikeCount++;
        }
      }
    }
    
    if (spikeCount > 5) {
      features.push('spikes');
    }

    // 检测是否有翅膀
    let wingPixels = 0;
    for (let y = height / 3; y < height * 2/3; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (data[index + 3] > 128 && x < width/4 || x > width*3/4) {
          wingPixels++;
        }
      }
    }
    
    if (wingPixels > 20) {
      features.push('wings');
    }

    return {
      pattern: Math.random() > 0.5 ? 'stripes' : 'solid',
      size: Math.random() * 0.5 + 0.75, // 0.75-1.25
      special: features
    };
  }

  /**
   * 检测尖刺像素
   */
  private isSpikePixel(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): boolean {
    // 简化的尖刺检测
    const index = (y * width + x) * 4;
    if (data[index + 3] <= 128) return false;

    // 检查周围像素
    let transparentNeighbors = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          const neighborIndex = (ny * width + nx) * 4;
          if (data[neighborIndex + 3] <= 128) {
            transparentNeighbors++;
          }
        }
      }
    }

    return transparentNeighbors >= 3;
  }

  /**
   * 执行基因杂交
   */
  private performGeneticCrossover(
    profileA: GeneticProfile,
    profileB: GeneticProfile,
    config: GeneticConfig
  ): Record<string, Gene> {
    const offspring: Record<string, Gene> = {};

    // 杂交每个基因
    offspring.primaryColor = this.crossGene(profileA.primaryColor, profileB.primaryColor, config);
    offspring.secondaryColor = this.crossGene(profileA.secondaryColor, profileB.secondaryColor, config);
    offspring.bodyShape = this.crossGene(profileA.bodyShape, profileB.bodyShape, config);
    offspring.headShape = this.crossGene(profileA.headShape, profileB.headShape, config);
    offspring.pattern = this.crossGene(profileA.pattern, profileB.pattern, config);
    offspring.size = this.crossGene(profileA.size, profileB.size, config);

    // 处理特殊特征
    const allFeatures = [...profileA.specialFeatures, ...profileB.specialFeatures];
    const selectedFeatures = this.selectSpecialFeatures(allFeatures, config);
    
    selectedFeatures.forEach((feature, index) => {
      offspring[`special_${index}`] = feature;
    });

    return offspring;
  }

  /**
   * 单个基因杂交
   */
  private crossGene(geneA: Gene, geneB: Gene, config: GeneticConfig): Gene {
    // 确定显性基因
    let dominantGene: Gene;
    let recessiveGene: Gene;

    const dominanceA = geneA.dominance + (Math.random() - 0.5) * 0.2;
    const dominanceB = geneB.dominance + (Math.random() - 0.5) * 0.2;

    if (dominanceA > dominanceB) {
      dominantGene = geneA;
      recessiveGene = geneB;
    } else {
      dominantGene = geneB;
      recessiveGene = geneA;
    }

    // 应用显性偏好
    if (config.dominanceBias === 'parentA') {
      dominantGene = geneA;
      recessiveGene = geneB;
    } else if (config.dominanceBias === 'parentB') {
      dominantGene = geneB;
      recessiveGene = geneA;
    }

    // 计算遗传结果
    let inheritedValue = dominantGene.value;
    
    // 混合模式
    if (config.colorInheritance === 'blend' && geneA.type === 'color') {
      inheritedValue = this.blendColors(geneA.value, geneB.value, 0.5);
    } else if (config.sizeCalculation === 'average' && geneA.type === 'size') {
      inheritedValue = (geneA.value + geneB.value) / 2;
    }

    // 检查突变
    const mutationRate = Math.max(geneA.mutationRate, geneB.mutationRate, config.mutationRate);
    if (Math.random() < mutationRate) {
      inheritedValue = this.applyMutation(inheritedValue, geneA.type);
    }

    return {
      type: geneA.type,
      value: inheritedValue,
      dominance: (geneA.dominance + geneB.dominance) / 2,
      mutationRate: Math.min(mutationRate * 1.5, 0.5)
    };
  }

  /**
   * 选择特殊特征
   */
  private selectSpecialFeatures(features: Gene[], config: GeneticConfig): Gene[] {
    const selected: Gene[] = [];
    
    // 根据配置选择特征
    if (config.featureMixing === 'select') {
      // 选择显性特征
      const sorted = features.sort((a, b) => b.dominance - a.dominance);
      selected.push(...sorted.slice(0, Math.min(3, sorted.length)));
    } else if (config.featureMixing === 'blend') {
      // 混合特征
      selected.push(...features.slice(0, Math.min(2, features.length)));
    } else {
      // 混合模式 - 创建新特征
      selected.push(...features.slice(0, Math.min(3, features.length)));
    }

    return selected;
  }

  /**
   * 应用突变
   */
  private applyMutation(value: any, type: string): any {
    switch (type) {
      case 'color':
        return this.mutateColor(value);
      case 'size':
        return value * (0.8 + Math.random() * 0.4); // 80%-120%
      case 'pattern':
        const patterns = ['stripes', 'spots', 'gradient', 'solid', 'checkered'];
        return patterns[Math.floor(Math.random() * patterns.length)];
      default:
        return value;
    }
  }

  /**
   * 颜色突变
   */
  private mutateColor(color: string): string {
    const rgb = this.parseColor(color);
    const mutation = 30;
    
    const r = Math.max(0, Math.min(255, rgb.r + (Math.random() - 0.5) * mutation));
    const g = Math.max(0, Math.min(255, rgb.g + (Math.random() - 0.5) * mutation));
    const b = Math.max(0, Math.min(255, rgb.b + (Math.random() - 0.5) * mutation));
    
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }

  /**
   * 解析颜色
   */
  private parseColor(color: string): { r: number; g: number; b: number } {
    const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return { r: 128, g: 128, b: 128 };
  }

  /**
   * 混合颜色
   */
  private blendColors(color1: string, color2: string, ratio: number): string {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    const r = Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio));
    const g = Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio));
    const b = Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio));
    
    return `rgb(${r},${g},${b})`;
  }

  /**
   * 渲染基因融合结果
   */
  private async renderGeneticFusion(genes: Record<string, Gene>): Promise<string> {
    this.ctx.clearRect(0, 0, 512, 512);

    // 基于基因渲染融合精灵
    const size = genes.size?.value || 1.0;
    const primaryColor = genes.primaryColor?.value || '#888888';
    const secondaryColor = genes.secondaryColor?.value || '#666666';
    const pattern = genes.pattern?.value || 'solid';

    // 绘制基础形状
    this.drawBaseShape(size, primaryColor, secondaryColor, pattern);

    // 添加特殊特征
    Object.keys(genes).forEach(key => {
      if (key.startsWith('special_')) {
        this.drawSpecialFeature(genes[key].value, size);
      }
    });

    return this.canvas.toDataURL();
  }

  /**
   * 绘制基础形状
   */
  private drawBaseShape(size: number, primaryColor: string, secondaryColor: string, pattern: string) {
    const centerX = 256;
    const centerY = 256;
    const baseSize = 100 * size;

    // 绘制身体
    this.ctx.fillStyle = primaryColor;
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY + 20, baseSize * 0.8, baseSize * 1.2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制头部
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY - 40, baseSize * 0.6, baseSize * 0.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 应用图案
    if (pattern === 'stripes') {
      this.ctx.strokeStyle = secondaryColor;
      this.ctx.lineWidth = 3;
      for (let i = -baseSize; i < baseSize; i += 15) {
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + i, centerY - baseSize);
        this.ctx.lineTo(centerX + i + 10, centerY + baseSize);
        this.ctx.stroke();
      }
    } else if (pattern === 'spots') {
      this.ctx.fillStyle = secondaryColor;
      for (let i = 0; i < 5; i++) {
        const x = centerX + (Math.random() - 0.5) * baseSize * 1.5;
        const y = centerY + (Math.random() - 0.5) * baseSize * 1.5;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5 + Math.random() * 10, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * 绘制特殊特征
   */
  private drawSpecialFeature(feature: string, size: number) {
    const centerX = 256;
    const centerY = 256;
    const baseSize = 100 * size;

    this.ctx.fillStyle = '#ff4444';

    switch (feature) {
      case 'spikes':
        // 绘制尖刺
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * baseSize * 0.8;
          const y = centerY - 60 + Math.sin(angle) * baseSize * 0.3;
          
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x - 10, y - 20);
          this.ctx.lineTo(x + 10, y - 20);
          this.ctx.closePath();
          this.ctx.fill();
        }
        break;
      
      case 'wings':
        // 绘制翅膀
        this.ctx.fillStyle = '#88aaff';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - baseSize * 0.8, centerY, baseSize * 0.4, baseSize * 0.6, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + baseSize * 0.8, centerY, baseSize * 0.4, baseSize * 0.6, 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        break;
    }
  }

  /**
   * 生成遗传代码
   */
  private generateGeneticCode(genes: Record<string, Gene>): string {
    let code = '';
    
    Object.keys(genes).forEach(key => {
      const gene = genes[key];
      const valueHash = this.hashValue(gene.value);
      code += `${key}:${valueHash}:${gene.dominance.toFixed(2)}|`;
    });
    
    return btoa(code).substring(0, 32);
  }

  /**
   * 哈希值
   */
  private hashValue(value: any): string {
    return String(value).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString(16);
  }

  /**
   * 提取特征
   */
  private extractTraits(genes: Record<string, Gene>): Record<string, any> {
    const traits: Record<string, any> = {};
    
    Object.keys(genes).forEach(key => {
      traits[key] = genes[key].value;
    });
    
    return traits;
  }
}

/**
 * 便捷函数：执行基因融合
 */
export async function createGeneticFusion(
  spriteUrlA: string,
  spriteUrlB: string,
  config?: Partial<GeneticConfig>
) {
  const fusion = new GeneticPokemonFusion();
  return fusion.fuseGenetically(spriteUrlA, spriteUrlB, config);
}

/**
 * 生成随机基因配置
 */
export function generateRandomGeneticConfig(): GeneticConfig {
  return {
    mutationRate: Math.random() * 0.1,
    dominanceBias: ['random', 'parentA', 'parentB'][Math.floor(Math.random() * 3)] as any,
    featureMixing: ['blend', 'select', 'hybrid'][Math.floor(Math.random() * 3)] as any,
    colorInheritance: ['dominant', 'blend', 'gradient'][Math.floor(Math.random() * 3)] as any,
    sizeCalculation: ['average', 'dominant', 'random'][Math.floor(Math.random() * 3)] as any
  };
}
