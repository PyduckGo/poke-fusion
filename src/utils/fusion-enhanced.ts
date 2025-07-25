// 增强版宝可梦融合算法，参考 alexonsager 的实现
declare const Jimp: any;

import { Pokemon } from '../types/pokemon';

// 颜色空间转换工具
class ColorUtils {
  // RGB转HSL
  static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return [h * 360, s * 100, l * 100];
  }

  // HSL转RGB
  static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // 颜色混合
  static blendColors(color1: number, color2: number, ratio: number): number {
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
}

// 特征检测器
class FeatureDetector {
  // 检测边缘
  static detectEdges(image: any, threshold: number = 50): boolean[][] {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const edges: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pixel = image.getPixelColor(x, y);
        const r = (pixel >> 16) & 255;
        const g = (pixel >> 8) & 255;
        const b = pixel & 255;

        // 计算梯度
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

        edges[y][x] = maxDiff > threshold;
      }
    }

    return edges;
  }

  // 检测主要颜色区域
  static detectColorRegions(image: any): Map<string, {x: number, y: number, count: number}[]> {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const regions = new Map<string, {x: number, y: number, count: number}[]>();

    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const pixel = image.getPixelColor(x, y);
        const r = (pixel >> 16) & 255;
        const g = (pixel >> 8) & 255;
        const b = pixel & 255;

        // 量化颜色
        const quantized = `${Math.round(r/16)*16},${Math.round(g/16)*16},${Math.round(b/16)*16}`;
        
        if (!regions.has(quantized)) {
          regions.set(quantized, []);
        }
        regions.get(quantized)!.push({x, y, count: 1});
      }
    }

    return regions;
  }
}

// 增强版融合算法
export class EnhancedFusion {
  // 主融合函数
  static async fusePokemon(
    sprite1Url: string,
    sprite2Url: string,
    options: {
      preserveShape: boolean;
      colorTransfer: boolean;
      edgeSmoothing: boolean;
      pixelSize: number;
    } = {
      preserveShape: true,
      colorTransfer: true,
      edgeSmoothing: true,
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

      // 检测特征
      const edges1 = FeatureDetector.detectEdges(processed1);
      const edges2 = FeatureDetector.detectEdges(processed2);

      // 颜色分析
      const colorRegions1 = FeatureDetector.detectColorRegions(processed1);
      const colorRegions2 = FeatureDetector.detectColorRegions(processed2);

      // 创建融合图像
      const fused = new Jimp(size, size);

      // 应用alexonsager风格的融合算法
      this.applyAlexonsagerFusion(
        processed1,
        processed2,
        fused,
        edges1,
        edges2,
        colorRegions1,
        colorRegions2,
        options
      );

      // 后处理
      if (options.edgeSmoothing) {
        this.applyEdgeSmoothing(fused, edges1);
      }

      if (options.pixelSize > 1) {
        const pixelated = this.applySmartPixelation(fused, options.pixelSize);
        return await pixelated.getBase64Async(Jimp.MIME_PNG);
      }

      return await fused.getBase64Async(Jimp.MIME_PNG);
    } catch (error) {
      console.error('增强版融合失败:', error);
      throw error;
    }
  }

  // 移除背景
  public static removeBackground(image: any): any {
    const result = image.clone();
    const threshold = 240; // 背景颜色阈值

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
  private static applyAlexonsagerFusion(
    img1: any,
    img2: any,
    fused: any,
    edges1: boolean[][],
    edges2: boolean[][],
    colorRegions1: Map<string, any>,
    colorRegions2: Map<string, any>,
    options: any
  ) {
    const width = img1.bitmap.width;
    const height = img1.bitmap.height;

    // 计算主色调
    const dominantColor1 = this.getDominantColor(colorRegions1);
    const dominantColor2 = this.getDominantColor(colorRegions2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel1 = img1.getPixelColor(x, y);
        const pixel2 = img2.getPixelColor(x, y);
        
        const alpha1 = (pixel1 >> 24) & 255;
        const alpha2 = (pixel2 >> 24) & 255;

        if (alpha1 === 0 && alpha2 === 0) {
          // 都是透明像素
          continue;
        }

        let finalColor: number;

        if (alpha1 > 0 && alpha2 > 0) {
          // 两个像素都有内容
          const isEdge1 = edges1[y] && edges1[y][x];
          const isEdge2 = edges2[y] && edges2[y][x];

          if (isEdge1 && !isEdge2) {
            // 保留img1的边缘，使用img2的颜色
            finalColor = ColorUtils.blendColors(pixel2, dominantColor2, 0.8);
          } else if (!isEdge1 && isEdge2) {
            // 保留img2的边缘，使用img1的形状
            finalColor = ColorUtils.blendColors(pixel1, dominantColor1, 0.8);
          } else {
            // 混合颜色
            const blendRatio = 0.6; // img2占60%
            finalColor = ColorUtils.blendColors(pixel1, pixel2, blendRatio);
          }
        } else if (alpha1 > 0) {
          // 只有img1有内容
          finalColor = options.colorTransfer ? 
            ColorUtils.blendColors(pixel1, dominantColor2, 0.3) : pixel1;
        } else {
          // 只有img2有内容
          finalColor = options.preserveShape ? 0 : pixel2;
        }

        fused.setPixelColor(finalColor, x, y);
      }
    }
  }

