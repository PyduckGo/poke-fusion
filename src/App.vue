<template>
  <div id="app">
    <PixelPokedex />
    <UserPhotoFusion />
  </div>
</template>

<script setup lang="ts">
import PixelPokedex from './components/PixelPokedex.vue';
import UserPhotoFusion from './components/UserPhotoFusion.vue';
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
}
</style>
