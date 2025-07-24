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
        
        <select v-model="selectedPokemon" class="pokemon-select">
          <option value="">选择要融合的宝可梦</option>
          <option v-for="pokemon in availablePokemon" :key="pokemon.id" :value="pokemon">
            {{ getChineseName(pokemon) }}
          </option>
        </select>
        
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
import { ref, computed } from 'vue';
import { createUserPokemonFusion, saveFusionImage } from '../utils/userPhotoFusion';
import { getChineseName } from '../utils/pokemonApi';
import type { Pokemon } from '../types';

// 状态
const fileInput = ref<HTMLInputElement>();
const userPhoto = ref<string>('');
const selectedPokemon = ref<Pokemon | null>(null);
const fusionResult = ref<string>('');
const isFusing = ref(false);
const fusionName = ref<string>('');

// 模拟可用宝可梦
const availablePokemon = ref<Pokemon[]>([]);

// 生成的融合名称
const generatedName = computed(() => {
  if (!selectedPokemon.value || !fusionName.value) return '';
  return `${fusionName.value}·${getChineseName(selectedPokemon.value)}`;
});

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click();
};

// 处理文件上传
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

// 创建用户融合
const createUserFusion = async () => {
  if (!userPhoto.value || !selectedPokemon.value || !fusionName.value) return;
  
  isFusing.value = true;
  
  try {
    fusionResult.value = await createUserPokemonFusion(
      userPhoto.value,
      selectedPokemon.value.sprites.front_default,
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

// 保存结果
const saveResult = () => {
  if (!fusionResult.value || !selectedPokemon.value) return;
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${fusionName.value}-${getChineseName(selectedPokemon.value)}-${timestamp}.png`;
  saveFusionImage(fusionResult.value, filename);
};

// 分享结果
const shareResult = async () => {
  if (!fusionResult.value || !selectedPokemon.value) return;
  
  try {
    const response = await fetch(fusionResult.value);
    const blob = await response.blob();
    
    if (navigator.share && navigator.canShare({ files: [new File([blob], 'fusion.png', { type: 'image/png' })] })) {
      await navigator.share({
        title: '我的宝可梦融合',
        text: `我用 ${getChineseName(selectedPokemon.value)} 创造了 ${fusionName.value}！`,
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

// 重置
const reset = () => {
  userPhoto.value = '';
  selectedPokemon.value = null;
  fusionResult.value = '';
  fusionName.value = '';
};

// 加载示例宝可梦
const loadSamplePokemon = async () => {
  try {
    const { getRandomPokemon } = await import('../utils/pokemonApi');
    const promises = [];
    for (let i = 0; i < 12; i++) {
      promises.push(getRandomPokemon());
    }
    availablePokemon.value = await Promise.all(promises);
  } catch (error) {
    console.error('加载示例宝可梦失败:', error);
  }
};

loadSamplePokemon();
</script>

<style scoped>
.user-photo-fusion {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #ff6b6b;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.pixel-title {
  font-family: 'Courier New', monospace;
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hidden-input {
  display: none;
}

.upload-btn {
  background: #4ecdc4;
  color: white;
  padding: 15px 30px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.user-photo-preview {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #fff;
  image-rendering: pixelated;
}

.pokemon-select {
  padding: 10px;
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: monospace;
  min-width: 200px;
}

.name-input {
  padding: 10px;
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: monospace;
  min-width: 200px;
  text-align: center;
}

.fusion-btn {
  background: #ff6b6b;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fusion-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.fusion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-section {
  text-align: center;
}

.fusion-name-display {
  font-family: 'ZCOOL QingKe HuangYou', monospace;
  font-size: 24px;
  color: #ff6b6b;
  margin: 10px 0;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
}

.fusion-result-img {
  width: 256px;
  height: 256px;
  image-rendering: pixelated;
  border: 3px solid #fff;
  border-radius: 12px;
  margin: 10px 0;
}

.share-section {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.save-btn, .share-btn, .reset-btn {
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.save-btn {
  background: #27ae60;
}

.share-btn {
  background: #9b59b6;
}

.reset-btn {
  background: #e74c3c;
}

.save-btn:hover, .share-btn:hover, .reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .user-photo-preview {
    width: 120px;
    height: 120px;
  }
  
  .fusion-result-img {
    width: 200px;
    height: 200px;
  }
  
  .share-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>
