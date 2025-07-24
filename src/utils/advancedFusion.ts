// 高级宝可梦融合算法 - 基于解剖学的智能融合
// 参考Pokemon Infinite Fusion和Japeal Fusion Generator的设计理念

interface FusionPart {
  type: 'head' | 'body' | 'arms' | 'legs' | 'tail' | 'wings' | 'ears' | 'other';
  source: 'parentA' | 'parentB';
  confidence: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ColorProfile {
  primary: string;
  secondary: string;
  accent: string;
  pattern: string;
}

export interface FusionConfig {
  headSource: 'parentA' | 'parentB' | 'blend';
  bodySource: 'parentA' | 'parentB' | 'blend';
  colorMode: 'dominant' | 'gradient' | 'pattern';
  sizeRatio: number; // 0.5-1.5
  detailLevel: 'minimal' | 'standard' | 'detailed';
  outlineStyle: 'none' | 'thin' | 'thick' | 'glow';
  shadow: boolean;
}

const defaultConfig: FusionConfig = {
  headSource: 'parentA',
  bodySource: 'parentB',
  colorMode: 'gradient',
  sizeRatio: 1.0,
  detailLevel: 'standard',
  outlineStyle: 'thin',
  shadow: true
};

/**
 * 高级宝可梦融合算法
 * 基于身体部位分割的智能融合
 */
export class AdvancedPokemonFusion {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private parentA: ImageData | null = null;
  private parentB: ImageData | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = 512;
    this.canvas.height = 512;
  }

