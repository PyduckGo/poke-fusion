<template>
  <div id="app">
    <nav class="app-nav">
      <button 
        class="nav-btn" 
        :class="{ active: currentView === 'pokedex' }"
        @click="currentView = 'pokedex'"
      >
        像素图鉴
      </button>
      <button 
        class="nav-btn" 
        :class="{ active: currentView === 'hybrid' }"
        @click="currentView = 'hybrid'"
      >
        杂交实验室
      </button>
      <button 
        class="nav-btn" 
        :class="{ active: currentView === 'user' }"
        @click="currentView = 'user'"
      >
        用户融合
      </button>
    </nav>

    <div class="content">
      <PixelPokedex v-if="currentView === 'pokedex'" />
      <HybridPokedex v-if="currentView === 'hybrid'" />
      <UserPhotoFusion v-if="currentView === 'user'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PixelPokedex from './components/PixelPokedex.vue';
import HybridPokedex from './components/HybridPokedex.vue';
import UserPhotoFusion from './components/UserPhotoFusion.vue';

const currentView = ref<'pokedex' | 'hybrid' | 'user'>('pokedex');
</script>

<style>
/* 导入全局像素化样式 */
@import './style.css';

#app {
  font-family: 'ZCOOL QingKe HuangYou', 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  overflow-x: hidden;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.nav-btn {
  padding: 15px 30px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.nav-btn.active {
  background: #ff6b6b;
  border-color: #ff6b6b;
}

.content {
  padding: 20px;
}

/* 确保所有图片像素化 */
img {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* 全局像素化容器 */
.pixel-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .pixel-container {
    padding: 10px;
  }
  
  .app-nav {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-btn {
    width: 200px;
  }
}
</style>
