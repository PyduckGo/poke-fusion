// Service Worker for PokeFusion
const CACHE_NAME = 'poke-fusion-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/style.css',
  '/src/App.vue',
  '/src/components/PixelPokedex.vue',
  '/src/components/ThreeDViewer.vue',
  '/src/utils/pokemonApi.ts',
  '/src/utils/pixelFusion.ts',
  '/src/utils/chinesePixelFont.ts',
  '/src/utils/cache.ts'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('所有资源已缓存');
          })
          .catch((error) => {
            console.error('缓存资源失败:', error);
          });
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker 已激活');
    })
  );
});

// 获取事件
self.addEventListener('fetch', (event) => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳过chrome-extension协议的请求
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:' ||
      url.protocol === 'edge-extension:') {
    return;
  }

  // 跳过非http/https协议的请求
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有，直接返回
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request).then((response) => {
          // 检查是否是有效的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 跳过chrome-extension和其他扩展协议的响应
          const responseUrl = new URL(response.url);
          if (responseUrl.protocol === 'chrome-extension:' || 
              responseUrl.protocol === 'moz-extension:' || 
              responseUrl.protocol === 'safari-extension:' ||
              responseUrl.protocol === 'edge-extension:') {
            return response;
          }
          
          // 克隆响应
          const responseToCache = response.clone();
          
          // 添加到缓存
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch((error) => {
          console.error('网络请求失败:', error);
          // 可以返回一个离线页面或默认响应
          return new Response('网络不可用', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// 消息事件
self.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
  
  // 回复消息
  if (event.data && event.data.type === 'PING') {
    event.ports[0].postMessage({ type: 'PONG' });
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker 错误:', event.error);
});
