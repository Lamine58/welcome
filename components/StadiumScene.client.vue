<template>
  <div class="stadium">
    <canvas ref="canvasRef" class="stadium__canvas" />
    <div v-if="ready" class="stadium__hint">
      <kbd>Glisser</kbd> tourner · <kbd>Molette</kbd> zoom
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildFloodlights, buildFootballPitch, buildStands } from '~/utils/stadiumBuild'
import { disposeObject3D } from '~/utils/threeDispose'

const emit = defineEmits<{ ready: [] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationId = 0
let disposed = false
let resizeHandler: (() => void) | null = null
const loadedTextures: THREE.Texture[] = []

function init() {
  const canvas = canvasRef.value
  if (!canvas || disposed) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a2838)
  scene.fog = new THREE.Fog(0x1a2838, 22, 55)

  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80)
  camera.position.set(0, 7.5, 11)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.shadowMap.enabled = true

  controls = new OrbitControls(camera, canvas)
  controls.target.set(0, 0, 0)
  controls.enablePan = false
  controls.minDistance = 5
  controls.maxDistance = 22
  controls.minPolarAngle = 0.35
  controls.maxPolarAngle = Math.PI / 2.15
  controls.enableDamping = true
  controls.dampingFactor = 0.06

  scene.add(new THREE.AmbientLight(0xdde8ff, 0.35))
  const sun = new THREE.DirectionalLight(0xfff4e0, 0.75)
  sun.position.set(6, 14, 8)
  sun.castShadow = true
  scene.add(sun)

  const stadium = new THREE.Group()
  scene.add(stadium)

  buildFootballPitch(stadium, loadedTextures)
  buildStands(stadium)
  buildFloodlights(stadium)

  resizeHandler = () => {
    if (!renderer || !camera) return
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)

  const animate = () => {
    if (disposed) return
    animationId = requestAnimationFrame(animate)
    controls?.update()
    renderer?.render(scene!, camera!)
  }
  animate()

  ready.value = true
  emit('ready')
}

onMounted(() => {
  nextTick(init)
})

onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(animationId)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  controls?.dispose()
  if (scene) disposeObject3D(scene)
  loadedTextures.forEach((t) => t.dispose())
  loadedTextures.length = 0
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  controls = null
})
</script>

<style scoped>
.stadium {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #1a2838;
}

.stadium__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.stadium__hint {
  position: fixed;
  left: 50%;
  bottom: 5.5rem;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  font-size: 0.75rem;
  color: #f5ebe0;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  pointer-events: none;
}

.stadium__hint kbd {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  font-family: var(--mono);
  font-size: 0.68rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

@media (max-width: 640px) {
  .stadium__hint {
    display: none;
  }
}
</style>
