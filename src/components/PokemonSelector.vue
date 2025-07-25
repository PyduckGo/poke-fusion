<template>
  <div class="pokemon-selector">
    <div class="selector-header">
      <h4>{{ label }}</h4>
      <input
        v-model="searchQuery"
        placeholder="搜索宝可梦..."
        class="search-input"
      />
    </div>
    
    <div class="pokemon-grid">
      <div
        v-for="pokemon in filteredPokemon"
        :key="pokemon.id"
        class="pokemon-option"
        :class="{ selected: selected?.id === pokemon.id }"
        @click="$emit('select', pokemon)"
      >
        <img 
          :src="getPokemonSprite(pokemon)" 
          :alt="pokemon.name"
          class="pokemon-sprite"
        />
        <div class="pokemon-info">
          <span class="pokemon-name">{{ pokemon.name }}</span>
          <span class="pokemon-id">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
        </div>
        <div class="pokemon-types">
          <span 
            v-for="type in pokemon.type" 
            :key="type"
            class="type-tag"
            :class="`type-${type}`"
          >
            {{ type }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="selected" class="selected-display">
      <h5>已选择：</h5>
      <div class="selected-pokemon">
        <img :src="getPokemonSprite(selected)" :alt="selected.name" />
        <span>{{ selected.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Pokemon } from '../types/pokemon';
import { getAllPokemon } from '../data/pokemonData';

const props = defineProps<{
  selected?: Pokemon | null;
  label?: string;
}>();

const emit = defineEmits<{
  select: [pokemon: Pokemon];
}>();

const searchQuery = ref('');

const allPokemon = computed(() => getAllPokemon());

const filteredPokemon = computed(() => {
  if (!searchQuery.value) return allPokemon.value;
  
  const query = searchQuery.value.toLowerCase();
  return allPokemon.value.filter(pokemon => 
    pokemon.name.toLowerCase().includes(query) ||
    pokemon.english.toLowerCase().includes(query) ||
    pokemon.id.toString().includes(query)
  );
});

function getPokemonSprite(pokemon: Pokemon): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
}
</script>

<style scoped>
.pokemon-selector {
  max-width: 400px;
  margin: 0 auto;
}

.selector-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.selector-header h4 {
  margin: 0;
  color: #333;
}

.search-input {
  padding: 10px;
  border: 2px solid #4ecdc4;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.pokemon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.pokemon-option:hover {
  border-color: #4ecdc4;
  transform: translateY(-2px);
}

.pokemon-option.selected {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.pokemon-sprite {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}

.pokemon-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 5px 0;
}

.pokemon-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.pokemon-id {
  font-size: 12px;
  color: #666;
}

.pokemon-types {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.type-tag {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 10px;
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

.selected-display {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.selected-display h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.selected-pokemon {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-pokemon img {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

@media (max-width: 768px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