  /**
   * 执行高级融合
   */
  async fuse(
    spriteUrlA: string,
    spriteUrlB: string,
    config: Partial<FusionConfig> = {}
  ): Promise<string> {
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      // 加载父代图像
      const [imgA, imgB] = await Promise.all([
        this.loadImage(spriteUrlA),
        this.loadImage(spriteUrlB)
      ]);

      // 预处理图像
      this.parentA = this.preprocessImage(imgA);
      this.parentB = this.preprocessImage(imgB);

      // 执行融合
      const fusedImage = this.performFusion(finalConfig);
      
      // 后处理
      const processedImage = this.postProcess(fusedImage, finalConfig);
      
      return processedImage;
    } catch (error) {
      console.error('高级融合失败:', error);
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
   * 预处理图像 - 标准化尺寸和透明度
   */
  private preprocessImage(img: HTMLImageElement): ImageData {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = 512;
    tempCanvas.height = 512;

    // 保持宽高比缩放
    const scale = Math.min(512 / img.width, 512 / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    const offsetX = (512 - scaledWidth) / 2;
    const offsetY = (512 - scaledHeight) / 2;

    tempCtx.clearRect(0, 0, 512, 512);
    tempCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    return tempCtx.getImageData(0, 0, 512, 512);
  }

  /**
   * 执行融合算法
   */
  private performFusion(config: FusionConfig): ImageData {
    const output = this.ctx.createImageData(512, 512);
    
    // 1. 身体部位检测和分割
    const partsA = this.detectBodyParts(this.parentA!);
    const partsB = this.detectBodyParts(this.parentB!);

    // 2. 智能部位选择
    const selectedParts = this.selectParts(partsA, partsB, config);

    // 3. 颜色分析和遗传
    const colorProfile = this.analyzeColors(this.parentA!, this.parentB!, config);

    // 4. 构建融合图像
    this.buildFusedImage(output, selectedParts, colorProfile, config);

    return output;
  }

  /**
   * 身体部位检测（简化版）
   */
  private detectBodyParts(imageData: ImageData): FusionPart[] {
    const parts: FusionPart[] = [];
    const { width, height, data } = imageData;

    // 基于像素密度和位置检测身体部位
    const centerX = width / 2;
    const centerY = height / 2;

    // 检测头部区域（上半部分）
    const headRegion = this.detectRegion(data, width, height, 0, 0, width, height * 0.4);
    if (headRegion.pixelCount > 100) {
      parts.push({
        type: 'head',
        source: 'parentA',
        confidence: headRegion.confidence,
        position: headRegion.center,
        size: headRegion.size
      });
    }

    // 检测身体区域（中间部分）
    const bodyRegion = this.detectRegion(data, width, height, 0, height * 0.3, width, height * 0.4);
    if (bodyRegion.pixelCount > 200) {
      parts.push({
        type: 'body',
        source: 'parentA',
        confidence: bodyRegion.confidence,
        position: bodyRegion.center,
        size: bodyRegion.size
      });
    }

    return parts;
  }

  /**
   * 区域检测辅助函数
   */
  private detectRegion(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    regionWidth: number,
    regionHeight: number
  ) {
    let pixelCount = 0;
    let totalX = 0;
    let totalY = 0;
    let minX = width, maxX = 0, minY = height, maxY = 0;

    for (let y = Math.floor(startY); y < Math.min(startY + regionHeight, height); y++) {
      for (let x = Math.floor(startX); x < Math.min(startX + regionWidth, width); x++) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > 128) {
          pixelCount++;
          totalX += x;
          totalY += y;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    const confidence = pixelCount > 0 ? Math.min(pixelCount / 1000, 1) : 0;
    const centerX = pixelCount > 0 ? totalX / pixelCount : startX + regionWidth / 2;
    const centerY = pixelCount > 0 ? totalY / pixelCount : startY + regionHeight / 2;

    return {
      pixelCount,
      confidence,
      center: { x: centerX, y: centerY },
      size: { width: maxX - minX, height: maxY - minY }
    };
  }

  /**
   * 智能部位选择
   */
  private selectParts(partsA: FusionPart[], partsB: FusionPart[], config: FusionConfig): FusionPart[] {
    const selected: FusionPart[] = [];

    // 根据配置选择头部
    if (config.headSource === 'parentA') {
      const headA = partsA.find(p => p.type === 'head');
      if (headA) selected.push(headA);
    } else if (config.headSource === 'parentB') {
      const headB = partsB.find(p => p.type === 'head');
      if (headB) selected.push(headB);
    } else {
      // 混合模式 - 选择置信度更高的
      const headA = partsA.find(p => p.type === 'head');
      const headB = partsB.find(p => p.type === 'head');
      const betterHead = (headA?.confidence || 0) > (headB?.confidence || 0) ? headA : headB;
      if (betterHead) selected.push(betterHead);
    }

    // 根据配置选择身体
    if (config.bodySource === 'parentA') {
      const bodyA = partsA.find(p => p.type === 'body');
      if (bodyA) selected.push(bodyA);
    } else if (config.bodySource === 'parentB') {
      const bodyB = partsB.find(p => p.type === 'body');
      if (bodyB) selected.push(bodyB);
    } else {
      // 混合模式
      const bodyA = partsA.find(p => p.type === 'body');
      const bodyB = partsB.find(p => p.type === 'body');
      const betterBody = (bodyA?.confidence || 0) > (bodyB?.confidence || 0) ? bodyA : bodyB;
      if (betterBody) selected.push(betterBody);
    }

    return selected;
  }

  /**
   * 颜色分析和遗传
   */
  private analyzeColors(parentA: ImageData, parentB: ImageData, config: FusionConfig): ColorProfile {
    const colorsA = this.extractDominantColors(parentA);
    const colorsB = this.extractDominantColors(parentB);

    switch (config.colorMode) {
      case 'dominant':
        return {
          primary: colorsA.primary,
          secondary: colorsB.secondary,
          accent: colorsA.accent,
          pattern: 'solid'
        };
      
      case 'gradient':
        return {
          primary: this.blendColors(colorsA.primary, colorsB.primary, 0.5),
          secondary: this.blendColors(colorsA.secondary, colorsB.secondary, 0.5),
          accent: this.blendColors(colorsA.accent, colorsB.accent, 0.5),
          pattern: 'gradient'
        };
      
      case 'pattern':
        return {
          primary: colorsA.primary,
          secondary: colorsB.primary,
          accent: this.blendColors(colorsA.accent, colorsB.accent, 0.7),
          pattern: 'striped'
        };
      
      default:
        return colorsA;
    }
  }

  /**
   * 提取主导颜色
   */
  private extractDominantColors(imageData: ImageData): ColorProfile {
    const { data } = imageData;
    const colorMap = new Map<string, number>();

    // 采样颜色
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a > 128) {
        const key = `${Math.floor(r/16)},${Math.floor(g/16)},${Math.floor(b/16)}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
    }

    // 排序并选择主导颜色
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (sortedColors.length === 0) {
      return {
        primary: '#888888',
        secondary: '#666666',
        accent: '#aaaaaa',
        pattern: 'solid'
      };
    }

    const [primary, secondary, accent] = sortedColors.map(([color]) => {
      const [r, g, b] = color.split(',').map(c => parseInt(c) * 16);
      return `rgb(${r},${g},${b})`;
    });

    return {
      primary: primary || '#888888',
      secondary: secondary || '#666666',
      accent: accent || '#aaaaaa',
      pattern: 'solid'
    };
  }

  /**
   * 颜色混合
   */
  private blendColors(color1: string, color2: string, ratio: number): string {
    // 简化的颜色混合
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    const r = Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio));
    const g = Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio));
    const b = Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio));
    
    return `rgb(${r},${g},${b})`;
  }

  /**
   * 解析颜色字符串
   */
  private parseColor(color: string): { r: number; g: number; b: number } {
    if (color.startsWith('rgb')) {
      const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      }
    }
    return { r: 128, g: 128, b: 128 };
  }

  /**
   * 构建融合图像
   */
  private buildFusedImage(
    output: ImageData,
    parts: FusionPart[],
    colorProfile: ColorProfile,
    config: FusionConfig
  ) {
    const { width, height, data } = output;
    
    // 清除背景
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }

    // 根据选择的部位构建图像
    parts.forEach(part => {
      const source = part.source === 'parentA' ? this.parentA! : this.parentB!;
      this.renderPart(output, source, part, colorProfile, config);
    });
  }

  /**
   * 渲染单个部位
   */
  private renderPart(
    output: ImageData,
    source: ImageData,
    part: FusionPart,
    colorProfile: ColorProfile,
    config: FusionConfig
  ) {
    const { width, height } = output;
    const { data: sourceData } = source;
    const { data: outputData } = output;

    // 简化的部位渲染
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = sourceData[index + 3];
        
        if (alpha > 128) {
          // 应用颜色配置文件
          const newColor = this.applyColorProfile(
            [sourceData[index], sourceData[index + 1], sourceData[index + 2]],
            colorProfile,
            x,
            y,
            width,
            height
          );
          
          outputData[index] = newColor[0];
          outputData[index + 1] = newColor[1];
          outputData[index + 2] = newColor[2];
          outputData[index + 3] = alpha;
        }
      }
    }
  }

  /**
   * 应用颜色配置文件
   */
  private applyColorProfile(
    originalColor: [number, number, number],
    colorProfile: ColorProfile,
    x: number,
    y: number,
    width: number,
    height: number
  ): [number, number, number] {
    // 简化的颜色应用
    const [r, g, b] = originalColor;
    const factor = 0.8; // 保留80%原始颜色
    
    return [
      Math.round(r * factor),
      Math.round(g * factor),
      Math.round(b * factor)
    ];
  }

  /**
   * 后处理
   */
  private postProcess(imageData: ImageData, config: FusionConfig): string {
    // 应用后处理效果
    this.ctx.putImageData(imageData, 0, 0);

    // 添加轮廓
    if (config.outlineStyle !== 'none') {
      this.addOutline(config.outlineStyle);
    }

    // 添加阴影
    if (config.shadow) {
      this.addShadow();
    }

    // 应用尺寸调整
    if (config.sizeRatio !== 1.0) {
      this.resize(config.sizeRatio);
    }

    return this.canvas.toDataURL();
  }

  /**
   * 添加轮廓
   */
  private addOutline(style: string) {
    const imageData = this.ctx.getImageData(0, 0, 512, 512);
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data);

    const outlineColor = style === 'glow' ? [0, 255, 255, 255] : [0, 0, 0, 255];
    const thickness = style === 'thick' ? 2 : 1;

    for (let y = thickness; y < height - thickness; y++) {
      for (let x = thickness; x < width - thickness; x++) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 128) {
          // 检查边缘
          let isEdge = false;
          
          for (let dy = -thickness; dy <= thickness && !isEdge; dy++) {
            for (let dx = -thickness; dx <= thickness && !isEdge; dx++) {
              if (dx === 0 && dy === 0) continue;
              
              const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
              const neighborAlpha = data[neighborIndex + 3];
              
              if (neighborAlpha <= 128) {
                isEdge = true;
                break;
              }
            }
          }

          if (isEdge) {
            newData[index] = outlineColor[0];
            newData[index + 1] = outlineColor[1];
            newData[index + 2] = outlineColor[2];
            newData[index + 3] = outlineColor[3];
          }
        }
      }
    }

    this.ctx.putImageData(new ImageData(newData, width, height), 0, 0);
  }

  /**
   * 添加阴影
   */
  private addShadow() {
    // 简化的阴影效果
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, 512, 512);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * 调整尺寸
   */
  private resize(ratio: number) {
    if (ratio === 1.0) return;

    const imageData = this.ctx.getImageData(0, 0, 512, 512);
    this.ctx.clearRect(0, 0, 512, 512);

    const newWidth = 512 * ratio;
    const newHeight = 512 * ratio;
    const offsetX = (512 - newWidth) / 2;
    const offsetY = (512 - newHeight) / 2;

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.putImageData(imageData, offsetX, offsetY, 0, 0, newWidth, newHeight);
  }
}

/**
 * 便捷函数：执行高级融合
 */
export async function createAdvancedFusion(
  spriteUrlA: string,
  spriteUrlB: string,
  config?: Partial<FusionConfig>
): Promise<string> {
  const fusion = new AdvancedPokemonFusion();
  return fusion.fuse(spriteUrlA, spriteUrlB, config);
}

/**
 * 生成随机融合配置
 */
export function generateRandomAdvancedConfig(): FusionConfig {
  return {
    headSource: ['parentA', 'parentB', 'blend'][Math.floor(Math.random() * 3)] as any,
    bodySource: ['parentA', 'parentB', 'blend'][Math.floor(Math.random() * 3)] as any,
    colorMode: ['dominant', 'gradient', 'pattern'][Math.floor(Math.random() * 3)] as any,
    sizeRatio: 0.8 + Math.random() * 0.4, // 0.8-1.2
    detailLevel: ['minimal', 'standard', 'detailed'][Math.floor(Math.random() * 3)] as any,
    outlineStyle: ['none', 'thin', 'thick', 'glow'][Math.floor(Math.random() * 4)] as any,
    shadow: Math.random() > 0.3
  };
}
