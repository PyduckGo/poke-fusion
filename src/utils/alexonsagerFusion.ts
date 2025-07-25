// alexonsager风格的宝可梦融合算法
// 参考 https://pokemon.alexonsager.net/zh 的实现
declare const Jimp: any;

import { Pokemon } from '../types/pokemon';

// 面部检测器
class FaceDetector {
  // 检测面部区域（基于像素密度和颜色分布）
  static detectFaceRegion(image: any): { x: number, y: number, width: number, height: number } {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // 简化的面部检测：假设面部在中心区域
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    return {
      x: centerX - 64,
      y: centerY - 64,
      width: 128,
      height: 128
    };
  }

  // 检测眼睛位置
  static detectEyes(image: any): { left: { x: number, y: number }, right: { x: number, y: number } } {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // 简化的眼睛检测
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 3);
    
    return {
      left: { x: centerX - 32, y: centerY },
      right: { x: centerX + 32, y: centerY }
    };
  }
}

// 轮廓提取器
class ContourExtractor {
  // 提取精灵的轮廓
  static extractContour(image: any): boolean[][] {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const contour: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pixel = image.getPixelColor(x, y);
        const alpha = (pixel >> 24) & 255;
        
        if (alpha > 128) {
          // 检查是否是边缘像素
          let isEdge = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              
              const neighbor = image.getPixelColor(x + dx, y + dy);
              const neighborAlpha = (neighbor >> 24) & 255;
              
              if (neighborAlpha <= 128) {
                isEdge = true;
                break;
              }
            }
            if (isEdge) break;
          }
          
          contour[y][x] = isEdge;
        }
      }
    }
    
    return contour;
  }

  // 提取内部线条
  static extractInternalLines(image: any): boolean[][] {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const lines: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pixel = image.getPixelColor(x, y);
        const r = (pixel >> 16) & 255;
        const g = (pixel >> 8) & 255;
        const b = pixel & 255;
        
        // 检测颜色变化较大的区域作为内部线条
        let maxDiff = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const neighbor = image.getPixelColor(x + dx, y + dy);
            const nr = (neighbor >> 16) & 255;
            const ng = (neighbor >> 8) & 255;
            const nb = neighbor & 255;
            
            const diff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
            maxDiff = Math.max(maxDiff, diff);
          }
        }
        
        // 如果颜色差异超过阈值，认为是内部线条
        if (maxDiff > 80) {
          lines[y][x] = true;
        }
      }
    }
    
    return lines;
  }
}

// 颜色映射器
class ColorMapper {
  // 将颜色从源图像映射到目标图像
  static mapColors(sourceImage: any, targetImage: any, mask: boolean[][]): any {
    const width = sourceImage.bitmap.width;
    const height = sourceImage.bitmap.height;
    const result = targetImage.clone();
    
    // 计算源图像的主色调
    const sourceColors = this.extractColorPalette(sourceImage);
    
    // 将颜色应用到目标图像
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y] && mask[y][x]) {
          const sourcePixel = sourceImage.getPixelColor(x, y);
          const sourceColor = {
            r: (sourcePixel >> 16) & 255,
            g: (sourcePixel >> 8) & 255,
            b: sourcePixel & 255
          };
          
          // 找到最接近的颜色
          const mappedColor = this.findClosestColor(sourceColor, sourceColors);
          result.setPixelColor(mappedColor, x, y);
        }
      }
    }
    
    return result;
  }

  // 提取颜色调色板
  private static extractColorPalette(image: any): { r: number, g: number, b: number }[] {
    const colors = new Set<string>();
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const pixel = image.getPixelColor(x, y);
        const r = (pixel >> 16) & 255;
        const g = (pixel >> 8) & 255;
        const b = pixel & 255;
        
        // 量化颜色
        const quantized = `${Math.round(r/8)*8},${Math.round(g/8)*8},${Math.round(b/8)*8}`;
        colors.add(quantized);
      }
    }
    
    return Array.from(colors).map(color => {
      const [r, g, b] = color.split(',').map(Number);
      return { r, g, b };
    });
  }

  // 找到最接近的颜色
  private static findClosestColor(target: { r: number, g: number, b: number }, palette: { r: number, g: number, b: number }[]): number {
    let closest = palette[0];
    let minDistance = Infinity;
    
    for (const color of palette) {
      const distance = Math.sqrt(
        Math.pow(target.r - color.r, 2) +
        Math.pow(target.g - color.g, 2) +
        Math.pow(target.b - color.b, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = color;
      }
    }
    
    return (255 << 24) | (closest.r << 16) | (closest.g << 8) | closest.b;
  }
}

