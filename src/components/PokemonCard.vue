<template>
  <div class="pokemon-card pixel-border">
    <div class="card-header">
      <span class="pokemon-id">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
      <span class="pokemon-name">{{ getDisplayName }}</span>
    </div>
    
    <div class="card-body">
      <img 
        :src="pokemon.sprites.front_default" 
        :alt="pokemon.name"
        class="pokemon-sprite"
        :class="{ 'pixelated': true }"
      />
      
      <div class="pokemon-types">
        <span 
          v-for="type in pokemon.types" 
          :key="type.type.name"
          class="type-badge"
          :class="`type-${type.type.name}`"
        >
          {{ getTypeName(type.type.name) }}
        </span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="stat-row">
        <span>身高: {{ (pokemon.height / 10).toFixed(1) }}m</span>
        <span>体重: {{ (pokemon.weight / 10).toFixed(1) }}kg</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Pokemon } from '../types';

interface Props {
  pokemon: Pokemon;
}

const props = defineProps<Props>();

// 获取显示名称（优先中文）
const getDisplayName = computed(() => {
  const chineseName = props.pokemon.names?.find(
    name => name.language?.name === 'zh-Hans'
  );
  return chineseName?.name || props.pokemon.name;
});

// 获取中文类型名称
const getTypeName = (typeName: string): string => {
  const typeMap: Record<string, string> = {
    normal: '一般',
    fire: '火',
    water: '水',
    electric: '电',
    grass: '草',
    ice: '冰',
    fighting: '格斗',
    poison: '毒',
    ground: '地面',
    flying: '飞行',
    psychic: '超能力',
    bug: '虫',
    rock: '岩石',
    ghost: '幽灵',
    dragon: '龙',
    dark: '恶',
    steel: '钢',
    fairy: '妖精'
  };
  return typeMap[typeName] || typeName;
};
</script>

<style scoped>
.pokemon-card {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #444;
  border-radius: 8px;
  padding: 16px;
  width: 200px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.pokemon-card:hover {
  transform: translateY(-4px);
}

.pixel-border {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pokemon-id {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: #ffd700;
}

.pokemon-name {
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  color: #fff;
  text-transform: capitalize;
}

.card-body {
  text-align: center;
}

.pokemon-sprite {
  width: 96px;
  height: 96px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  margin-bottom: 8px;
}

.pokemon-types {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.type-normal { background-color: #a8a878; color: #fff; }
.type-fire { background-color: #f08030; color: #fff; }
.type-water { background-color: #6890f0; color: #fff; }
.type-electric { background-color: #f8d030; color: #000; }
.type-grass { background-color: #78c850; color: #fff; }
.type-ice { background-color: #98d8d8; color: #000; }
.type-fighting { background-color: #c03028; color: #fff; }
.type-poison { background-color: #a040a0; color: #fff; }
.type-ground { background-color: #e0c068; color: #000; }
.type-flying { background-color: #a890f0; color: #fff; }
.type-psychic { background-color: #f85888; color: #fff; }
.type-bug { background-color: #a8b820; color: #fff; }
.type-rock { background-color: #b8a038; color: #fff; }
.type-ghost { background-color: #705898; color: #fff; }
.type-dragon { background-color: #7038f8; color: #fff; }
.type-dark { background-color: #705848; color: #fff; }
.type-steel { background-color: #b8b8d0; color: #000; }
.type-fairy { background-color: #ee99ac; color: #fff; }

.card-footer {
  margin-top: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #ccc;
}

.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
