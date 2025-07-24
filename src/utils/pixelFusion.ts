// 像素级宝可梦融合算法 - 使用Canvas API进行高质量像素融合
import { sampleSize } from 'lodash-es';

// 融合配置
interface FusionConfig {
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
              
              // 基于配置选择形状和颜色 - 确保完全填充
              let finalR, finalG, finalB, finalA;
              
              switch (finalConfig.shapeSource) {
                case 'first':
                  // 使用第一张图的形状，第二张图的颜色完全填充
                  finalA = shapeA > 5 ? 255 : 0; // 降低透明度阈值确保形状完全填充
                  if (shapeA > 5) {
                    // 使用第二张图的颜色，确保完全填充形状
                    finalR = colorR || 128; // 防止黑色填充
                    finalG = colorG || 128;
                    finalB = colorB || 128;
                  } else {
                    // 透明区域保持透明
                    finalR = finalG = finalB = 0;
                  }
                  break;
                case 'second':
                  // 使用第二张图的形状，第一张图的颜色完全填充
                  finalA = colorA > 5 ? 255 : 0; // 降低透明度阈值确保形状完全填充
                  if (colorA > 5) {
                    // 使用第一张图的颜色，确保完全填充形状
                    finalR = shapeR || 128;
                    finalG = shapeG || 128;
                    finalB = shapeB || 128;
                  } else {
                    // 透明区域保持透明
                    finalR = finalG = finalB = 0;
                  }
                  break;
                case 'blend':
                default:
                  // 智能融合：确保完全填充，无黑色空白
                  const useShape = shapeA > colorA;
                  finalA = Math.max(shapeA, colorA) > 5 ? 255 : 0;
                  if (finalA > 0) {
                    // 使用对应的颜色，确保完全填充
                    const sourceR = useShape ? (colorR || 128) : (shapeR || 128);
                    const sourceG = useShape ? (colorG || 128) : (shapeG || 128);
                    const sourceB = useShape ? (colorB || 128) : (shapeB || 128);
                    
                    finalR = sourceR;
                    finalG = sourceG;
                    finalB = sourceB;
                  } else {
                    // 透明区域保持透明
                    finalR = finalG = finalB = 0;
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