  // 获取主色调
  private static getDominantColor(colorRegions: Map<string, any>): number {
    let maxCount = 0;
    let dominantColor = '128,128,128'; // 默认灰色

    for (const [color, pixels] of colorRegions) {
      const totalCount = pixels.reduce((sum: number, p: any) => sum + p.count, 0);
      if (totalCount > maxCount) {
        maxCount = totalCount;
        dominantColor = color;
      }
    }

    const [r, g, b] = dominantColor.split(',').map(Number);
    return (255 << 24) | (r << 16) | (g << 8) | b;
  }

  // 边缘平滑
  private static applyEdgeSmoothing(image: any, edges: boolean[][]) {
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (edges[y] && edges[y][x]) {
          // 对边缘像素进行平滑
          const neighbors = [];
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              neighbors.push(image.getPixelColor(x + dx, y + dy));
            }
          }

          const avgColor = this.averageColors(neighbors);
          image.setPixelColor(avgColor, x, y);
        }
      }
    }
  }

  // 计算平均颜色
  private static averageColors(colors: number[]): number {
    let r = 0, g = 0, b = 0, a = 0;
    let count = 0;

    for (const color of colors) {
      const alpha = (color >> 24) & 255;
      if (alpha > 0) {
        r += (color >> 16) & 255;
        g += (color >> 8) & 255;
        b += color & 255;
        a += alpha;
        count++;
      }
    }

    if (count === 0) return 0;

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    a = Math.round(a / count);

    return (a << 24) | (r << 16) | (g << 8) | b;
  }

  // 智能像素化
  private static applySmartPixelation(image: any, pixelSize: number): any {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const result = new Jimp(width, height);

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // 计算像素块内的平均颜色
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

          // 填充整个像素块
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

// 用户图片融合增强版
export class UserImageFusion {
  static async fuseUserWithPokemon(
    userImageUrl: string,
    pokemonSpriteUrl: string,
    options: {
      preserveOutline: boolean;
      colorTransfer: boolean;
      edgeDetection: boolean;
    } = {
      preserveOutline: true,
      colorTransfer: true,
      edgeDetection: true
    }
  ): Promise<string> {
    try {
      const [userImg, pokemonImg] = await Promise.all([
        Jimp.read(userImageUrl),
        Jimp.read(pokemonSpriteUrl)
      ]);

      const size = 512;
      userImg.resize(size, size);
      pokemonImg.resize(size, size);

      // 预处理用户图片
      const processedUser = this.preprocessUserImage(userImg);
      const processedPokemon = this.preprocessPokemonImage(pokemonImg);

      // 创建融合图像
      const fused = new Jimp(size, size);

      // 使用宝可梦轮廓，用户图片纹理
      this.applyTextureMapping(
        processedUser,
        processedPokemon,
        fused,
        options
      );

      return await fused.getBase64Async(Jimp.MIME_PNG);
    } catch (error) {
      console.error('用户图片融合失败:', error);
      throw error;
    }
  }

  private static preprocessUserImage(image: any): any {
    // 调整用户图片的亮度和对比度
    return image
      .brightness(0.1)
      .contrast(0.2)
      .normalize();
  }

  private static preprocessPokemonImage(image: any): any {
    // 增强宝可梦轮廓
    return EnhancedFusion.removeBackground(image);
  }

  private static applyTextureMapping(
    userImg: any,
    pokemonImg: any,
    fused: any,
    options: any
  ) {
    const width = userImg.bitmap.width;
    const height = userImg.bitmap.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pokemonPixel = pokemonImg.getPixelColor(x, y);
        const pokemonAlpha = (pokemonPixel >> 24) & 255;

        if (pokemonAlpha > 128) {
          // 在宝可梦轮廓内使用用户图片的颜色
          const userPixel = userImg.getPixelColor(x, y);
          const userAlpha = (userPixel >> 24) & 255;

          if (userAlpha > 128) {
            // 混合颜色，保留用户图片的纹理
            const blended = ColorUtils.blendColors(userPixel, pokemonPixel, 0.7);
            fused.setPixelColor(blended, x, y);
          } else {
            // 使用宝可梦原色
            fused.setPixelColor(pokemonPixel, x, y);
          }
        }
      }
    }
  }
}

// 导出默认配置
export const defaultFusionOptions = {
  preserveShape: true,
  colorTransfer: true,
  edgeSmoothing: true,
  pixelSize: 1
};
