<template>
  <section class="swipe-scene">
    <canvas ref="canvasRef" class="swipe-scene__canvas" />

    <div
      class="swipe-scene__touch-layer"
      :class="{ 'swipe-scene__touch-layer--locked': inputLocked }"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @click="onTap"
    />

    <footer class="swipe-scene__controls" v-if="!inputLocked">
      <button type="button" class="swipe-btn" @click="prevCard" aria-label="Porte precedente">
        <i class="bi bi-chevron-left" />
      </button>
      <div class="swipe-dots">
        <button
          v-for="(_, i) in doors"
          :key="i"
          type="button"
          class="swipe-dot"
          :class="{ 'swipe-dot--active': i === activeIndex }"
          @click="setActive(i)"
          :aria-label="`Aller a la porte ${i + 1}`"
        />
      </div>
      <button type="button" class="swipe-btn" @click="nextCard" aria-label="Porte suivante">
        <i class="bi bi-chevron-right" />
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import type { ApartmentDoor } from '~/composables/usePortfolioData'

const props = defineProps<{
  doors: ApartmentDoor[]
  inputLocked?: boolean
}>()

const emit = defineEmits<{
  doorOpen: [id: string]
  doorClose: []
  ready: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const activeIndex = ref(0)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let raycaster: THREE.Raycaster
let animationId = 0
let disposed = false
let currentOffset = 0
let targetOffset = 0
let touchStartX = 0
let pointerStartX = 0
let openingDoorId: string | null = null
let openTimer: ReturnType<typeof setTimeout> | null = null

const pointer = new THREE.Vector2()
const doorGroups: THREE.Group[] = []
const labelTextures: THREE.Texture[] = []

function normIndex(i: number) {
  const len = props.doors.length || 1
  return (i + len) % len
}

function makeLabelTexture(label: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 112
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f5ebe0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = color
  ctx.lineWidth = 8
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#2c2419'
  ctx.font = '700 26px Outfit, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  labelTextures.push(tex)
  return tex
}

function createDoor(door: ApartmentDoor) {
  const group = new THREE.Group()
  group.userData = { doorId: door.id, openAmount: 0, targetOpen: 0 }

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 2.35, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.65 }),
  )
  group.add(frame)

  const hinge = new THREE.Group()
  hinge.position.set(-0.56, 0, 0.09)
  group.add(hinge)

  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(1.12, 2.12, 0.09),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(door.color).multiplyScalar(0.86),
      roughness: 0.5,
      emissive: 0x000000,
    }),
  )
  panel.position.x = 0.56
  panel.position.z = 0
  panel.userData.isDoorPanel = true
  hinge.add(panel)

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.4),
    new THREE.MeshBasicMaterial({
      map: makeLabelTexture(door.label, door.color),
      transparent: true,
    }),
  )
  label.position.set(0.56, 0.35, 0.09)
  hinge.add(label)

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xcfa05c, metalness: 0.6, roughness: 0.2 }),
  )
  knob.position.set(1.03, -0.15, 0.07)
  hinge.add(knob)

  group.userData.hinge = hinge

  return group
}

function createScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x17100b)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 40)
  camera.position.set(0, 1.25, 5.8)
  camera.lookAt(0, 0.45, 0)

  scene.add(new THREE.AmbientLight(0xe9d3b8, 0.65))
  const key = new THREE.DirectionalLight(0xffd2a6, 1.05)
  key.position.set(2.5, 4.8, 4.2)
  scene.add(key)

  const fill = new THREE.PointLight(0x8d6a4a, 0.55, 12)
  fill.position.set(-2.2, 1.2, 2.4)
  scene.add(fill)

  props.doors.forEach((door) => {
    const g = createDoor(door)
    scene.add(g)
    doorGroups.push(g)
  })
}

function updateDoorsLayout() {
  const arcRadius = 3.15
  doorGroups.forEach((group, index) => {
    const raw = index - currentOffset
    const len = doorGroups.length
    const delta = Math.abs(raw) > len / 2
      ? raw > 0 ? raw - len : raw + len
      : raw

    const angle = delta * 0.5
    group.position.x = Math.sin(angle) * arcRadius
    group.position.y = 0.2 + Math.abs(delta) * 0.02
    group.position.z = -Math.abs(delta) * 0.8
    group.rotation.y = -angle * 0.72

    const scale = delta === 0 ? 1 : 0.8
    group.scale.setScalar(scale)

    const hinge = group.userData.hinge as THREE.Group
    const panel = hinge?.children.find((c) => c.userData?.isDoorPanel) as THREE.Mesh | undefined
    if (panel && hinge) {
      const material = panel.material as THREE.MeshStandardMaterial
      material.emissive.setHex(Math.abs(delta) < 0.001 ? 0x3a2514 : 0x000000)

      const isOpening = group.userData.doorId === openingDoorId
      group.userData.targetOpen = isOpening ? 1 : 0
      let amount = group.userData.openAmount as number
      amount += ((group.userData.targetOpen as number) - amount) * 0.16
      group.userData.openAmount = amount
      hinge.rotation.y = -amount * (Math.PI / 2) * 0.85
    }
  })
}

