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
#app {
  font-family: 'ZCOOL QingKe HuangYou', 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* 像素化字体 */
.pixel-font {
  font-family: 'ZCOOL QingKe HuangYou', 'Press Start 2P', monospace;
  font-weight: bold;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  letter-spacing: 1px;
}

/* 全局像素化样式 */
img {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* 中文像素化文本 */
.chinese-pixel {
  font-family: 'ZCOOL QingKe HuangYou', monospace;
  font-weight: bold;
  font-size: 1.2em;
  text-shadow: 1px 1px 0px rgba(0,0,0,0.8);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 像素化按钮效果 */
.pixel-button {
  font-family: 'ZCOOL QingKe HuangYou', monospace;
  font-weight: bold;
  border: 2px solid #000;
  background: #ff6b6b;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: 3px 3px 0px #000;
}

.pixel-button:hover {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px #000;
}

.pixel-button:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #000;
}
</style>
