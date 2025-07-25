<template>
  <div class="user-photo-fusion">
    <div class="section-header">
      <h3 class="pixel-title">🎭 彩蛋：用户照片融合</h3>
      <p class="pixel-subtitle">上传你的照片，与宝可梦融合创造独一无二的精灵！</p>
    </div>
    
    <div class="fusion-container">
      <!-- 左侧：用户照片上传 -->
      <div class="upload-panel">
        <div class="upload-area" :class="{ 'has-image': userPhoto }">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            accept="image/*"
            class="hidden-input"
          />
          
          <div v-if="!userPhoto" class="upload-placeholder" @click="triggerFileUpload">
            <div class="upload-icon">📸</div>
            <p class="upload-text">点击上传照片</p>
            <p class="upload-hint">支持 JPG、PNG 格式</p>
          </div>
          
          <div v-else class="photo-preview">
            <img :src="userPhoto" alt="用户照片" class="user-photo" />
            <button @click="removePhoto" class="remove-btn">×</button>
          </div>
        </div>
        
        <div v-if="userPhoto" class="name-input-section">
          <input 
            v-model="fusionName" 
            type="text" 
            placeholder="给你的融合宝可梦起个名字"
            class="pixel-input name-input"
            maxlength="20"
          />
        </div>
      </div>

      <!-- 右侧：宝可梦选择 -->
      <div class="pokemon-selection-panel">
        <div class="selection-header">
          <h4>🎯 选择融合宝可梦</h4>
          <button @click="selectRandomPokemon" class="pixel-btn random-btn">
            🎲 随机
          </button>
        </div>
        
        <!-- 搜索和筛选 -->
        <div class="filter-controls">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              placeholder="搜索宝可梦..."
              class="pixel-input search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          
          <select v-model="selectedGeneration" @change="filterByGeneration" class="pixel-select gen-select">
            <option value="">全部世代</option>
            <option value="1">第1世代</option>
            <option value="2">第2世代</option>
            <option value="3">第3世代</option>
          </select>
        </div>

        <!-- 宝可梦网格 -->
        <div class="pokemon-grid-container">
          <div class="pokemon-grid">
            <div 
              v-for="pokemon in displayedPokemon" 
              :key="pokemon.id"
              class="pokemon-card"
              :class="{ selected: selectedPokemon?.id === pokemon.id }"
              @click="selectPokemon(pokemon)"
            >
              <div class="sprite-container">
                <img 
                  :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`" 
                  :alt="pokemon.name"
                  class="pokemon-sprite"
                />
              </div>
              <div class="pokemon-details">
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
              class="pixel-btn page-btn"
            >
              ←
            </button>
            <span class="page-info">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="pixel-btn page-btn"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 融合按钮 -->
    <div v-if="userPhoto && selectedPokemon && fusionName" class="fusion-action">
      <button 
        @click="createUserFusion" 
        :disabled="isFusing"
        class="pixel-btn primary-fusion-btn"
      >
        <span v-if="!isFusing">🎨 开始融合</span>
        <span v-else>融合中...</span>
      </button>
    </div>

    <!-- 融合结果 -->
    <div v-if="fusionResult" class="result-section">
      <div class="result-header">
        <h4>融合完成！</h4>
        <p class="result-name">{{ generatedName }}</p>
      </div>
      
      <div class="result-display">
        <img :src="fusionResult" alt="融合结果" class="fusion-result-img" />
        
        <div class="result-actions">
          <button @click="saveResult" class="pixel-btn save-btn">
            💾 保存图片
          </button>
          <button @click="shareResult" class="pixel-btn share-btn">
            📤 分享
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
const itemsPerPage = 12;

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

const removePhoto = () => {
  userPhoto.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
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

<style scoped>
.user-photo-fusion {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'ZCOOL QingKe HuangYou', 'Courier New', monospace;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.pixel-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
}

.pixel-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.fusion-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

/* 上传面板样式 */
.upload-panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.upload-area {
  position: relative;
  width: 100%;
  height: 300px;
  border: 3px dashed #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area.has-image {
  border-style: solid;
  border-color: #4ecdc4;
}

.upload-placeholder {
  text-align: center;
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-photo {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name-input-section {
  margin-top: 20px;
}

/* 宝可梦选择面板样式 */
.pokemon-selection-panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.selection-header h4 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.filter-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px 35px 10px 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.gen-select {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  background: white;
}

.pokemon-grid-container {
  max-height: 400px;
  overflow-y: auto;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.pokemon-card {
  background: white;
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pokemon-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pokemon-card.selected {
  border-color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
}

.sprite-container {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.pokemon-sprite {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

.pokemon-details {
  flex: 1;
}

.pokemon-number {
  font-size: 12px;
  color: #666;
  display: block;
}

.pokemon-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.pokemon-types {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  color: white;
}

/* 类型颜色 */
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
  margin-top: 20px;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 像素化按钮样式 */
.pixel-btn {
  font-family: 'ZCOOL QingKe HuangYou', 'Courier New', monospace;
  font-weight: bold;
  border: 2px solid #000;
  background: #ff6b6b;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.1s;
  box-shadow: 3px 3px 0px #000;
  font-size: 14px;
}

.pixel-btn:hover:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px #000;
}

.pixel-btn:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #000;
}

.pixel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pixel-input {
  font-family: 'ZCOOL QingKe HuangYou', 'Courier New', monospace;
  border: 2px solid #000;
  background: white;
  color: #333;
  padding: 10px;
  width: 100%;
  box-shadow: 3px 3px 0px #000;
}

.pixel-select {
  font-family: 'ZCOOL QingKe HuangYou', 'Courier New', monospace;
  border: 2px solid #000;
  background: white;
  color: #333;
  padding: 10px;
  box-shadow: 3px 3px 0px #000;
}

/* 融合按钮区域 */
.fusion-action {
  text-align: center;
  margin: 40px 0;
}

.primary-fusion-btn {
  font-size: 20px;
  padding: 15px 40px;
  background: #4ecdc4;
}

/* 结果区域 */
.result-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.result-header h4 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.result-name {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 20px;
}

.result-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.fusion-result-img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  image-rendering: pixelated;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.save-btn {
  background: #4ecdc4;
}

.share-btn {
  background: #667eea;
}

.reset-btn {
  background: #ff6b6b;
}

.hidden-input {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fusion-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .pokemon-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .result-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
