// 像素级宝可梦融合算法 - 使用Canvas API进行高质量像素融合
import { sampleSize } from 'lodash-es';

// 融合配置
export interface FusionConfig {
  shapeSource: 'first' | 'second' | 'blend';
  colorSource: 'first' | 'second' | 'blend';
  pixelSize: number;
  outline: boolean;
}

// 默认配置
const defaultConfig: FusionConfig = {
  shapeSource: 'first',
  colorSource: 'second',
  pixelSize: 1,
  outline: true
};

/**
 * 使用Canvas创建像素级融合精灵 - 改进版
 * @param spriteUrlA 第一只宝可梦图片URL
 * @param spriteUrlB 第二只宝可梦图片URL
 * @param config 融合配置
 * @returns 融合后的base64图片
 */
export async function createPixelFusion(
  spriteUrlA: string,
  spriteUrlB: string,
  config: Partial<FusionConfig> = {}
): Promise<string> {
  const finalConfig = { ...defaultConfig, ...config };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas'));
      return;
    }

    canvas.width = 512;
    canvas.height = 512;

    const imgA = new Image();
    const imgB = new Image();

    imgA.crossOrigin = 'anonymous';
    imgB.crossOrigin = 'anonymous';

    let loadedCount = 0;
    
    const checkBothLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        try {
          // 清除画布
          ctx.clearRect(0, 0, 512, 512);
          
          // 创建临时canvas来处理图像数据
          const tempCanvasA = document.createElement('canvas');
          const tempCanvasB = document.createElement('canvas');
          const tempCtxA = tempCanvasA.getContext('2d')!;
          const tempCtxB = tempCanvasB.getContext('2d')!;
          
          tempCanvasA.width = tempCanvasB.width = 512;
          tempCanvasA.height = tempCanvasB.height = 512;
          
          // 绘制原始图像到临时canvas，保持宽高比
          const drawImageScaled = (img: HTMLImageElement, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
            const imgRatio = img.width / img.height;
            const canvasRatio = canvas.width / canvas.height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgRatio > canvasRatio) {
              drawWidth = canvas.width;
              drawHeight = canvas.width / imgRatio;
              offsetX = 0;
              offsetY = (canvas.height - drawHeight) / 2;
            } else {
              drawHeight = canvas.height;
              drawWidth = canvas.height * imgRatio;
              offsetX = (canvas.width - drawWidth) / 2;
              offsetY = 0;
            }
            
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          };
          
          drawImageScaled(imgA, tempCtxA, tempCanvasA);
          drawImageScaled(imgB, tempCtxB, tempCanvasB);
          
          // 获取图像数据
          const imageDataA = tempCtxA.getImageData(0, 0, 512, 512);
          const imageDataB = tempCtxB.getImageData(0, 0, 512, 512);
          
          // 创建输出图像数据
          const outputData = ctx.createImageData(512, 512);
          
          // 逐像素处理 - 使用形状+颜色融合算法
          for (let y = 0; y < 512; y += finalConfig.pixelSize) {
            for (let x = 0; x < 512; x += finalConfig.pixelSize) {
              const index = (y * 512 + x) * 4;
              
              // 获取形状和颜色像素
              const shapeR = imageDataA.data[index];
              const shapeG = imageDataA.data[index + 1];
              const shapeB = imageDataA.data[index + 2];
              const shapeA = imageDataA.data[index + 3];
              
              const colorR = imageDataB.data[index];
              const colorG = imageDataB.data[index + 1];
              const colorB = imageDataB.data[index + 2];
              const colorA = imageDataB.data[index + 3];
              
              // 基于配置选择形状和颜色 - 确保完全填充，无黑色空白
              let finalR, finalG, finalB, finalA;
              
              switch (finalConfig.shapeSource) {
                case 'first':
                  // 使用第一张图的形状，第二张图的颜色完全填充
                  // 降低透明度阈值，确保形状完全填充
                  finalA = shapeA > 1 ? 255 : 0;
                  
                  if (shapeA > 1) {
                    // 使用第二张图的颜色，确保完全填充形状
                    // 如果第二张图在该位置有颜色，使用它；否则使用最近的有效颜色
                    if (colorA > 1) {
                      finalR = colorR;
                      finalG = colorG;
                      finalB = colorB;
                    } else {
                      // 寻找最近的有效颜色
                      const nearestColor = findNearestValidColor(imageDataB, x, y, 512, 512);
                      finalR = nearestColor.r;
                      finalG = nearestColor.g;
                      finalB = nearestColor.b;
                    }
                  } else {
                    // 透明区域保持透明
                    finalR = finalG = finalB = finalA = 0;
                  }
                  break;
                  
                case 'second':
                  // 使用第二张图的形状，第一张图的颜色完全填充
                  finalA = colorA > 1 ? 255 : 0;
                  
                  if (colorA > 1) {
                    // 使用第一张图的颜色，确保完全填充形状
                    if (shapeA > 1) {
                      finalR = shapeR;
                      finalG = shapeG;
                      finalB = shapeB;
                    } else {
                      // 寻找最近的有效颜色
                      const nearestColor = findNearestValidColor(imageDataA, x, y, 512, 512);
                      finalR = nearestColor.r;
                      finalG = nearestColor.g;
                      finalB = nearestColor.b;
                    }
                  } else {
                    // 透明区域保持透明
                    finalR = finalG = finalB = finalA = 0;
                  }
                  break;
                  
                case 'blend':
                default:
                  // 智能融合：确保完全填充，无黑色空白
                  const useShape = shapeA > colorA;
                  finalA = Math.max(shapeA, colorA) > 1 ? 255 : 0;
                  
                  if (finalA > 0) {
                    // 使用对应的颜色，确保完全填充
                    const sourceImage = useShape ? imageDataB : imageDataA;
                    const sourceIndex = useShape ? 
                      [colorR, colorG, colorB, colorA] : 
                      [shapeR, shapeG, shapeB, shapeA];
                    
                    if (sourceIndex[3] > 1) {
                      finalR = sourceIndex[0];
                      finalG = sourceIndex[1];
                      finalB = sourceIndex[2];
                    } else {
                      // 寻找最近的有效颜色
                      const nearestColor = findNearestValidColor(
                        sourceImage, x, y, 512, 512
                      );
                      finalR = nearestColor.r;
                      finalG = nearestColor.g;
                      finalB = nearestColor.b;
                    }
                  } else {
                    // 透明区域保持透明
                    finalR = finalG = finalB = finalA = 0;
                  }
                  break;
              }
              
              // 确保颜色值在有效范围内
              finalR = Math.max(0, Math.min(255, finalR));
              finalG = Math.max(0, Math.min(255, finalG));
              finalB = Math.max(0, Math.min(255, finalB));
              
              // 填充像素块 - 确保形状完全填充
              if (finalA > 0) {
                for (let py = 0; py < finalConfig.pixelSize && y + py < 512; py++) {
                  for (let px = 0; px < finalConfig.pixelSize && x + px < 512; px++) {
                    const targetIndex = ((y + py) * 512 + (x + px)) * 4;
                    outputData.data[targetIndex] = finalR;
                    outputData.data[targetIndex + 1] = finalG;
                    outputData.data[targetIndex + 2] = finalB;
                    outputData.data[targetIndex + 3] = finalA;
                  }
                }
              }
            }
          }
          
          // 添加像素化效果
          if (finalConfig.pixelSize > 1) {
            const pixelatedData = pixelateImageData(outputData, finalConfig.pixelSize);
            ctx.putImageData(pixelatedData, 0, 0);
          } else {
            ctx.putImageData(outputData, 0, 0);
          }
          
          // 添加轮廓
          if (finalConfig.outline) {
            addPixelOutline(ctx, 512, 512);
          }
          
          resolve(canvas.toDataURL());
        } catch (error) {
          reject(error);
        }
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

