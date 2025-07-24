<template>
  <button 
    class="fusion-button pixel-button"
    :class="{ 'loading': isLoading }"
    :disabled="isLoading"
    @click="handleFusion"
  >
    <div class="button-content">
      <span v-if="!isLoading" class="button-text">融合！</span>
      <span v-else class="loading-text">融合中...</span>
      
      <div class="button-glow"></div>
    </div>
    
    <!-- 粒子效果容器 -->
    <div ref="particleContainer" class="particle-container"></div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { gsap } from 'gsap';

interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const emit = defineEmits<{
  fusion: [];
}>();

const particleContainer = ref<HTMLElement>();

// 处理融合点击
const handleFusion = async () => {
  if (props.isLoading) return;
  
  // 触发融合事件
  emit('fusion');
  
  // 添加按钮动画
  if (particleContainer.value) {
    // 创建粒子效果
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #ffd700;
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      `;
      
      particleContainer.value.appendChild(particle);
      
      // GSAP动画
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => particle.remove()
      });
    }
  }
};
</script>

<style scoped>
.fusion-button {
  position: relative;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  border: none;
  border-radius: 12px;
  padding: 20px 40px;
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.fusion-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
}

.fusion-button:active:not(:disabled) {
  transform: translateY(0);
}

.fusion-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.fusion-button.loading {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 4px 25px rgba(255, 107, 107, 0.8);
  }
  100% {
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }
}

.button-content {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fusion-button:hover:not(:disabled) .button-glow {
  opacity: 1;
}

.loading-text {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pixel-button {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