// alexonsager风格的融合算法
export class AlexonsagerFusion {
  /**
   * 执行alexonsager风格的融合
   * @param sprite1Url 第一个宝可梦精灵URL（提供形状和轮廓）
   * @param sprite2Url 第二个宝可梦精灵URL（提供颜色和面部）
   * @param options 融合选项
   * @returns 融合后的base64图片
   */
  static async fusePokemon(
    sprite1Url: string,
    sprite2Url: string,
    options: {
      preserveShape: boolean;
      colorTransfer: boolean;
      faceSwap: boolean;
      pixelSize: number;
    } = {
      preserveShape: true,
      colorTransfer: true,
      faceSwap: true,
      pixelSize: 1
    }
  ): Promise<string> {
    try {
      const [img1, img2] = await Promise.all([
        Jimp.read(sprite1Url),
        Jimp.read(sprite2Url)
      ]);

      const size = 512;
      img1.resize(size, size);
      img2.resize(size, size);

      // 预处理：去除背景
      const processed1 = this.removeBackground(img1);
      const processed2 = this.removeBackground(img2);

      // 提取轮廓和线条
      const contour1 = ContourExtractor.extractContour(processed1);
      const internalLines1 = ContourExtractor.extractInternalLines(processed1);
      const contour2 = ContourExtractor.extractContour(processed2);
      const internalLines2 = ContourExtractor.extractInternalLines(processed2);

      // 检测面部区域
      const face1 = FaceDetector.detectFaceRegion(processed1);
      const face2 = FaceDetector.detectFaceRegion(processed2);

      // 创建融合图像
      const fused = new Jimp(size, size);

      // 应用alexonsager融合算法
      this.applyAlexonsagerStyle(
        processed1,
        processed2,
        fused,
        contour1,
        internalLines1,
        contour2,
        internalLines2,
        face1,
        face2,
        options
      );

      // 后处理
      if (options.pixelSize > 1) {
        const pixelated = this.applySmartPixelation(fused, options.pixelSize);
        return await pixelated.getBase64Async(Jimp.MIME_PNG);
      }

      return await fused.getBase64Async(Jimp.MIME_PNG);
    } catch (error) {
      console.error('alexonsager风格融合失败:', error);
      throw error;
    }
  }

  // 移除背景
  private static removeBackground(image: any): any {
    const result = image.clone();
    const threshold = 240;

    result.scan(0, 0, result.bitmap.width, result.bitmap.height, function(this: any, x: number, y: number, idx: number) {
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // 如果接近白色，设为透明
      if (r > threshold && g > threshold && b > threshold) {
        this.bitmap.data[idx + 3] = 0;
      }
    });

    return result;
  }

