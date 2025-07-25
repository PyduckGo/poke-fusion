// 像素级宝可梦融合算法 - 使用Canvas API进行高质量像素融合
// 参考alexonsager风格的融合实现
import { sampleSize } from 'lodash-es';

// 融合配置
export interface FusionConfig {
  shapeSource: 'first' | 'second' | 'blend';
  colorSource: 'first' | 'second' | 'blend';
  pixelSize: number;
  outline: boolean;
  faceSwap: boolean; // 新增面部替换功能
}

// 默认配置 - 优化为alexonsager风格
const defaultConfig: FusionConfig = {
  shapeSource: 'first',  // 第一个宝可梦提供形状和轮廓
  colorSource: 'second', // 第二个宝可梦提供颜色填充
  pixelSize: 1,
  outline: true,
  faceSwap: true         // 启用面部替换
};

/**
 * 使用Canvas创建像素级融合精灵 - alexonsager风格
 * @param spriteUrlA 第一个宝可梦图片URL（提供形状和轮廓）
 * @param spriteUrlB 第二个宝可梦图片URL（提供颜色和面部）
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
          
          // alexonsager风格融合算法
          for (let y = 0; y < 512; y += finalConfig.pixelSize) {
            for (let x = 0; x < 512; x += finalConfig.pixelSize) {
              const index = (y * 512 + x) * 4;
              
              // 获取两个图像的像素数据
              const rA = imageDataA.data[index];
              const gA = imageDataA.data[index + 1];
              const bA = imageDataA.data[index + 2];
              const aA = imageDataA.data[index + 3];
              
              const rB = imageDataB.data[index];
              const gB = imageDataB.data[index + 1];
              const bB = imageDataB.data[index + 2];
              const aB = imageDataB.data[index + 3];
              
              // 检测透明区域
              const isTransparentA = aA < 128;
              const isTransparentB = aB < 128;
              
              // 检测面部区域（简化的面部检测）
              const isFace = y > 100 && y < 200 && x > 200 && x < 300;
              
              let finalR, finalG, finalB, finalA;
              
              if (isTransparentA && isTransparentB) {
                // 都是透明区域
                finalR = finalG = finalB = finalA = 0;
              } else if (!isTransparentA && isTransparentB) {
                // 只有A有内容
                finalR = rA;
                finalG = gA;
                finalB = bA;
                finalA = 255;
              } else if (isTransparentA && !isTransparentB) {
                // 只有B有内容
                finalR = rB;
                finalG = gB;
                finalB = bB;
                finalA = 255;
              } else {
                // 两个都有内容 - alexonsager风格融合
                if (finalConfig.faceSwap && isFace) {
                  // 面部替换：使用B的面部
                  finalR = rB;
                  finalG = gB;
                  finalB = bB;
                  finalA = 255;
                } else {
                  // 主体融合：A的形状 + B的颜色
                  // 使用B的颜色，但保持A的亮度
                  const brightnessA = (rA + gA + bA) / 3;
                  const brightnessB = (rB + gB + bB) / 3;
                  
                  if (brightnessB > 0) {
                    const ratio = brightnessA / brightnessB;
                    finalR = Math.min(255, Math.round(rB * ratio));
                    finalG = Math.min(255, Math.round(gB * ratio));
                    finalB = Math.min(255, Math.round(bB * ratio));
                  } else {
                    finalR = rB;
                    finalG = gB;
                    finalB = bB;
                  }
                  finalA = 255;
                }
              }
              
              // 确保颜色值在有效范围内
              finalR = Math.max(0, Math.min(255, finalR));
              finalG = Math.max(0, Math.min(255, finalG));
              finalB = Math.max(0, Math.min(255, finalB));
              
              // 填充像素块
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
    outline: Math.random() > 0.3,
    faceSwap: Math.random() > 0.5 // 随机启用面部替换
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
