<template>
  <div class="pixel-pokedex">
    <!-- 启动屏 -->
    <div v-if="showSplash" class="splash-screen">
      <div class="pixel-text">Pixel PokéFusion</div>
    </div>

  <!-- 主面板 -->
    <div v-else class="main-panel">
      <!-- 左侧：原始宝可梦 -->
      <div class="original-pokemon">
        <div class="pokemon-card" @click="selectPokemon('A')">
          <img v-if="pokemonA" :src="pokemonA.sprites.front_default" :alt="getPokemonName(pokemonA)" />
          <h3 class="chinese-pixel">{{ getPokemonName(pokemonA) }}</h3>
          <p class="pokemon-id">#{{ pokemonA?.id.toString().padStart(3, '0') }}</p>
        </div>
        <div class="pokemon-card" @click="selectPokemon('B')">
          <img v-if="pokemonB" :src="pokemonB.sprites.front_default" :alt="getPokemonName(pokemonB)" />
          <h3 class="chinese-pixel">{{ getPokemonName(pokemonB) }}</h3>
          <p class="pokemon-id">#{{ pokemonB?.id.toString().padStart(3, '0') }}</p>
        </div>
      </div>

      <!-- 中央：融合按钮 -->
      <div class="fusion-center">
        <button 
          class="fusion-btn pixel-btn"
          @click="createFusion"
          :disabled="isFusing"
        >
          <span v-if="!isFusing">⚡ 融合 ⚡</span>
          <span v-else>融合中...</span>
        </button>
        
        <!-- 3D预览窗口 -->
        <div class="preview-3d" ref="preview3d">
          <img 
            v-if="fusionSprite" 
            :src="fusionSprite" 
            class="fusion-preview"
            :class="{ 'floating': fusionSprite }"
          />
        </div>
      </div>

      <!-- 右侧：融合结果 -->
      <div v-if="fusionResult" class="fusion-result">
        <div class="pokemon-info">
          <h2 class="pixel-name">#{{ fusionResult.id }} {{ fusionResult.name }}</h2>
          
          <!-- 属性 -->
          <div class="types">
            <span 
              v-for="type in fusionResult.types" 
              :key="type"
              class="type-badge"
              :class="`type-${type}`"
            >
              {{ getTypeChinese(type) }}
            </span>
          </div>
          
          <!-- 特性 -->
          <div class="abilities">
            <h3>特性：</h3>
            <ul>
              <li v-for="ability in fusionResult.abilities" :key="ability">
                {{ getAbilityChinese(ability) }}
              </li>
            </ul>
          </div>
          
          <!-- 雷达图 -->
          <div class="stats-chart">
            <canvas ref="statsChart" width="200" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="isFusing" class="loading-overlay">
      <div class="pixel-loading">加载中...</div>
    </div>

  <!-- 成功动画 -->
  <div v-if="showSuccess" class="success-animation">
    <div class="confetti"></div>
  </div>

  <!-- 用户提示 -->
  <div class="user-tip">
    <p>💡 页面底部有"🎭 彩蛋：用户照片融合"功能，可以上传你的照片与宝可梦融合！</p>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import Chart from 'chart.js/auto';
import * as THREE from 'three';
import { createPixelFusion } from '../utils/pixelFusion';
import { getRandomPokemon, getTypeChinese, getAbilityChinese, getChineseName } from '../utils/pokemonApi';
import { generateComplexFusionName } from '../utils/chinesePixelFont';
import { CacheManager } from '../utils/cache';
import { audioManager } from '../utils/audioManager';
import type { Pokemon, FusionResult } from '../types';

// 状态管理
const showSplash = ref(true);
const isFusing = ref(false);
const showSuccess = ref(false);
const pokemonA = ref<Pokemon | null>(null);
const pokemonB = ref<Pokemon | null>(null);
const fusionResult = ref<FusionResult | null>(null);
const fusionSprite = ref<string>('');

