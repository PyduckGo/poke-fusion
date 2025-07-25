<template>
  <div class="demo-hybrid">
    <h1 class="pixel-title">宝可梦杂交演示</h1>
    
    <div class="demo-section">
      <h2>功能特性</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3>🧬 基因混合</h3>
          <p>智能混合两只宝可梦的基因，创造全新物种</p>
        </div>
        <div class="feature-card">
          <h3>🎨 像素艺术</h3>
          <p>保持像素风格，生成512x512高清精灵图</p>
        </div>
        <div class="feature-card">
          <h3>📊 完整属性</h3>
          <p>继承并混合种族值、特性、类型等完整数据</p>
        </div>
        <div class="feature-card">
          <h3>👤 用户融合</h3>
          <p>上传照片与宝可梦融合，创造个性化精灵</p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>快速体验</h2>
      <div class="quick-demo">
        <button class="demo-btn" @click="quickHybrid">
          随机杂交一对宝可梦
        </button>
        
        <div v-if="demoResult" class="demo-result">
          <img :src="demoResult.sprite" :alt="demoResult.name" />
          <div class="demo-info">
            <h3>{{ demoResult.name }}</h3>
            <p>ID: {{ demoResult.id }}</p>
            <p>类型: {{ demoResult.types.join('/') }}</p>
            <p>特性: {{ demoResult.abilities.join(', ') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>使用指南</h2>
      <div class="guide-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>选择模式</h4>
            <p>选择"宝可梦杂交"或"用户照片杂交"</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>选择宝可梦</h4>
            <p>从1-3世代中选择两只宝可梦</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>开始杂交</h4>
            <p>点击"开始杂交"按钮生成新物种</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>保存分享</h4>
            <p>保存结果或分享到社交媒体</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HybridFusion } from '../utils/hybridFusion';
import { getRandomPokemonPair } from '../data/pokemonData';
import type { HybridPokemon } from '../utils/hybridFusion';

const demoResult = ref<HybridPokemon | null>(null);
const isLoading = ref(false);

async function quickHybrid() {
  isLoading.value = true;
  try {
    const [pokemonA, pokemonB] = getRandomPokemonPair();
    const hybrid = await HybridFusion.createHybrid(pokemonA, pokemonB);
    demoResult.value = hybrid;
  } catch (error) {
    console.error('演示杂交失败:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.demo-hybrid {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Courier New', monospace;
}

.pixel-title {
  font-size: 36px;
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 40px;
  text-shadow: 2px 2px 0 #000;
}

.demo-section {
  margin-bottom: 40px;
}

.demo-section h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  font-size: 20px;
  color: #ff6b6b;
  margin-bottom: 10px;
}

.feature-card p {
  color: #666;
  font-size: 14px;
}

.quick-demo {
  text-align: center;
}

.demo-btn {
  padding: 15px 30px;
  font-size: 18px;
  background: #4ecdc4;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.demo-btn:hover {
  background: #45b7b8;
  transform: translateY(-2px);
}

.demo-result {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.demo-result img {
  width: 256px;
  height: 256px;
  image-rendering: pixelated;
  border: 3px solid #4ecdc4;
  border-radius: 15px;
}

.demo-info {
  text-align: center;
}

.demo-info h3 {
  font-size: 24px;
  color: #ff6b6b;
  margin-bottom: 10px;
}

.demo-info p {
  margin: 5px 0;
  color: #333;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.step-number {
  width: 40px;
  height: 40px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.step-content h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.step-content p {
  margin: 0;
  color: #666;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
  }
}
</style>
</template>
