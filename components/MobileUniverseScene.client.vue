<template>
  <div class="universe">
    <canvas ref="canvasRef" class="universe__canvas" />
    <div v-if="!inputLocked" class="universe__hint">
      <i class="bi bi-stars" />
      <span>Tap une planete pour ouvrir une porte</span>
    </div>
  </div>
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

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let raycaster: THREE.Raycaster
let animationId = 0
let disposed = false
const pointer = new THREE.Vector2()
const satellites: THREE.Mesh[] = []
type Orbiter = {
  mesh: THREE.Mesh
  baseAngle: number
  radiusX: number
  radiusZ: number
  speed: number
  lift: number
}

const orbiters: Orbiter[] = []
let orbitRoot: THREE.Group | null = null
let asteroidBelt: THREE.Points | null = null
let starsNear: THREE.Points | null = null
let starsFar: THREE.Points | null = null

function createUniverse() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x03040c)
  scene.fog = new THREE.Fog(0x03040c, 14, 40)

  camera = new THREE.PerspectiveCamera(56, 1, 0.1, 50)
  camera.position.set(0.8, 2.2, 11.4)
  camera.lookAt(1.4, 0.8, 0)

  const ambient = new THREE.AmbientLight(0x8490d6, 0.52)
  scene.add(ambient)

  const sunLight = new THREE.PointLight(0xffc26b, 3.2, 45)
  sunLight.position.set(-8.2, 1.2, 0)
  scene.add(sunLight)

  const rim = new THREE.DirectionalLight(0x9cc3ff, 0.8)
  rim.position.set(6, 5, 8)
  scene.add(rim)

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.55, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0xffa83a,
    }),
  )
  sun.position.set(-9.1, 1.2, 0)
  scene.add(sun)

  const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffc574,
      transparent: true,
      opacity: 0.23,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  sunGlow.position.copy(sun.position)
  sunGlow.name = 'sun-glow'
  scene.add(sunGlow)

  orbitRoot = new THREE.Group()
  orbitRoot.position.set(-4.9, 0.8, 0)
  scene.add(orbitRoot)

  const galaxyCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0x6c4ea8,
      emissive: 0x5a2ea0,
      emissiveIntensity: 1.1,
      roughness: 0.35,
      metalness: 0.15,
    }),
  )
  orbitRoot.add(galaxyCenter)

  const centerAura = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xc58bff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  centerAura.name = 'galaxy-core-aura'
  orbitRoot.add(centerAura)

  const orbitPalette = [1.35, 2.05, 2.8, 3.65, 4.55, 5.5]
  props.doors.forEach((door, index) => {
    const baseAngle = (index / props.doors.length) * Math.PI * 2 + 0.3
    const orbit = orbitPalette[index] ?? (1.35 + index * 0.8)
    const radiusX = orbit * 1.22
    const radiusZ = orbit * 0.8
    const size = 0.2 + index * 0.045

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 28, 28),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(door.color),
        emissive: 0x12152c,
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.16,
      }),
    )
    mesh.position.set(Math.cos(baseAngle) * radiusX, 0, Math.sin(baseAngle) * radiusZ)
    mesh.userData = { doorId: door.id }
    orbitRoot.add(mesh)
    satellites.push(mesh)

    const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, 0, Math.PI * 2)
    const points = curve.getPoints(160).map((p) => new THREE.Vector3(p.x, 0, p.y))
    const orbitLine = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: 0xb7c7ff,
        transparent: true,
        opacity: 0.22,
      }),
    )
    orbitLine.rotation.x = 0.2
    orbitRoot.add(orbitLine)

    orbiters.push({
      mesh,
      baseAngle,
      radiusX,
      radiusZ,
      speed: 0.12 / (1 + index * 0.35),
      lift: 0.03 + index * 0.01,
    })

    if (index === 3) {
      const saturnRing = new THREE.Mesh(
        new THREE.RingGeometry(size * 1.5, size * 2.15, 42),
        new THREE.MeshBasicMaterial({
          color: 0xe4d7b8,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
        }),
      )
      saturnRing.rotation.x = Math.PI / 2.3
      mesh.add(saturnRing)
    }
  })

  const asteroidGeo = new THREE.BufferGeometry()
  const asteroidCount = 1000
  const asteroidPos = new Float32Array(asteroidCount * 3)
  for (let i = 0; i < asteroidCount; i += 1) {
    const a = Math.random() * Math.PI * 2
    const rx = 4.22 + (Math.random() - 0.5) * 0.8
    const rz = 2.95 + (Math.random() - 0.5) * 0.55
    asteroidPos[i * 3] = Math.cos(a) * rx
    asteroidPos[i * 3 + 1] = (Math.random() - 0.5) * 0.22
    asteroidPos[i * 3 + 2] = Math.sin(a) * rz
  }
  asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPos, 3))
  asteroidBelt = new THREE.Points(
    asteroidGeo,
    new THREE.PointsMaterial({
      color: 0x8a857f,
      size: 0.035,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  )
  asteroidBelt.rotation.x = 0.24
  orbitRoot.add(asteroidBelt)

  const nearGeo = new THREE.BufferGeometry()
  const nearCount = 550
  const nearPos = new Float32Array(nearCount * 3)
  for (let i = 0; i < nearCount; i += 1) {
    const r = 11 + Math.random() * 9
    const a = Math.random() * Math.PI * 2
    nearPos[i * 3] = Math.cos(a) * r
    nearPos[i * 3 + 1] = (Math.random() - 0.5) * 8
    nearPos[i * 3 + 2] = Math.sin(a) * r
  }
  nearGeo.setAttribute('position', new THREE.BufferAttribute(nearPos, 3))
  starsNear = new THREE.Points(
    nearGeo,
    new THREE.PointsMaterial({
      color: 0xf3f7ff,
      size: 0.08,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    }),
  )
  scene.add(starsNear)

  const farGeo = new THREE.BufferGeometry()
  const farCount = 900
  const farPos = new Float32Array(farCount * 3)
  for (let i = 0; i < farCount; i += 1) {
    const r = 18 + Math.random() * 16
    const a = Math.random() * Math.PI * 2
    farPos[i * 3] = Math.cos(a) * r
    farPos[i * 3 + 1] = (Math.random() - 0.5) * 12
    farPos[i * 3 + 2] = Math.sin(a) * r
  }
  farGeo.setAttribute('position', new THREE.BufferAttribute(farPos, 3))
  starsFar = new THREE.Points(
    farGeo,
    new THREE.PointsMaterial({
      color: 0xadb8ff,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    }),
  )
  scene.add(starsFar)
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

function highlightDoor(doorId: string | null) {
  satellites.forEach((satellite) => {
    const material = satellite.material as THREE.MeshStandardMaterial
    material.emissive.setHex(satellite.userData.doorId === doorId ? 0xff8f2f : 0x12152c)
    material.emissiveIntensity = satellite.userData.doorId === doorId ? 0.85 : 0.35
  })
}

function onPointerMove(e: PointerEvent) {
  if (props.inputLocked) return
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(satellites)[0]
  const doorId = hit?.object?.userData?.doorId as string | undefined
  highlightDoor(doorId ?? null)
  document.body.style.cursor = doorId ? 'pointer' : 'default'
}

function onClick() {
  if (props.inputLocked) return
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(satellites)[0]
  const doorId = hit?.object?.userData?.doorId as string | undefined
  if (!doorId) return
  emit('doorOpen', doorId)
}

function animate() {
  if (disposed) return
  animationId = requestAnimationFrame(animate)
  const t = performance.now() * 0.001

  const sunGlow = scene.getObjectByName('sun-glow')
  if (sunGlow) sunGlow.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06)
  const coreAura = orbitRoot?.getObjectByName('galaxy-core-aura')
  if (coreAura) coreAura.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05)

  orbiters.forEach((orbiter) => {
    const orbitA = orbiter.baseAngle + t * orbiter.speed
    orbiter.mesh.position.x = Math.cos(orbitA) * orbiter.radiusX
    orbiter.mesh.position.z = Math.sin(orbitA) * orbiter.radiusZ
    orbiter.mesh.position.y = Math.sin(t * 1.7 + orbiter.baseAngle * 2) * orbiter.lift
    orbiter.mesh.rotation.y += 0.012
  })

  if (asteroidBelt) asteroidBelt.rotation.y += 0.0024
  if (starsNear) starsNear.rotation.y += 0.00032
  if (starsFar) starsFar.rotation.y -= 0.00014

  renderer?.render(scene, camera)
}