function setActive(index: number) {
  activeIndex.value = normIndex(index)
  targetOffset = activeIndex.value
}

function prevCard() {
  setActive(activeIndex.value - 1)
}

function nextCard() {
  setActive(activeIndex.value + 1)
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
}

function onTouchEnd(e: TouchEvent) {
  if (props.inputLocked) return
  const endX = e.changedTouches[0]?.clientX ?? 0
  const dx = endX - touchStartX
  if (Math.abs(dx) < 34) return
  if (dx > 0) prevCard()
  else nextCard()
}

function onPointerDown(e: PointerEvent) {
  pointerStartX = e.clientX
}

function onPointerUp(e: PointerEvent) {
  if (props.inputLocked) return
  const dx = e.clientX - pointerStartX
  if (Math.abs(dx) < 38) return
  if (dx > 0) prevCard()
  else nextCard()
}

function setPointerFromEvent(e: MouseEvent | PointerEvent) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
}

function onTap(e: MouseEvent) {
  if (props.inputLocked || !raycaster) return
  setPointerFromEvent(e)
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(doorGroups, true)
  let obj = hits[0]?.object as THREE.Object3D | undefined
  let selected: THREE.Group | undefined
  while (obj) {
    if (obj instanceof THREE.Group && obj.userData?.doorId) {
      selected = obj
      break
    }
    obj = obj.parent ?? undefined
  }
  const doorId = selected?.userData?.doorId as string | undefined
  if (!doorId) return

  const clickedIndex = props.doors.findIndex((d) => d.id === doorId)
  if (clickedIndex !== activeIndex.value) {
    setActive(clickedIndex)
    return
  }
  openingDoorId = doorId
  if (openTimer) clearTimeout(openTimer)
  openTimer = setTimeout(() => {
    emit('doorOpen', doorId)
    openTimer = null
  }, 230)
}

function resize() {
  if (!renderer || !camera) return
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4))
}

function animate() {
  if (disposed) return
  animationId = requestAnimationFrame(animate)
  currentOffset += (targetOffset - currentOffset) * 0.12
  updateDoorsLayout()
  renderer?.render(scene, camera)
}

function closeAllDoors(callback?: () => void) {
  openingDoorId = null
  if (openTimer) {
    clearTimeout(openTimer)
    openTimer = null
  }
  emit('doorClose')
  callback?.()
}

watch(
  () => props.inputLocked,
  (locked) => {
    if (!locked) {
      openingDoorId = null
      emit('doorClose')
    }
  },
)

defineExpose({ closeAllDoors })

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  raycaster = new THREE.Raycaster()

  createScene()
  resize()
  setActive(0)
  animate()
  emit('ready')

  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(animationId)
  if (openTimer) clearTimeout(openTimer)
  window.removeEventListener('resize', resize)

  scene?.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    obj.geometry?.dispose()
    const material = obj.material
    if (Array.isArray(material)) material.forEach((m) => m.dispose())
    else material?.dispose()
  })
  labelTextures.forEach((tex) => tex.dispose())
  labelTextures.length = 0
  renderer?.dispose()
  renderer = null
})
</script>

<style scoped>
.swipe-scene {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(160deg, #17100b 0%, #23160e 45%, #120c08 100%);
}

.swipe-scene__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.swipe-scene__touch-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.swipe-scene__touch-layer--locked {
  pointer-events: none;
}

.swipe-scene__controls {
  position: absolute;
  left: 50%;
  bottom: 1.1rem;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
}

.swipe-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #f6e3cb;
  border: 1px solid rgba(255, 214, 168, 0.35);
  background: rgba(20, 13, 8, 0.68);
}

.swipe-dots {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.swipe-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 219, 178, 0.3);
}

.swipe-dot--active {
  width: 24px;
  border-radius: 999px;
  background: #eab06f;
}
</style>
