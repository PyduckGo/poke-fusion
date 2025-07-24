// 用户照片与宝可梦融合算法
// 注意：findNearestValidColor函数已在pixelFusion.ts中定义，这里直接使用

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
          
          // 应用融合算法 - 确保用户照片完全填充宝可梦形状
          for (let y = 0; y < 512; y++) {
            for (let x = 0; x < 512; x++) {
              const index = (y * 512 + x) * 4;
              const pokemonAlpha = pokemonData.data[index + 3];
              const userAlpha = userData.data[index + 3];
              
              if (pokemonAlpha > 1) {
                // 在宝可梦形状区域内使用用户照片的颜色
                // 确保完全填充，无黑色空白
                if (userAlpha > 1) {
                  // 用户照片有颜色，直接使用
                  finalData.data[index] = userData.data[index] * finalConfig.intensity;
                  finalData.data[index + 1] = userData.data[index + 1] * finalConfig.intensity;
                  finalData.data[index + 2] = userData.data[index + 2] * finalConfig.intensity;
                  finalData.data[index + 3] = 255;
                } else {
                  // 用户照片透明，寻找最近的有效颜色
                  const nearestColor = findNearestValidColor(userData, x, y, 512, 512);
                  finalData.data[index] = nearestColor.r * finalConfig.intensity;
                  finalData.data[index + 1] = nearestColor.g * finalConfig.intensity;
                  finalData.data[index + 2] = nearestColor.b * finalConfig.intensity;
                  finalData.data[index + 3] = 255;
                }
              } else {
                // 透明区域
                finalData.data[index] = 0;
                finalData.data[index + 1] = 0;
                finalData.data[index + 2] = 0;
                finalData.data[index + 3] = 0;
              }
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
