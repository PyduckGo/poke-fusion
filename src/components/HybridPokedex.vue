<template>
  <div class="hybrid-pokedex">
    <!-- 标题 -->
    <div class="title-section">
      <h1 class="pixel-title">宝可梦杂交实验室</h1>
      <p class="subtitle">突破照片限制，创造全新物种</p>
    </div>

    <!-- 杂交模式选择 -->
    <div class="mode-selector">
      <button 
        class="mode-btn" 
        :class="{ active: mode === 'pokemon' }"
        @click="mode = 'pokemon'"
      >
        宝可梦杂交
      </button>
      <button 
        class="mode-btn" 
        :class="{ active: mode === 'user' }"
        @click="mode = 'user'"
      >
        用户照片杂交
      </button>
    </div>

    <!-- 宝可梦杂交模式 -->
    <div v-if="mode === 'pokemon'" class="pokemon-hybrid">
      <div class="pokemon-selectors">
        <div class="pokemon-card">
          <h3>父系宝可梦</h3>
          <PokemonSelector
            :selected="pokemonA"
            @select="pokemonA = $event"
          />
        </div>
        
        <div class="hybrid-center">
          <div class="hybrid-symbol">⚡</div>
          <button 
            class="create-hybrid-btn"
            @click="createPokemonHybrid"
            :disabled="!pokemonA || !pokemonB"
          >
            开始杂交
          </button>
        </div>
        
        <div class="pokemon-card">
          <h3>母系宝可梦</h3>
          <PokemonSelector
            :selected="pokemonB"
            @select="pokemonB = $event"
          />
        </div>
      </div>
    </div>

    <!-- 用户照片杂交模式 -->
    <div v-if="mode === 'user'" class="user-hybrid">
      <div class="user-input-section">
        <div class="upload-area" @click="triggerFileInput">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            style="display: none"
          />
          <div v-if="!userImage" class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <p>点击上传照片</p>
          </div>
          <img v-else :src="userImage" class="preview-image" />
        </div>
        
        <div class="user-form">
          <input
            v-model="userName"
            placeholder="输入你的名字"
            class="pixel-input"
          />
          
          <PokemonSelector
            :selected="selectedPokemon"
            @select="selectedPokemon = $event"
            label="选择宝可梦伙伴"
          />
          
          <button 
            class="create-hybrid-btn"
            @click="createUserHybrid"
            :disabled="!userImage || !userName || !selectedPokemon"
          >
            创建杂交宝可梦
          </button>
        </div>
      </div>
    </div>

    <!-- 杂交结果展示 -->
    <div v-if="hybridResult" class="hybrid-result">
      <div class="result-card">
        <div class="sprite-container">
          <img :src="hybridResult.sprite" :alt="hybridResult.name" />
        </div>
        
        <div class="info-section">
          <h2 class="hybrid-name">{{ hybridResult.name }}</h2>
          <p class="hybrid-id">#{{ hybridResult.id }}</p>
          
          <div class="types">
            <span 
              v-for="type in hybridResult.types" 
              :key="type"
              class="type-badge"
              :class="`type-${type}`"
            >
              {{ type }}
            </span>
          </div>
          
          <div class="abilities">
            <h4>特性：</h4>
            <ul>
              <li v-for="ability in hybridResult.abilities" :key="ability">
                {{ ability }}
              </li>
            </ul>
          </div>
          
          <div class="stats">
            <h4>种族值：</h4>
            <div class="stat-grid">
              <div class="stat-item">
                <span>HP</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: `${hybridResult.stats.hp}%` }"></div>
                </div>
                <span>{{ hybridResult.stats.hp }}</span>
              </div>
              <div class="stat-item">
                <span>攻击</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: `${hybridResult.stats.attack}%` }"></div>
                </div>
                <span>{{ hybridResult.stats.attack }}</span>
              </div>
              <div class="stat-item">
                <span>防御</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: `${hybridResult.stats.defense}%` }"></div>
                </div>
                <span>{{ hybridResult.stats.defense }}</span>
              </div>
              <div class="stat-item">
                <span>特攻</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: `${hybridResult.stats.spAttack}%` }"></div>
                </div>
                <span>{{ hybridResult.stats.spAttack }}</span>
              </div>
              <div class="stat-item">
                <span>特防</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: `${hybridResult.stats.spDefense}%` }"></div>
                </div>
                <span>{{ hybridResult.stats.spDefense }}</span>
              </div>
              <div class="stat-item">
                <span>速度</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: `${hybridResult.stats.speed}%` }"></div>
                </div>
                <span>{{ hybridResult.stats.speed }}</span>
              </div>
            </div>
          </div>
          
          <div class="evolution-info">
            <h4>进化信息：</h4>
            <p v-if="hybridResult.evolution.canEvolve">
              可在等级 {{ hybridResult.evolution.evolutionLevel }} 进化为 {{ hybridResult.evolution.nextStage }}
            </p>
            <p v-else>无法进化</p>
          </div>
          
          <div class="features">
            <h4>特征：</h4>
            <p>体型：{{ hybridResult.features.size }}</p>
            <p>栖息地：{{ hybridResult.features.habitat }}</p>
            <p>特殊特征：{{ hybridResult.features.specialFeatures.join(', ') }}</p>
          </div>
          
          <div class="actions">
            <button class="save-btn" @click="saveHybrid">保存</button>
            <button class="share-btn" @click="shareHybrid">分享</button>
            <button class="new-btn" @click="reset">创建新的</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="isCreating" class="loading-overlay">
      <div class="pixel-loading">杂交中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { HybridFusion, UserPokemonHybrid, type HybridPokemon } from '../utils/hybridFusion';
import { getAllPokemon } from '../data/pokemonData';
import type { Pokemon } from '../types/pokemon';
import PokemonSelector from './PokemonSelector.vue';

