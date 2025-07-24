<template>
  <div class="manual-pokemon-filter">
    <div class="filter-header">
      <h3 class="chinese-pixel">🔍 宝可梦手动筛选</h3>
      <div class="filter-controls">
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          placeholder="输入宝可梦名称、编号或类型..."
          class="search-input"
        />
        <select v-model="selectedType" @change="handleTypeFilter" class="type-select">
          <option value="">所有类型</option>
          <option v-for="type in availableTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <button @click="clearFilters" class="clear-btn">清空</button>
      </div>
    </div>

    <!-- 快速筛选按钮 -->
    <div class="quick-filters">
      <button 
        v-for="range in idRanges" 
        :key="range.label"
        @click="filterByRange(range)"
        class="range-btn"
        :class="{ active: currentRange === range.label }"
      >
        {{ range.label }}
      </button>
    </div>

    <!-- 结果列表 -->
    <div class="results-container">
      <div class="results-header">
        <span>找到 {{ filteredPokemon.length }} 个宝可梦</span>
        <div class="sort-controls">
          <select v-model="sortBy" @change="handleSort" class="sort-select">
            <option value="id">按编号排序</option>
            <option value="name">按名称排序</option>
            <option value="type">按类型排序</option>
          </select>
        </div>
      </div>

      <div class="pokemon-grid">
        <div 
          v-for="pokemon in paginatedResults" 
          :key="pokemon.id"
          class="pokemon-card"
          @click="selectPokemon(pokemon)"
          :class="{ selected: isSelected(pokemon) }"
        >
          <img 
            :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`" 
            :alt="pokemon.name"
            class="pokemon-sprite"
          />
          <div class="pokemon-details">
            <span class="pokemon-number">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
            <span class="pokemon-name">{{ pokemon.name }}</span>
            <span class="pokemon-english">{{ pokemon.english }}</span>
            <div class="pokemon-types">
              <span 
                v-for="type in pokemon.type" 
                :key="type"
                class="type-badge"
                :class="`type-${type.toLowerCase()}`"
              >
                {{ type }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 已选择显示 -->
    <div v-if="selectedPokemon" class="selected-display">
      <h4>已选择：</h4>
      <div class="selected-card">
        <img 
          :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`" 
          :alt="selectedPokemon.name"
        />
        <div>
          <strong>{{ selectedPokemon.name }}</strong>
          <span>#{{ selectedPokemon.id.toString().padStart(3, '0') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { pokemonData, getAllTypes } from '../data/pokemonData';

interface Pokemon {
  id: number;
  name: string;
  english: string;
  type: string[];
  generation: number;
}

const props = defineProps<{
  target: 'A' | 'B';
}>();

const emit = defineEmits<{
  select: [pokemon: Pokemon, target: 'A' | 'B'];
}>();

// 状态管理
const searchQuery = ref('');
const selectedType = ref('');
const currentRange = ref('全部');
const sortBy = ref('id');
const currentPage = ref(1);
const selectedPokemon = ref<Pokemon | null>(null);
const itemsPerPage = 6;

// 数据
const allPokemon = ref(pokemonData);

// 计算属性
const availableTypes = computed(() => {
  return getAllTypes();
});

const idRanges = [
  { label: '全部', min: 1, max: 1000 },
  { label: '1-50', min: 1, max: 50 },
  { label: '51-100', min: 51, max: 100 },
  { label: '101-151', min: 101, max: 151 },
  { label: '152-251', min: 152, max: 251 },
  { label: '252-386', min: 252, max: 386 }
];

const filteredPokemon = computed(() => {
  let filtered = allPokemon.value;

  // 文本搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(pokemon => 
      pokemon.name.toLowerCase().includes(query) || 
      pokemon.english.toLowerCase().includes(query) || 
      pokemon.id.toString() === query
    );
  }

  // 类型筛选
  if (selectedType.value) {
    filtered = filtered.filter(pokemon => 
      pokemon.type.includes(selectedType.value)
    );
  }

  // 范围筛选
  const range = idRanges.find(r => r.label === currentRange.value);
  if (range && range.label !== '全部') {
    filtered = filtered.filter(pokemon => 
      pokemon.id >= range.min && pokemon.id <= range.max
    );
  }

  // 排序
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type[0].localeCompare(b.type[0]);
      default:
        return a.id - b.id;
    }
  });

  return filtered;
});

const totalPages = computed(() => 
  Math.ceil(filteredPokemon.value.length / itemsPerPage)
);

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPokemon.value.slice(start, end);
});

// 方法
const handleSearch = () => {
  currentPage.value = 1;
};

const handleTypeFilter = () => {
  currentPage.value = 1;
};

const handleSort = () => {
  currentPage.value = 1;
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedType.value = '';
  currentRange.value = '全部';
  currentPage.value = 1;
  selectedPokemon.value = null;
};

const filterByRange = (range: { label: string }) => {
  currentRange.value = range.label;
  currentPage.value = 1;
};

const selectPokemon = (pokemon: Pokemon) => {
  selectedPokemon.value = pokemon;
  emit('select', pokemon, props.target);
};

const isSelected = (pokemon: Pokemon) => {
  return selectedPokemon.value?.id === pokemon.id;
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 生命周期
onMounted(() => {
  // 初始化
});
</script>

<style scoped>
.manual-pokemon-filter {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.filter-header {
  margin-bottom: 15px;
}

.filter-header h3 {
  margin: 0 0 10px 0;
  font-family: 'Courier New', monospace;
  color: #333;
}

.filter-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input, .type-select, .sort-select {
  padding: 8px 12px;
  border: 2px solid #333;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.search-input {
  flex: 1;
  min-width: 150px;
}

.quick-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.range-btn, .page-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 2px solid #333;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn:hover, .page-btn:hover:not(:disabled) {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.range-btn.active {
  background: #ff6b6b;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-container {
  margin-bottom: 15px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.pokemon-card {
  background: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.pokemon-card:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.pokemon-card.selected {
  border-color: #ff6b6b;
  background: #ffe0e0;
}

.pokemon-sprite {
  width: 96px;
  height: 96px;
  image-rendering: pixelated;
  margin-bottom: 10px;
}

.pokemon-details {
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

.pokemon-english {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #888;
}

.pokemon-types {
  display: flex;
  gap: 5px;
  justify-content: center;
  flex-wrap: wrap;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  color: white;
}

.type-一般 { background: #A8A878; }
.type-火 { background: #F08030; }
.type-水 { background: #6890F0; }
.type-电 { background: #F8D030; }
.type-草 { background: #78C850; }
.type-冰 { background: #98D8D8; }
.type-格斗 { background: #C03028; }
.type-毒 { background: #A040A0; }
.type-地面 { background: #E0C068; }
.type-飞行 { background: #A890F0; }
.type-超能力 { background: #F85888; }
.type-虫 { background: #A8B820; }
.type-岩石 { background: #B8A038; }
.type-幽灵 { background: #705898; }
.type-龙 { background: #7038F8; }
.type-恶 { background: #705848; }
.type-钢 { background: #B8B8D0; }
.type-妖精 { background: #EE99AC; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.page-info {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.selected-display {
  margin-top: 15px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 8px;
  text-align: center;
}

.selected-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.selected-card img {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

@media (max-width: 768px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .filter-controls {
    flex-direction: column;
  }
}
</style>
