<template>
  <div class="user-photo-fusion">
    <h3 class="pixel-title">🎭 彩蛋：用户照片融合</h3>
    
    <div class="upload-section">
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileUpload" 
        accept="image/*"
        class="hidden-input"
      />
      <button @click="triggerFileUpload" class="pixel-btn upload-btn">
        📸 选择你的照片
      </button>
      
      <div v-if="userPhoto" class="preview-section">
        <img :src="userPhoto" alt="用户照片" class="user-photo-preview" />
        
        <!-- 手动选择宝可梦区域 -->
        <div class="pokemon-selection">
          <h4>🎯 选择要融合的宝可梦</h4>
          
          <!-- 搜索和筛选 -->
          <div class="selection-controls">
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              placeholder="搜索宝可梦名称..."
              class="search-input"
            />
            <select v-model="selectedGeneration" @change="filterByGeneration" class="gen-select">
              <option value="">所有世代</option>
              <option value="1">第1世代</option>
              <option value="2">第2世代</option>
              <option value="3">第3世代</option>
            </select>
            <button @click="selectRandomPokemon" class="random-btn">
              🎲 随机选择
            </button>
          </div>

          <!-- 宝可梦列表 -->
          <div class="pokemon-grid">
            <div 
              v-for="pokemon in displayedPokemon" 
              :key="pokemon.id"
              class="pokemon-option"
              :class="{ selected: selectedPokemon?.id === pokemon.id }"
              @click="selectPokemon(pokemon)"
            >
              <img 
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`" 
                :alt="pokemon.name"
                class="pokemon-sprite"
              />
              <div class="pokemon-info">
                <span class="pokemon-number">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
                <span class="pokemon-name">{{ pokemon.name }}</span>
                <div class="pokemon-types">
                  <span 
                    v-for="type in pokemon.type" 
                    :key="type"
                    class="type-badge"
                    :class="`type-${type}`"
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

        <input 
          v-model="fusionName" 
          type="text" 
          placeholder="给你的融合宝可梦起个名字"
          class="name-input"
          maxlength="20"
        />
        
        <button 
          @click="createUserFusion" 
          :disabled="!selectedPokemon || !fusionName || isFusing"
          class="pixel-btn fusion-btn"
        >
          <span v-if="!isFusing">🎨 开始融合</span>
          <span v-else>融合中...</span>
        </button>
      </div>
      
      <div v-if="fusionResult" class="result-section">
        <h4>融合结果</h4>
        <p class="fusion-name-display">{{ generatedName }}</p>
        <img :src="fusionResult" alt="融合结果" class="fusion-result-img" />
        
        <div class="share-section">
          <button @click="saveResult" class="pixel-btn save-btn">
            💾 保存图片
          </button>
          <button @click="shareResult" class="pixel-btn share-btn">
            📤 分享结果
          </button>
          <button @click="reset" class="pixel-btn reset-btn">
            🔄 重新开始
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createUserPokemonFusion, saveFusionImage } from '../utils/userPhotoFusion';
import { pokemonData } from '../data/pokemonData';
import type { Pokemon } from '../data/pokemonData';

// 状态
const fileInput = ref<HTMLInputElement>();
const userPhoto = ref<string>('');
const selectedPokemon = ref<Pokemon | null>(null);
const fusionResult = ref<string>('');
const isFusing = ref(false);
const fusionName = ref<string>('');
const searchQuery = ref('');
const selectedGeneration = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;

// 计算属性
const generatedName = computed(() => {
  if (!selectedPokemon.value || !fusionName.value) return '';
  return `${fusionName.value}·${selectedPokemon.value.name}`;
});

const filteredPokemon = computed(() => {
  let filtered = pokemonData;

  // 文本搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(pokemon => 
      pokemon.name.toLowerCase().includes(query) || 
      pokemon.english.toLowerCase().includes(query) || 
      pokemon.id.toString() === query
    );
  }

  // 世代筛选
  if (selectedGeneration.value) {
    const gen = parseInt(selectedGeneration.value);
    filtered = filtered.filter(pokemon => pokemon.generation === gen);
  }

  return filtered;
});

const totalPages = computed(() => 
  Math.ceil(filteredPokemon.value.length / itemsPerPage)
);

const displayedPokemon = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPokemon.value.slice(start, end);
});

// 方法
const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      userPhoto.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
};

const filterByGeneration = () => {
  currentPage.value = 1;
};

const selectRandomPokemon = () => {
  const randomIndex = Math.floor(Math.random() * filteredPokemon.value.length);
  selectedPokemon.value = filteredPokemon.value[randomIndex];
};

const selectPokemon = (pokemon: Pokemon) => {
  selectedPokemon.value = pokemon;
};

const createUserFusion = async () => {
  if (!userPhoto.value || !selectedPokemon.value || !fusionName.value) return;
  
  isFusing.value = true;
  
  try {
    fusionResult.value = await createUserPokemonFusion(
      userPhoto.value,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.value.id}.png`,
      {
        intensity: 0.8,
        preserveDetails: true
      }
    );
  } catch (error) {
    console.error('用户融合失败:', error);
  } finally {
    isFusing.value = false;
  }
};

const saveResult = () => {
  if (!fusionResult.value || !selectedPokemon.value) return;
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${fusionName.value}-${selectedPokemon.value.name}-${timestamp}.png`;
  saveFusionImage(fusionResult.value, filename);
};

const shareResult = async () => {
  if (!fusionResult.value || !selectedPokemon.value) return;
  
  try {
    const response = await fetch(fusionResult.value);
    const blob = await response.blob();
    
    if (navigator.share && navigator.canShare({ files: [new File([blob], 'fusion.png', { type: 'image/png' })] })) {
      await navigator.share({
        title: '我的宝可梦融合',
        text: `我用 ${selectedPokemon.value.name} 创造了 ${fusionName.value}！`,
        files: [new File([blob], 'fusion.png', { type: 'image/png' })]
      });
    } else {
      saveResult();
    }
  } catch (error) {
    console.error('分享失败:', error);
    saveResult();
  }
};

const reset = () => {
  userPhoto.value = '';
  selectedPokemon.value = null;
  fusionResult.value = '';
  fusionName.value = '';
  searchQuery.value = '';
  selectedGeneration.value = '';
  currentPage.value = 1;
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

onMounted(() => {
  // 初始化
});
</script>
