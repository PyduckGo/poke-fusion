<template>
  <div class="pokemon-manual-selector">
    <div class="selector-header">
      <h3 class="chinese-pixel">🎯 手动选择宝可梦</h3>
      <button @click="closeSelector" class="close-btn">×</button>
    </div>

    <div class="selector-content">
      <!-- 左侧：手动筛选器 -->
      <ManualPokemonFilter
        :target="target"
        @select="handlePokemonSelect"
      />
      
      <!-- 右侧：随机选择 -->
      <div class="random-section">
        <h4>🎲 随机选择</h4>
        <button @click="selectRandomPokemon" class="random-btn">
          随机选择宝可梦
        </button>
        
        <div class="generation-filters">
          <h5>按世代筛选：</h5>
          <div class="gen-buttons">
            <button 
              v-for="gen in [1, 2, 3]" 
              :key="gen"
              @click="selectRandomFromGeneration(gen)"
              class="gen-btn"
            >
              第{{ gen }}世代
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ManualPokemonFilter from './ManualPokemonFilter.vue';
import { getRandomPokemon, getRandomPokemonPair, getPokemonByGeneration } from '../data/pokemonData';
import type { Pokemon } from '../data/pokemonData';

const props = defineProps<{
  target: 'A' | 'B';
  isOpen: boolean;
}>();

const emit = defineEmits<{
  select: [pokemon: Pokemon, target: 'A' | 'B'];
  close: [];
}>();

// 处理宝可梦选择
const handlePokemonSelect = (pokemon: Pokemon, target: 'A' | 'B') => {
  emit('select', pokemon, target);
  emit('close');
};

// 关闭选择器
const closeSelector = () => {
  emit('close');
};

// 随机选择
const selectRandomPokemon = () => {
  const pokemon = getRandomPokemon();
  handlePokemonSelect(pokemon, props.target);
};

// 从特定世代随机选择
const selectRandomFromGeneration = (generation: number) => {
  const pokemonList = getPokemonByGeneration(generation);
  const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
  handlePokemonSelect(randomPokemon, props.target);
};
</script>

<style scoped>
.pokemon-manual-selector {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  border: 3px solid #333;
  border-radius: 15px;
  padding: 20px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #333;
}

.selector-header h3 {
  margin: 0;
  font-family: 'Courier New', monospace;
  color: #333;
}

.close-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
}

.selector-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.random-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.random-section h4 {
  margin: 0 0 15px 0;
  font-family: 'Courier New', monospace;
  color: #333;
}

.random-btn, .gen-btn {
  width: 100%;
  padding: 12px;
  margin: 5px 0;
  background: #4ecdc4;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all 0.2s;
}

.random-btn:hover, .gen-btn:hover {
  background: #45b7b8;
  transform: translateY(-2px);
}

.generation-filters {
  margin-top: 20px;
}

.generation-filters h5 {
  margin: 0 0 10px 0;
  font-family: 'Courier New', monospace;
  color: #333;
}

.gen-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

@media (max-width: 768px) {
  .selector-content {
    grid-template-columns: 1fr;
  }
  
  .pokemon-manual-selector {
    max-width: 95%;
    max-height: 90vh;
  }
}
</style>