// 状态管理
const mode = ref<'pokemon' | 'user'>('pokemon');
const pokemonA = ref<Pokemon | null>(null);
const pokemonB = ref<Pokemon | null>(null);
const selectedPokemon = ref<Pokemon | null>(null);
const userImage = ref<string>('');
const userName = ref<string>('');
const hybridResult = ref<HybridPokemon | null>(null);
const isCreating = ref(false);
const fileInput = ref<HTMLInputElement>();

// 获取所有宝可梦
const allPokemon = computed(() => getAllPokemon());

// 创建宝可梦杂交
async function createPokemonHybrid() {
  if (!pokemonA.value || !pokemonB.value) return;
  
  isCreating.value = true;
  
  try {
    const hybrid = await HybridFusion.createHybrid(pokemonA.value, pokemonB.value, {
      geneticMix: 0.5,
      featureTransfer: true,
      colorHarmony: true,
      evolutionChain: true
    });
    
    hybridResult.value = hybrid;
  } catch (error) {
    console.error('杂交失败:', error);
  } finally {
    isCreating.value = false;
  }
}

// 创建用户照片杂交
async function createUserHybrid() {
  if (!userImage.value || !userName.value || !selectedPokemon.value) return;
  
  isCreating.value = true;
  
  try {
    const hybrid = await UserPokemonHybrid.createUserHybrid(
      userImage.value,
      selectedPokemon.value,
      userName.value
    );
    
    hybridResult.value = hybrid;
  } catch (error) {
    console.error('用户杂交失败:', error);
  } finally {
    isCreating.value = false;
  }
}

// 触发文件选择
function triggerFileInput() {
  fileInput.value?.click();
}

// 处理图片上传
function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      userImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

// 保存杂交结果
function saveHybrid() {
  if (!hybridResult.value) return;
  
  const saved = JSON.parse(localStorage.getItem('hybridPokemon') || '[]');
  saved.push(hybridResult.value);
  localStorage.setItem('hybridPokemon', JSON.stringify(saved));
  
  alert('已保存杂交结果！');
}

// 分享杂交结果
function shareHybrid() {
  if (!hybridResult.value) return;
  
  const shareText = `我创造了一只全新的宝可梦：${hybridResult.value.name}！\n` +
    `类型：${hybridResult.value.types.join('/')}\n` +
    `特性：${hybridResult.value.abilities.join(', ')}`;
  
  if (navigator.share) {
    navigator.share({
      title: `我的杂交宝可梦：${hybridResult.value.name}`,
      text: shareText,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(shareText);
    alert('已复制分享内容到剪贴板！');
  }
}

// 重置
function reset() {
  hybridResult.value = null;
  pokemonA.value = null;
  pokemonB.value = null;
  selectedPokemon.value = null;
  userImage.value = '';
  userName.value = '';
}
</script>

<style scoped>
.hybrid-pokedex {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Courier New', monospace;
}

.title-section {
  text-align: center;
  margin-bottom: 40px;
}

.pixel-title {
  font-size: 48px;
  color: #ff6b6b;
  text-shadow: 3px 3px 0 #000;
  margin: 0;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin-top: 10px;
}

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.mode-btn {
  padding: 15px 30px;
  font-size: 18px;
  background: #4ecdc4;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.mode-btn.active {
  background: #ff6b6b;
}

.pokemon-hybrid {
  margin-bottom: 40px;
}

.pokemon-selectors {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 40px;
  align-items: center;
}

.pokemon-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
}

.hybrid-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hybrid-symbol {
  font-size: 48px;
  color: #ff6b6b;
}

.create-hybrid-btn {
  padding: 15px 30px;
  font-size: 20px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.create-hybrid-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.create-hybrid-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-hybrid {
  display: flex;
  justify-content: center;
}

.user-input-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 800px;
}

.upload-area {
  border: 3px dashed #4ecdc4;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #ff6b6b;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pixel-input {
  padding: 15px;
  font-size: 16px;
  border: 2px solid #4ecdc4;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
}

.hybrid-result {
  margin-top: 40px;
}

.result-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.sprite-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.sprite-container img {
  max-width: 100%;
  max-height: 400px;
  image-rendering: pixelated;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hybrid-name {
  font-size: 36px;
  color: #ff6b6b;
  margin: 0;
}

.hybrid-id {
  font-size: 18px;
  color: #666;
  margin: 0;
}

.types {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.type-badge {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.type-火 { background: #F08030; }
.type-水 { background: #6890F0; }
.type-草 { background: #78C850; }
.type-电 { background: #F8D030; }
.type-超能力 { background: #F85888; }
.type-龙 { background: #7038F8; }
.type-恶 { background: #705848; }
.type-妖精 { background: #EE99AC; }

.abilities ul {
  list-style: none;
  padding: 0;
}

.abilities li {
  padding: 5px 0;
  color: #333;
}

.stat-grid {
  display: grid;
  gap: 10px;
}

.stat-item {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  align-items: center;
  gap: 10px;
}

.stat-bar {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #44a08d);
  transition: width 0.3s;
}

.actions {
  display: flex;
  gap: 10px;
}

.save-btn, .share-btn, .new-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
}

.save-btn {
  background: #4ecdc4;
  color: white;
}

.share-btn {
  background: #ff6b6b;
  color: white;
}

.new-btn {
  background: #f0f0f0;
  color: #333;
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
  z-index: 1000;
}

.pixel-loading {
  font-size: 24px;
  color: white;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@media (max-width: 768px) {
  .pokemon-selectors {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .user-input-section {
    grid-template-columns: 1fr;
  }
  
  .result-card {
    grid-template-columns: 1fr;
  }
}
</style>