/**
 * 像素化图像数据
 */
function pixelateImageData(imageData: ImageData, pixelSize: number): ImageData {
  const { width, height, data } = imageData;
  const newData = new Uint8ClampedArray(data);
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      
      // 填充像素块
      for (let py = 0; py < pixelSize && y + py < height; py++) {
        for (let px = 0; px < pixelSize && x + px < width; px++) {
          const targetIndex = ((y + py) * width + (x + px)) * 4;
          newData[targetIndex] = r;
          newData[targetIndex + 1] = g;
          newData[targetIndex + 2] = b;
          newData[targetIndex + 3] = a;
        }
      }
    }
  }
  
  return new ImageData(newData, width, height);
}

/**
 * 添加像素化轮廓
 */
function addPixelOutline(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const newImageData = ctx.createImageData(width, height);
  
  // 复制原始数据
  newImageData.data.set(imageData.data);
  
  // 检测边缘并添加黑色轮廓
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = (y * width + x) * 4;
      const alpha = imageData.data[index + 3];
      
      if (alpha > 128) {
        // 检查周围像素
        const neighbors = [
          imageData.data[((y-1) * width + x) * 4 + 3],
          imageData.data[((y+1) * width + x) * 4 + 3],
          imageData.data[(y * width + (x-1)) * 4 + 3],
          imageData.data[(y * width + (x+1)) * 4 + 3]
        ];
        
        const hasTransparentNeighbor = neighbors.some(a => a <= 128);
        
        if (hasTransparentNeighbor) {
          newImageData.data[index] = 0;
          newImageData.data[index + 1] = 0;
          newImageData.data[index + 2] = 0;
          newImageData.data[index + 3] = 255;
        }
      }
    }
  }
  
  ctx.putImageData(newImageData, 0, 0);
}

