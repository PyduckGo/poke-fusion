<template>
  <div class="three-container">
    <img 
      :src="spriteUrl" 
      :alt="'3D精灵'"
      class="three-sprite"
      :style="spriteStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  spriteUrl: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoRotate: true,
  rotationSpeed: 0.01
});

const rotation = ref(0);
let animationId: number | null = null;

const spriteStyle = computed(() => ({
  transform: `rotateY(${rotation.value}deg)`,
  transition: 'transform 0.1s linear'
}));

const animate = () => {
  if (props.autoRotate) {
    rotation.value += props.rotationSpeed * 180 / Math.PI;
    animationId = requestAnimationFrame(animate);
  }
};

onMounted(() => {
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #0f3460;
  border-radius: 12px;
}

.three-sprite {
  width: 200px;
  height: 200px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}
</style>