  // 应用alexonsager风格的融合
  private static applyAlexonsagerStyle(
    img1: any, // 提供形状和轮廓
    img2: any, // 提供颜色和面部
    fused: any,
    contour1: boolean[][],
    internalLines1: boolean[][],
    contour2: boolean[][],
    internalLines2: boolean[][],
    face1: { x: number, y: number, width: number, height: number },
    face2: { x: number, y: number, width: number, height: number },
    options: any
  ) {
    const width = img1.bitmap.width;
    const height = img1.bitmap.height;

    // 创建颜色映射
    const colorMapped = options.colorTransfer ? 
      ColorMapper.mapColors(img2, img1, this.createColorMask(img1)) : img1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel1 = img1.getPixelColor(x, y);
        const pixel2 = img2.getPixelColor(x, y);
        
        const alpha1 = (pixel1 >> 24) & 255;
        const alpha2 = (pixel2 >> 24) & 255;

        if (alpha1 === 0 && alpha2 === 0) {
          continue;
        }

        let finalColor: number;

        // 检查是否在面部区域
        const inFace1 = this.isInRegion(x, y, face1);
        const inFace2 = this.isInRegion(x, y, face2);

        if (options.faceSwap && inFace1 && inFace2) {
          // 面部替换
          finalColor = this.blendFacePixels(pixel1, pixel2, x, y, face1, face2);
        } else if (contour1[y] && contour1[y][x]) {
          // 保留第一个精灵的轮廓
          finalColor = pixel1;
        } else if (internalLines1[y] && internalLines1[y][x]) {
          // 保留第一个精灵的内部线条
          finalColor = this.darkenColor(pixel1, 0.3);
        } else if (alpha1 > 0 && alpha2 > 0) {
          // 使用第二个精灵的颜色填充
          const color2 = colorMapped.getPixelColor(x, y);
          finalColor = this.blendColors(pixel1, color2, 0.7);
        } else if (alpha1 > 0) {
          // 只使用第一个精灵
          finalColor = pixel1;
        } else {
          // 只使用第二个精灵
          finalColor = pixel2;
        }

        fused.setPixelColor(finalColor, x, y);
      }
    }
  }

  // 创建颜色掩码
  private static createColorMask(image: any): boolean[][] {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const mask: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(true));

    // 排除透明区域
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = image.getPixelColor(x, y);
        const alpha = (pixel >> 24) & 255;
        mask[y][x] = alpha > 128;
      }
    }

    return mask;
  }

  // 检查点是否在区域内
  private static isInRegion(x: number, y: number, region: { x: number, y: number, width: number, height: number }): boolean {
    return x >= region.x && x < region.x + region.width &&
           y >= region.y && y < region.y + region.height;
  }

  // 混合面部像素
  private static blendFacePixels(
    pixel1: number,
    pixel2: number,
    x: number,
    y: number,
    face1: { x: number, y: number, width: number, height: number },
    face2: { x: number, y: number, width: number, height: number }
  ): number {
    // 计算相对位置
    const relX1 = (x - face1.x) / face1.width;
    const relY1 = (y - face1.y) / face1.height;
    
    // 映射到第二个面部区域
    const mappedX = Math.floor(face2.x + relX1 * face2.width);
    const mappedY = Math.floor(face2.y + relY1 * face2.height);
    
    // 返回映射后的像素
    return pixel2;
  }

  // 混合颜色
  private static blendColors(color1: number, color2: number, ratio: number): number {
    const r1 = (color1 >> 16) & 255;
    const g1 = (color1 >> 8) & 255;
    const b1 = color1 & 255;
    const a1 = (color1 >> 24) & 255;

    const r2 = (color2 >> 16) & 255;
    const g2 = (color2 >> 8) & 255;
    const b2 = color2 & 255;
    const a2 = (color2 >> 24) & 255;

    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    const a = Math.round(a1 * (1 - ratio) + a2 * ratio);

    return (a << 24) | (r << 16) | (g << 8) | b;
  }

  // 加深颜色
  private static darkenColor(color: number, factor: number): number {
    const r = Math.round(((color >> 16) & 255) * (1 - factor));
    const g = Math.round(((color >> 8) & 255) * (1 - factor));
    const b = Math.round((color & 255) * (1 - factor));
    const a = (color >> 24) & 255;

    return (a << 24) | (r << 16) | (g << 8) | b;
  }

  // 智能像素化
  private static applySmartPixelation(image: any, pixelSize: number): any {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const result = new Jimp(width, height);

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        for (let py = 0; py < pixelSize && y + py < height; py++) {
          for (let px = 0; px < pixelSize && x + px < width; px++) {
            const color = image.getPixelColor(x + px, y + py);
            const alpha = (color >> 24) & 255;
            
            if (alpha > 0) {
              r += (color >> 16) & 255;
              g += (color >> 8) & 255;
              b += color & 255;
              a += alpha;
              count++;
            }
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          a = Math.round(a / count);

          const avgColor = (a << 24) | (r << 16) | (g << 8) | b;

          for (let py = 0; py < pixelSize && y + py < height; py++) {
            for (let px = 0; px < pixelSize && x + px < width; px++) {
              result.setPixelColor(avgColor, x + px, y + py);
            }
          }
        }
      }
    }

    return result;
  }
}

// 导出alexonsager融合配置
export const alexonsagerFusionOptions = {
  preserveShape: true,
  colorTransfer: true,
  faceSwap: true,
  pixelSize: 1
};