// 引用
const statsChart = ref<HTMLCanvasElement>();
const preview3d = ref<HTMLDivElement>();

// 生命周期
onMounted(async () => {
  // 启动动画
  await startSplashAnimation();
  
  // 加载初始宝可梦
  await loadRandomPokemon();
});

// 启动屏动画
async function startSplashAnimation() {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  gsap.fromTo('.pixel-text', 
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
  );
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  showSplash.value = false;
}

// 加载随机宝可梦
async function loadRandomPokemon() {
  try {
    const [pokeA, pokeB] = await Promise.all([
      getRandomPokemon(),
      getRandomPokemon()
    ]);
    
    pokemonA.value = pokeA;
    pokemonB.value = pokeB;
    
    // 缓存宝可梦数据
    await Promise.all([
      CacheManager.cachePokemon(pokeA),
      CacheManager.cachePokemon(pokeB)
    ]);
    
    // 添加悬停动画
    nextTick(() => {
      gsap.fromTo('.original-pokemon .pokemon-card', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
      );
    });
  } catch (error) {
    console.error('加载宝可梦失败:', error);
  }
}

// 获取宝可梦名称
function getPokemonName(pokemon: Pokemon | null): string {
  if (!pokemon) return '加载中...';
  return getChineseName(pokemon);
}

// 创建融合
async function createFusion() {
  if (!pokemonA.value || !pokemonB.value) return;
  
  isFusing.value = true;
  audioManager.playLoadingSound();
  
  try {
    // 创建融合精灵
    fusionSprite.value = await createPixelFusion(
      pokemonA.value.sprites.front_default,
      pokemonB.value.sprites.front_default
    );
    
          // 生成融合结果
          const fusion = {
            id: `F${Date.now().toString(16).toUpperCase()}`,
            name: generateComplexFusionName(getChineseName(pokemonA.value), getChineseName(pokemonB.value)),
            pokemonA: pokemonA.value,
            pokemonB: pokemonB.value,
            fusedSprite: fusionSprite.value,
            types: getRandomTypes(pokemonA.value, pokemonB.value),
            abilities: getRandomAbilities(pokemonA.value, pokemonB.value),
            height: Math.round((pokemonA.value.height + pokemonB.value.height) / 2),
            weight: Math.round((pokemonA.value.weight + pokemonB.value.weight) / 2),
            cryUrl: pokemonA.value.cries?.latest || '',
            generation: Math.max(pokemonA.value.id, pokemonB.value.id)
          };
    
    fusionResult.value = fusion;
    
    // 缓存融合结果
    await CacheManager.cacheFusion(fusion);
    
    // 显示成功动画
    showSuccessAnimation();
    
    // 创建雷达图
    nextTick(() => {
      createStatsChart();
    });
    
  } catch (error) {
    console.error('融合失败:', error);
  } finally {
    isFusing.value = false;
  }
}

// 获取随机类型
function getRandomTypes(pokeA: Pokemon, pokeB: Pokemon): string[] {
  const typesA = pokeA.types.map(t => t.type.name);
  const typesB = pokeB.types.map(t => t.type.name);
  
  const allTypes = [...new Set([...typesA, ...typesB])];
  return allTypes.slice(0, 2);
}

// 获取随机特性
function getRandomAbilities(pokeA: Pokemon, pokeB: Pokemon): string[] {
  const abilitiesA = pokeA.abilities.filter(a => !a.is_hidden).map(a => a.ability.name);
  const abilitiesB = pokeB.abilities.filter(a => !a.is_hidden).map(a => a.ability.name);
  
  const allAbilities = [...new Set([...abilitiesA, ...abilitiesB])];
  return allAbilities.slice(0, 2);
}

