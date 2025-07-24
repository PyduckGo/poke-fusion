// 用户照片与宝可梦融合算法
import { createPixelFusion } from './pixelFusion';

// 用户照片融合配置
interface UserPhotoFusionConfig {
  blendMode: 'overlay' | 'multiply' | 'screen' | 'color';
  intensity: number; // 0-1
  preserveDetails: boolean;
}

const defaultUserConfig: UserPhotoFusionConfig = {
  blendMode: 'overlay',
  intensity: 0.7,
  preserveDetails: true
};

/**
 * 创建用户照片与宝可梦的融合
 * @param userPhotoUrl 用户照片URL
 * @param pokemonSpriteUrl 宝可梦精灵URL
 * @param config 融合配置
 * @returns 融合后的base64图片
 */
export async function createUserPokemonFusion(
  userPhotoUrl: string,
  pokemonSpriteUrl: string,
  config: Partial<UserPhotoFusionConfig> = {}
): Promise<string> {
  const finalConfig = { ...defaultUserConfig, ...config };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas'));
      return;
    }

    canvas.width = 512;
    canvas.height = 512;

    const userImg = new Image();
    const pokemonImg = new Image();

    userImg.crossOrigin = 'anonymous';
    pokemonImg.crossOrigin = 'anonymous';

    let loadedCount = 0;
    
    const checkBothLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        try {
          // 清除画布
          ctx.clearRect(0, 0, 512, 512);
          
          // 创建临时canvas
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d')!;
          tempCanvas.width = 512;
          tempCanvas.height = 512;
          
          // 绘制宝可梦作为形状
          const drawPokemonScaled = () => {
            const imgRatio = pokemonImg.width / pokemonImg.height;
            const canvasRatio = 512 / 512;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgRatio > canvasRatio) {
              drawWidth = 512;
              drawHeight = 512 / imgRatio;
              offsetX = 0;
              offsetY = (512 - drawHeight) / 2;
            } else {
              drawHeight = 512;
              drawWidth = 512 * imgRatio;
              offsetX = (512 - drawWidth) / 2;
              offsetY = 0;
            }
            
            tempCtx.drawImage(pokemonImg, offsetX, offsetY, drawWidth, drawHeight);
          };
          
          drawPokemonScaled();
          
          // 获取宝可梦形状遮罩
          const pokemonData = tempCtx.getImageData(0, 0, 512, 512);
          
          // 清除画布重新绘制用户照片
          tempCtx.clearRect(0, 0, 512, 512);
          
          // 绘制用户照片
          const drawUserScaled = () => {
            const imgRatio = userImg.width / userImg.height;
            const canvasRatio = 512 / 512;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgRatio > canvasRatio) {
              drawWidth = 512;
              drawHeight = 512 / imgRatio;
              offsetX = 0;
              offsetY = (512 - drawHeight) / 2;
            } else {
              drawHeight = 512;
              drawWidth = 512 * imgRatio;
              offsetX = (512 - drawWidth) / 2;
              offsetY = 0;
            }
            
            tempCtx.drawImage(userImg, offsetX, offsetY, drawWidth, drawHeight);
          };
          
          drawUserScaled();
          
          const userData = tempCtx.getImageData(0, 0, 512, 512);
          
          // 创建最终图像数据
          const finalData = ctx.createImageData(512, 512);
          
          // 应用融合算法
          for (let i = 0; i < pokemonData.data.length; i += 4) {
            const pokemonAlpha = pokemonData.data[i + 3];
            const userAlpha = userData.data[i + 3];
            
            if (pokemonAlpha > 10) {
              // 在宝可梦形状区域内使用用户照片的颜色
              const intensity = finalConfig.intensity;
              
              finalData.data[i] = userData.data[i] * intensity + pokemonData.data[i] * (1 - intensity);
              finalData.data[i + 1] = userData.data[i + 1] * intensity + pokemonData.data[i + 1] * (1 - intensity);
              finalData.data[i + 2] = userData.data[i + 2] * intensity + pokemonData.data[i + 2] * (1 - intensity);
              finalData.data[i + 3] = 255; // 完全不透明
            } else {
              // 透明区域
              finalData.data[i] = 0;
              finalData.data[i + 1] = 0;
              finalData.data[i + 2] = 0;
              finalData.data[i + 3] = 0;
            }
          }
          
          // 应用像素化效果
          const pixelatedData = applyPixelation(finalData, 2);
          
          ctx.putImageData(pixelatedData, 0, 0);
          
          // 添加像素化轮廓
          addPixelOutline(ctx, 512, 512);
          
          resolve(canvas.toDataURL());
        } catch (error) {
          reject(error);
        }
      }
    };

    userImg.onload = checkBothLoaded;
    pokemonImg.onload = checkBothLoaded;
    userImg.onerror = reject;
    pokemonImg.onerror = reject;

    userImg.src = userPhotoUrl;
    pokemonImg.src = pokemonSpriteUrl;
  });
}

/**
 * 应用像素化效果
 */
function applyPixelation(imageData: ImageData, pixelSize: number): ImageData {
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
  
  newImageData.data.set(imageData.data);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = (y * width + x) * 4;
      const alpha = imageData.data[index + 3];
      
      if (alpha > 128) {
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
 * 保存融合图片
 */
export function saveFusionImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
