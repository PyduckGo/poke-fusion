<template>
  <div class="fusion-result">
    <div class="result-header">
      <h2 class="fusion-name">#{{ fusion.id }} {{ fusion.name }}</h2>
      <div class="fusion-types">
        <span 
          v-for="type in fusion.types" 
          :key="type"
          class="type-badge"
          :class="`type-${type}`"
        >
          {{ getTypeName(type) }}
        </span>
      </div>
    </div>
    
    <div class="result-body">
      <div class="fusion-sprite-container">
        <img 
          :src="fusion.fusedSprite" 
          :alt="fusion.name"
          class="fusion-sprite pixelated"
        />
        
        <!-- 3D效果容器 -->
        <div ref="threeContainer" class="three-container"></div>
      </div>
      
      <div class="fusion-details">
        <div class="detail-section">
          <h3>融合信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>身高</label>
              <span>{{ (fusion.height / 10).toFixed(1) }}m</span>
            </div>
            <div class="detail-item">
              <label>体重</label>
              <span>{{ (fusion.weight / 10).toFixed(1) }}kg</span>
            </div>
            <div class="detail-item">
              <label>世代</label>
              <span>第{{ fusion.generation }}世代</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>能力</h3>
          <div class="abilities-list">
            <span 
              v-for="ability in fusion.abilities" 
              :key="ability"
              class="ability-tag"
            >
              {{ ability }}
            </span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>来源宝可梦</h3>
          <div class="source-pokemon">
            <div class="source-item">
              <img :src="fusion.pokemonA.sprites.front_default" :alt="fusion.pokemonA.name" />
              <span>{{ getPokemonName(fusion.pokemonA) }}</span>
            </div>
            <div class="fusion-plus">+</div>
            <div class="source-item">
              <img :src="fusion.pokemonB.sprites.front_default" :alt="fusion.pokemonB.name" />
              <span>{{ getPokemonName(fusion.pokemonB) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="result-actions">
      <button class="action-btn save-btn" @click="saveToPokedex">
        保存到图鉴
      </button>
      <button class="action-btn share-btn" @click="shareFusion">
        分享
      </button>
      <button class="action-btn cry-btn" @click="playCry">
        播放叫声
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Howl } from 'howler';
import type { FusionResult } from '../types';

interface Props {
  fusion: FusionResult;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [fusion: FusionResult];
  share: [fusion: FusionResult];
}>();

const threeContainer = ref<HTMLElement>();
let scene: any = null;
let renderer: any = null;
let animationId: number | null = null;

// 获取宝可梦中文名称
const getPokemonName = (pokemon: any): string => {
  const chineseName = pokemon.names?.find(
    (name: any) => name.language.name === 'zh-Hans'
  );
  return chineseName?.name || pokemon.name;
};

// 获取类型中文名称
const getTypeName = (typeName: string): string => {
  const typeMap: Record<string, string> = {
    normal: '一般', fire: '火', water: '水', electric: '电',
    grass: '草', ice: '冰', fighting: '格斗', poison: '毒',
    ground: '地面', flying: '飞行', psychic: '超能力', bug: '虫',
    rock: '岩石', ghost: '幽灵', dragon: '龙', dark: '恶',
    steel: '钢', fairy: '妖精'
  };
  return typeMap[typeName] || typeName;
};

// 保存到图鉴
const saveToPokedex = () => {
  emit('save', props.fusion);
};

// 分享融合
const shareFusion = () => {
  emit('share', props.fusion);
};

// 播放叫声
const playCry = () => {
  if (props.fusion.cryUrl) {
    const sound = new Howl({
      src: [props.fusion.cryUrl],
      volume: 0.5
    });
    sound.play();
  }
};

// 初始化3D效果
const init3DEffect = () => {
  if (!threeContainer.value) return;
  
  // 简化的3D旋转效果
  const container = threeContainer.value;
  let rotation = 0;
  
  const animate = () => {
    rotation += 0.01;
    container.style.transform = `rotateY(${rotation}rad)`;
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
};

// 清理
const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
};

onMounted(() => {
  init3DEffect();
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.fusion-result {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #0f3460;
  border-radius: 16px;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.result-header {
  text-align: center;
  margin-bottom: 24px;
}

.fusion-name {
  font-family: 'Press Start 2P', cursive;
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 12px;
}

.fusion-types {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.type-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.result-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 24px;
}

.fusion-sprite-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.fusion-sprite {
  width: 256px;
  height: 256px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.three-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.fusion-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section h3 {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #ffd700;
  margin-bottom: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 12px;
  color: #aaa;
}

.detail-item span {
  font-size: 14px;
  color: #fff;
  font-weight: bold;
}

.abilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ability-tag {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid #ffd700;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #ffd700;
}

.source-pokemon {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
}

.source-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.source-item img {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}

.source-item span {
  font-size: 12px;
  color: #fff;
}

.fusion-plus {
  font-size: 24px;
  color: #ffd700;
  font-weight: bold;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: #4caf50;
  color: white;
}

.share-btn {
  background: #2196f3;
  color: white;
}

.cry-btn {
  background: #ff9800;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

@media (max-width: 768px) {
  .result-body {
    grid-template-columns: 1fr;
  }
  
  .fusion-sprite {
    width: 192px;
    height: 192px;
  }
}
</style>
