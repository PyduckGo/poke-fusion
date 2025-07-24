// 缓存管理工具
import Dexie from 'dexie';

// 创建数据库
class PokeFusionDB extends Dexie {
  pokemon: Dexie.Table<any, number>;
  fusions: Dexie.Table<any, string>;

  constructor() {
    super('PokeFusionDB');
    
    this.version(1).stores({
      pokemon: 'id, name, sprites, types, abilities, height, weight, cries',
      fusions: 'id, name, pokemonA, pokemonB, fusedSprite, types, abilities, height, weight, createdAt'
    });
    
    this.pokemon = this.table('pokemon');
    this.fusions = this.table('fusions');
  }
}

const db = new PokeFusionDB();

// 缓存管理器
export class CacheManager {
  // 缓存宝可梦数据
  static async cachePokemon(pokemon: any) {
    try {
      await db.pokemon.put(pokemon);
    } catch (error) {
      console.error('缓存宝可梦失败:', error);
    }
  }

  // 获取缓存的宝可梦
  static async getCachedPokemon(id: number): Promise<any | null> {
    try {
      return await db.pokemon.get(id);
    } catch (error) {
      console.error('获取缓存宝可梦失败:', error);
      return null;
    }
  }

  // 缓存融合结果
  static async cacheFusion(fusion: any) {
    try {
      const fusionWithDate = {
        ...fusion,
        createdAt: new Date().toISOString()
      };
      await db.fusions.put(fusionWithDate);
    } catch (error) {
      console.error('缓存融合结果失败:', error);
    }
  }

  // 获取所有缓存的融合结果
  static async getAllCachedFusions(): Promise<any[]> {
    try {
      return await db.fusions.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('获取缓存融合结果失败:', error);
      return [];
    }
  }

  // 获取单个融合结果
  static async getCachedFusion(id: string): Promise<any | null> {
    try {
      return await db.fusions.get(id);
    } catch (error) {
      console.error('获取缓存融合结果失败:', error);
      return null;
    }
  }

  // 删除缓存的融合结果
  static async deleteCachedFusion(id: string) {
    try {
      await db.fusions.delete(id);
    } catch (error) {
      console.error('删除缓存融合结果失败:', error);
    }
  }

  // 清空所有缓存
  static async clearAllCache() {
    try {
      await db.pokemon.clear();
      await db.fusions.clear();
    } catch (error) {
      console.error('清空缓存失败:', error);
    }
  }

  // 预加载常用宝可梦
  static async preloadCommonPokemon() {
    const commonIds = [1, 4, 7, 25, 133, 150, 151, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151];
    
    for (const id of commonIds) {
      try {
        const pokemon = await import('../utils/pokemonApi').then(m => m.getPokemonById(id));
        await this.cachePokemon(pokemon);
      } catch (error) {
        console.error(`预加载宝可梦 ${id} 失败:`, error);
      }
    }
  }
}

// 缓存图片到CacheStorage
export class ImageCache {
  private static readonly CACHE_NAME = 'poke-fusion-images';
  private static readonly CACHE_VERSION = 'v1';

  static async cacheImage(url: string, response: Response) {
    try {
      const cache = await caches.open(`${this.CACHE_NAME}-${this.CACHE_VERSION}`);
      await cache.put(url, response);
    } catch (error) {
      console.error('缓存图片失败:', error);
    }
  }

  static async getCachedImage(url: string): Promise<Response | undefined> {
    try {
      const cache = await caches.open(`${this.CACHE_NAME}-${this.CACHE_VERSION}`);
      return await cache.match(url);
    } catch (error) {
      console.error('获取缓存图片失败:', error);
      return undefined;
    }
  }

  static async cacheBase64Image(url: string, base64Data: string) {
    try {
      const response = new Response(base64Data);
      await this.cacheImage(url, response);
    } catch (error) {
      console.error('缓存Base64图片失败:', error);
    }
  }
}

// 初始化缓存
export async function initCache() {
  try {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker 注册成功');
        } catch (error) {
          console.error('Service Worker 注册失败:', error);
        }
      });
    }

    // 预加载常用宝可梦
    await CacheManager.preloadCommonPokemon();
  } catch (error) {
    console.error('初始化缓存失败:', error);
  }
}