function closeAllDoors(callback?: () => void) {
  highlightDoor(null)
  emit('doorClose')
  callback?.()
}

function init() {
  const canvas = canvasRef.value
  if (!canvas || disposed) return

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace

  raycaster = new THREE.Raycaster()
  createUniverse()
  resize()

  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('click', onClick)

  emit('ready')
  animate()
}

defineExpose({ closeAllDoors })

onMounted(() => {
  requestAnimationFrame(init)
})

onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('click', onClick)
  highlightDoor(null)
  document.body.style.cursor = 'default'
  scene?.traverse((child) => {
    if (!(child instanceof THREE.Mesh) && !(child instanceof THREE.Points)) return
    child.geometry?.dispose()
    const material = child.material
    if (Array.isArray(material)) material.forEach((m) => m.dispose())
    else material?.dispose()
  })
  renderer?.dispose()
  renderer = null
})
</script>

<style scoped>
.universe {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 16% 50%, rgba(255, 156, 70, 0.42), transparent 34%),
    radial-gradient(circle at 58% 52%, rgba(102, 56, 168, 0.22), transparent 44%),
    radial-gradient(circle at 75% 24%, rgba(49, 101, 164, 0.18), transparent 48%),
    #03040c;
}

.universe__canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.universe__hint {
  position: fixed;
  left: 50%;
  bottom: 1.35rem;
  transform: translateX(-50%);
  z-index: 35;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(6, 10, 30, 0.82);
  color: #e7e5ff;
  font-size: 0.75rem;
  border: 1px solid rgba(173, 155, 255, 0.42);
  box-shadow: 0 0 18px rgba(105, 93, 212, 0.25), 0 0 34px rgba(255, 159, 76, 0.12);
}

.universe__hint i {
  color: #d0b98c;
}
</style>