// 创建雷达图
function createStatsChart() {
  if (!statsChart.value || !fusionResult.value) return;
  
  const ctx = statsChart.value.getContext('2d');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['HP', '攻击', '防御', '特攻', '特防', '速度'],
      datasets: [{
        label: '种族值',
        data: [
          Math.random() * 100 + 50,
          Math.random() * 100 + 50,
          Math.random() * 100 + 50,
          Math.random() * 100 + 50,
          Math.random() * 100 + 50,
          Math.random() * 100 + 50
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 150,
          ticks: {
            display: false
          }
        }
      }
    }
  });
}

// 成功动画
function showSuccessAnimation() {
  showSuccess.value = true;
  audioManager.playSuccessSound();
  
  // 彩色纸屑
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  // 3D预览动画
  if (preview3d.value) {
    gsap.fromTo(preview3d.value,
      { scale: 0, rotation: 0 },
      { scale: 1, rotation: 360, duration: 1, ease: 'back.out(1.7)' }
    );
  }
  
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
}

// 选择宝可梦
async function selectPokemon(type: 'A' | 'B') {
  audioManager.playClickSound();
  const newPokemon = await getRandomPokemon();
  if (type === 'A') {
    pokemonA.value = newPokemon;
  } else {
    pokemonB.value = newPokemon;
  }
}
</script>

<style scoped>
.pixel-pokedex {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 启动屏 */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.pixel-text {
  font-family: 'Courier New', monospace;
  font-size: 48px;
  color: #fff;
  text-shadow: 0 0 10px #00ff00;
  letter-spacing: 4px;
}

/* 主面板 */
.main-panel {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.original-pokemon {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pokemon-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.pokemon-card:hover {
  transform: translateY(-5px);
}

.pokemon-card img {
  width: 128px;
  height: 128px;
  image-rendering: pixelated;
}

.pokemon-card h3 {
  margin: 10px 0 5px 0;
  font-family: 'ZCOOL QingKe HuangYou', 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-shadow: 1px 1px 0px rgba(0,0,0,0.3);
}

.pokemon-id {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

.hover-shake:hover {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.fusion-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.pixel-btn {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  padding: 20px 40px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 0;
  cursor: pointer;
  box-shadow: 0 4px 0 #d63031;
  transition: all 0.1s;
}

.pixel-btn:hover:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #d63031;
}

.pixel-btn:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 #d63031;
}

.pixel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-3d {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.fusion-preview {
  width: 256px;
  height: 256px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotateY(0deg); }
  50% { transform: translateY(-20px) rotateY(180deg); }
}

.fusion-result {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.pixel-name {
  font-family: 'Courier New', monospace;
  font-size: 32px;
  color: #333;
  margin-bottom: 20px;
  text-shadow: 2px 2px 0 #ff6b6b;
}

.types {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.type-badge {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.type-normal { background: #A8A878; }
.type-fire { background: #F08030; }
.type-water { background: #6890F0; }
.type-electric { background: #F8D030; }
.type-grass { background: #78C850; }
.type-ice { background: #98D8D8; }
.type-fighting { background: #C03028; }
.type-poison { background: #A040A0; }
.type-ground { background: #E0C068; }
.type-flying { background: #A890F0; }
.type-psychic { background: #F85888; }
.type-bug { background: #A8B820; }
.type-rock { background: #B8A038; }
.type-ghost { background: #705898; }
.type-dragon { background: #7038F8; }
.type-dark { background: #705848; }
.type-steel { background: #B8B8D0; }
.type-fairy { background: #EE99AC; }

.abilities {
  margin-bottom: 20px;
}

.abilities h3 {
  font-family: 'Courier New', monospace;
  margin-bottom: 10px;
}

.abilities ul {
  list-style: none;
  padding: 0;
}

.abilities li {
  padding: 5px 0;
  font-family: 'Courier New', monospace;
}

.stats-chart {
  display: flex;
  justify-content: center;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.pixel-loading {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #fff;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.success-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 998;
}

@media (max-width: 768px) {
  .main-panel {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .original-pokemon {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