/**
 * 寻找最近的有效颜色（非透明）
 * @param imageData 图像数据
 * @param x 当前x坐标
 * @param y 当前y坐标
 * @param width 图像宽度
 * @param height 图像高度
 * @returns 最近的有效颜色
 */
function findNearestValidColor(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): { r: number; g: number; b: number } {
  const data = imageData.data;
  
  // 首先检查当前像素
  const currentIndex = (y * width + x) * 4;
  if (data[currentIndex + 3] > 1) {
    return {
      r: data[currentIndex],
      g: data[currentIndex + 1],
      b: data[currentIndex + 2]
    };
  }
  
  // 搜索半径
  const maxRadius = 20;
  
  // 从近到远搜索有效颜色
  for (let radius = 1; radius <= maxRadius; radius++) {
    // 检查圆形区域内的像素
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        // 跳过超出边界的像素
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        
        // 跳过不在圆形区域内的像素
        if (dx * dx + dy * dy > radius * radius) continue;
        
        const index = (ny * width + nx) * 4;
        if (data[index + 3] > 1) {
          return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2]
          };
        }
      }
    }
  }
  
  // 如果找不到有效颜色，返回默认颜色（避免黑色）
  return { r: 128, g: 128, b: 128 };
}

/**
 * 生成随机融合配置
 */
export function generateRandomConfig(): FusionConfig {
  return {
    shapeSource: sampleSize(['first', 'second', 'blend'], 1)[0] as 'first' | 'second' | 'blend',
    colorSource: sampleSize(['first', 'second', 'blend'], 1)[0] as 'first' | 'second' | 'blend',
    pixelSize: sampleSize([1, 2, 4], 1)[0],
    outline: Math.random() > 0.3
  };
}

/**
 * 创建预览缩略图
 */
export async function createThumbnail(
  spriteUrl: string,
  size: number = 128
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas'));
      return;
    }

    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, size, size);
      
      // 添加像素化效果
      if (size <= 64) {
        const imageData = ctx.getImageData(0, 0, size, size);
        const pixelatedData = pixelateImageData(imageData, 2);
        ctx.putImageData(pixelatedData, 0, 0);
      }
      
      resolve(canvas.toDataURL());
    };
    
    img.onerror = reject;
    img.src = spriteUrl;
  });
}
