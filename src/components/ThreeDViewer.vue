<template>
  <div class="three-d-viewer" ref="container">
    <div class="viewer-controls">
      <button @click="toggleRotation" class="control-btn">
        {{ isRotating ? '⏸️' : '▶️' }}
      </button>
      <button @click="resetView" class="control-btn">🔄</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

const props = defineProps<{
  spriteUrl?: string;
}>();

const container = ref<HTMLDivElement>();
const scene = ref<THREE.Scene>();
const renderer = ref<THREE.WebGLRenderer>();
const camera = ref<THREE.PerspectiveCamera>();
const cube = ref<THREE.Mesh>();
const isRotating = ref(true);

let animationId: number;

// 初始化3D场景
const initThreeJS = () => {
  if (!container.value) return;

  // 创建场景
  scene.value = new THREE.Scene();
  scene.value.background = new THREE.Color(0x87CEEB);

  // 创建相机
  camera.value = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.value.position.z = 2;

  // 创建渲染器
  renderer.value = new THREE.WebGLRenderer({ antialias: false });
  renderer.value.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.value.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.value.domElement);

  // 创建纹理
  const textureLoader = new THREE.TextureLoader();
  if (props.spriteUrl) {
    const texture = textureLoader.load(props.spriteUrl);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    // 创建材质
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    // 创建几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    cube.value = new THREE.Mesh(geometry, material);
    scene.value.add(cube.value);
  }

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.value.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(1, 1, 1);
  scene.value.add(directionalLight);

  animate();
};

// 动画循环
const animate = () => {
  if (!renderer.value || !scene.value || !camera.value) return;

  animationId = requestAnimationFrame(animate);

  if (cube.value && isRotating.value) {
    cube.value.rotation.x += 0.01;
    cube.value.rotation.y += 0.01;
  }

  renderer.value.render(scene.value, camera.value);
};

// 切换旋转
const toggleRotation = () => {
  isRotating.value = !isRotating.value;
};

// 重置视图
const resetView = () => {
  if (cube.value) {
    cube.value.rotation.x = 0;
    cube.value.rotation.y = 0;
    cube.value.rotation.z = 0;
  }
};

// 更新纹理
const updateTexture = (newUrl: string) => {
  if (!cube.value || !scene.value) return;

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(newUrl);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  cube.value.material = material;
};

// 处理窗口大小变化
const handleResize = () => {
  if (!container.value || !camera.value || !renderer.value) return;

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  camera.value.aspect = width / height;
  camera.value.updateProjectionMatrix();
  renderer.value.setSize(width, height);
};

// 监听spriteUrl变化
watch(() => props.spriteUrl, (newUrl) => {
  if (newUrl) {
    updateTexture(newUrl);
  }
});

onMounted(() => {
  initThreeJS();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', handleResize);
  if (renderer.value && container.value) {
    container.value.removeChild(renderer.value.domElement);
  }
});
</script>

<style scoped>
.three-d-viewer {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.viewer-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  z-index: 10;
}

.control-btn {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}
</style>
