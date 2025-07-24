<template>
  <div class="pokemon-search">
    <div class="search-header">
      <h3 class="chinese-pixel">🔍 宝可梦搜索</h3>
      <div class="search-controls">
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          placeholder="输入宝可梦名称或编号..."
          class="search-input"
        />
        <button @click="clearSearch" class="clear-btn">清空</button>
      </div>
    </div>

    <div class="search-results">
      <div 
        v-for="pokemon in searchResults" 
        :key="pokemon.id"
        class="search-item"
        @click="selectPokemon(pokemon)"
      >
        <img :src="pokemon.sprites.front_default" :alt="getPokemonName(pokemon)" />
        <div class="pokemon-info">
          <span class="pokemon-number">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
          <span class="pokemon-name">{{ getPokemonName(pokemon) }}</span>
          <div class="pokemon-types">
            <span 
              v-for="type in pokemon.types" 
              :key="type.type.name"
              class="type-badge"
              :class="`type-${type.type.name}`"
            >
              {{ getTypeChinese(type.type.name) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="searchResults.length === 0 && searchQuery" class="no-results">
      <p>未找到匹配的宝可梦</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Pokemon } from '../types';
import { getChineseName, getTypeChinese } from '../utils/pokemonApi';

const props = defineProps<{
  allPokemon: Pokemon[];
  target: 'A' | 'B';
}>();

const emit = defineEmits<{
  select: [pokemon: Pokemon, target: 'A' | 'B'];
}>();

const searchQuery = ref('');

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];
  
  const query = searchQuery.value.toLowerCase();
  
  return props.allPokemon.filter(pokemon => {
    const chineseName = getChineseName(pokemon).toLowerCase();
    const englishName = pokemon.name.toLowerCase();
    const id = pokemon.id.toString();
    
    return chineseName.includes(query) || 
           englishName.includes(query) || 
           id === query;
  }).slice(0, 20); // 限制显示20个结果
});

const handleSearch = () => {
  // 防抖处理
};

const clearSearch = () => {
  searchQuery.value = '';
};

const selectPokemon = (pokemon: Pokemon) => {
  emit('select', pokemon, props.target);
};

const getPokemonName = (pokemon: Pokemon) => {
  return getChineseName(pokemon);
};
</script>

<style scoped>
.pokemon-search {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-header {
  margin-bottom: 15px;
}

.search-header h3 {
  margin: 0 0 10px 0;
  font-family: 'Courier New', monospace;
  color: #333;
}

.search-controls {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 2px solid #333;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.clear-btn {
  padding: 10px 15px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  cursor: pointer;
}

.clear-btn:hover {
  background: #ff5252;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-item:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.search-item img {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}

.pokemon-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pokemon-number {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
}

.pokemon-name {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.pokemon-types {
  display: flex;
  gap: 5px;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
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

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .pokemon-search {
    max-height: 300px;
  }
}
</style>
