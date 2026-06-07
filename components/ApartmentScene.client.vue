<template>
  <div class="apt" :class="{ 'apt--zoomed': isZoomed }">
    <canvas ref="canvasRef" class="apt__canvas" />
    <div v-if="hoveredInteractive && !isZoomed" class="apt__tooltip" :style="tooltipStyle">
      <i :class="iconClass(hoveredInteractive.icon)" />
      <span>{{ hoveredInteractive.label }}</span>
      <small>{{ hoveredInteractive.hint }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { ApartmentDoor } from '~/composables/usePortfolioData'
import {
  applyWindowTaskBoard,
  buildDetailedFurniture,
  buildWallClock,
  buildWallPhotoFrame,
  buildWindow,
} from '~/utils/apartmentFurniture'
import { setupTvVideo, type TvVideoHandle } from '~/utils/apartmentTvVideo'
import { applyMonitorWallpaper } from '~/utils/apartmentMonitor'
import { publicAsset } from '~/utils/publicAsset'
import { configureTexture, disposeObject3D } from '~/utils/threeDispose'

const props = defineProps<{
  doors: ApartmentDoor[]
  inputLocked?: boolean
}>()

const { boardTasks } = usePortfolioData()

const emit = defineEmits<{
  doorOpen: [id: string]
  doorClose: []
  ready: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
const isZoomed = ref(false)
const hoveredInteractive = ref<{ label: string; icon: string; hint: string } | null>(null)
const tooltipStyle = ref({ left: '50%', top: '50%' })

const ROOM = { w: 14, d: 12, h: 3.2 }
const doorGroups: THREE.Group[] = []
const hotspotMeshes: THREE.Object3D[] = []
let openDoorId: string | null = null
let lastHoveredHotspotId: string | null = null
let tvVideo: TvVideoHandle | null = null

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let raycaster: THREE.Raycaster
let animationId = 0
let disposed = false
let isPageVisible = true
let needsHoverCheck = false
let perfLite = false
let maxPixelRatio = 1.75
let scenePaused = false
let lastHoveredDoorId: string | null = null
const loadedTextures: THREE.Texture[] = []
const pointer = new THREE.Vector2()

const defaultCamPos = new THREE.Vector3(0, 1.7, 4.85)
const defaultCamTarget = new THREE.Vector3(0, 1.45, 0)
const camFromPos = new THREE.Vector3()
const camFromTarget = new THREE.Vector3()
const camToPos = new THREE.Vector3()
const camToTarget = new THREE.Vector3()
const savedRestPos = new THREE.Vector3()
const savedRestTarget = new THREE.Vector3()
let zoomProgress = 0
let zoomState: 'idle' | 'in' | 'out' = 'idle'
let pendingDoorId: string | null = null
let zoomOutCallback: (() => void) | null = null
let hasStoredRestView = false

const keysPressed = new Set<string>()
const MOVE_SPEED = 0.065

/** Limites intérieures — caméra et cible ne sortent pas de la pièce */
const ROOM_LIMITS = {
  target: {
    xMin: -ROOM.w / 2 + 1.65,
    xMax: ROOM.w / 2 - 1.65,
    zMin: -ROOM.d / 2 + 1.65,
    zMax: ROOM.d / 2 - 1.65,
    yMin: 0.95,
    yMax: 2.3,
  },
  camera: {
    xMin: -ROOM.w / 2 + 0.9,
    xMax: ROOM.w / 2 - 0.9,
    zMin: -ROOM.d / 2 + 0.9,
    zMax: ROOM.d / 2 - 0.9,
    yMin: 0.75,
    yMax: 2.55,
  },
}

function clampVectorToBox(v: THREE.Vector3, box: typeof ROOM_LIMITS.camera) {
  v.x = THREE.MathUtils.clamp(v.x, box.xMin, box.xMax)
  v.y = THREE.MathUtils.clamp(v.y, box.yMin, box.yMax)
  v.z = THREE.MathUtils.clamp(v.z, box.zMin, box.zMax)
}

function enforceRoomBounds() {
  if (!controls || zoomState !== 'idle') return

  clampVectorToBox(controls.target, ROOM_LIMITS.target)
  clampVectorToBox(camera.position, ROOM_LIMITS.camera)

  const offset = camera.position.clone().sub(controls.target)
  const dist = offset.length()
  const maxDist = controls.maxDistance ?? 6.5
  if (dist > maxDist) {
    offset.normalize().multiplyScalar(maxDist)
    camera.position.copy(controls.target).add(offset)
    clampVectorToBox(camera.position, ROOM_LIMITS.camera)
  }
}

function iconClass(icon: string) {
  return `bi bi-${icon}`
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function makeLabelTexture(label: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 256, 128)
  ctx.fillStyle = '#f5ebe0'
  ctx.fillRect(6, 6, 244, 116)
  ctx.fillStyle = '#3d3228'
  ctx.font = '600 22px Outfit, sans-serif'
  ctx.textAlign = 'center'
  const lines = label.length > 14 ? [label.slice(0, 14), label.slice(14)] : [label]
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), 128, 58 + i * 28)
  })
  const tex = new THREE.CanvasTexture(canvas)
  configureTexture(tex, renderer ?? undefined, { lite: perfLite })
  loadedTextures.push(tex)
  return tex
}

function createRoom() {
  const useShadows = !perfLite
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.82,
  })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = useShadows
  scene.add(floor)

  for (let i = -6; i <= 6; i += 2) {
    const plank = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, ROOM.d),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x4a3328 : 0x523a2e,
        roughness: 0.9,
      }),
    )
    plank.rotation.x = -Math.PI / 2
    plank.position.set(i, 0.008, 0)
    plank.receiveShadow = useShadows
    scene.add(plank)
  }

  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x6b3a2a, roughness: 1 }),
  )
  rug.rotation.x = -Math.PI / 2
  rug.position.set(-2.2, 0.015, 2.2)
  scene.add(rug)

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe8ddd0,
    roughness: 0.92,
    side: THREE.DoubleSide,
  })
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xd9cfc2, roughness: 1 })

  const walls = [
    { geo: new THREE.PlaneGeometry(ROOM.w, ROOM.h), pos: [0, ROOM.h / 2, -ROOM.d / 2], rot: [0, 0, 0] },
    { geo: new THREE.PlaneGeometry(ROOM.w, ROOM.h), pos: [0, ROOM.h / 2, ROOM.d / 2], rot: [0, Math.PI, 0] },
    { geo: new THREE.PlaneGeometry(ROOM.d, ROOM.h), pos: [-ROOM.w / 2, ROOM.h / 2, 0], rot: [0, Math.PI / 2, 0] },
    { geo: new THREE.PlaneGeometry(ROOM.d, ROOM.h), pos: [ROOM.w / 2, ROOM.h / 2, 0], rot: [0, -Math.PI / 2, 0] },
  ]
  walls.forEach(({ geo, pos, rot }) => {
    const w = new THREE.Mesh(geo, wallMat)
    w.position.set(pos[0]!, pos[1]!, pos[2]!)
    w.rotation.set(rot[0]!, rot[1]!, rot[2]!)
    w.receiveShadow = useShadows
    scene.add(w)
  })

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), ceilMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = ROOM.h
  scene.add(ceiling)

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 })
  ;[
    [0, 0.05, -ROOM.d / 2 + 0.06, ROOM.w, 0.1, 0.12],
    [0, 0.05, ROOM.d / 2 - 0.06, ROOM.w, 0.1, 0.12],
    [-ROOM.w / 2 + 0.06, 0.05, 0, 0.12, 0.1, ROOM.d],
    [ROOM.w / 2 - 0.06, 0.05, 0, 0.12, 0.1, ROOM.d],
  ].forEach(([x, y, z, w, h, d]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plinthMat)
    b.position.set(x, y, z)
    scene.add(b)
  })

  const pendant = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 0.12, 20),
    new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      emissive: 0xffcc88,
      emissiveIntensity: 1.2,
    }),
  )
  pendant.position.set(0, 2.85, 0)
  scene.add(pendant)
}

function createDoor(door: ApartmentDoor, x: number, y: number, z: number, rotY: number) {
  const group = new THREE.Group()
  group.position.set(x, y, z)
  group.rotation.y = rotY
  group.userData = { doorId: door.id, openAmount: 0, targetOpen: 0, isDoor: true }

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.65 })
  const doorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(door.color).multiplyScalar(0.82),
    roughness: 0.55,
  })

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.14), frameMat)
  frame.castShadow = !perfLite
  group.add(frame)

  const hinge = new THREE.Group()
  hinge.position.set(-0.52, 0, 0.07)

  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.95, 0.09), doorMat)
  panel.position.set(0.51, 0.04, 0)
  panel.castShadow = !perfLite
  hinge.add(panel)

  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.75, 0.4),
    new THREE.MeshBasicMaterial({
      map: makeLabelTexture(door.label, door.color),
      transparent: true,
    }),
  )
  plate.position.set(0.51, 0.3, 0.06)
  hinge.add(plate)

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.85, roughness: 0.15 }),
  )
  knob.position.set(0.88, -0.15, 0.09)
  hinge.add(knob)

  group.add(hinge)
  group.userData.hinge = hinge
  scene.add(group)
  doorGroups.push(group)
}

function placeDoors() {
  const doorMap: Record<string, { x: number; y: number; z: number; rot: number }> = {
    about: { x: -ROOM.w / 2 + 0.14, y: 1.12, z: 2.8, rot: Math.PI / 2 },
    mobile: { x: -ROOM.w / 2 + 0.14, y: 1.12, z: -2.8, rot: Math.PI / 2 },
    projects: { x: ROOM.w / 2 - 0.14, y: 1.12, z: 0, rot: -Math.PI / 2 },
    skills: { x: -2.9, y: 1.12, z: -ROOM.d / 2 + 0.14, rot: 0 },
    experience: { x: 2.9, y: 1.12, z: -ROOM.d / 2 + 0.14, rot: 0 },
    contact: { x: 0, y: 1.12, z: ROOM.d / 2 - 0.14, rot: Math.PI },
  }
  props.doors.forEach((d) => {
    const p = doorMap[d.id]
    if (p) createDoor(d, p.x, p.y, p.z, p.rot)
  })
}

function createLights() {
  scene.add(new THREE.AmbientLight(0xfff8ee, 0.35))
  scene.add(new THREE.HemisphereLight(0xfff8ee, 0x3d2818, 0.5))
  const main = new THREE.PointLight(0xffe4c4, 2.2, 22)
  main.position.set(0, 2.9, 0)
  scene.add(main)
  if (!perfLite) {
    const pendant = new THREE.PointLight(0xffd699, 0.9, 10)
    pendant.position.set(0, 2.6, 0)
    scene.add(pendant)
  }
  const windowLight = new THREE.DirectionalLight(0xc8e8ff, 0.45)
  windowLight.position.set(0, 2.5, 10)
  scene.add(windowLight)
}

function isFacingDoor(fromPos: THREE.Vector3, doorTarget: THREE.Vector3) {
  const camForward = new THREE.Vector3()
  camera.getWorldDirection(camForward)
  const toDoor = doorTarget.clone().sub(fromPos)
  toDoor.y = 0
  if (toDoor.lengthSq() < 0.01) return true
  toDoor.normalize()
  camForward.y = 0
  camForward.normalize()
  return camForward.dot(toDoor) > 0.82
}

/** Point de vue face à la porte */
function getDoorFocus(group: THREE.Group, fromPos: THREE.Vector3) {
  const doorPos = new THREE.Vector3()
  group.getWorldPosition(doorPos)
  const target = new THREE.Vector3(doorPos.x, 1.45, doorPos.z)

  const intoRoom = new THREE.Vector3(0, 1.45, 0).sub(target)
  intoRoom.y = 0
  if (intoRoom.lengthSq() < 0.001) intoRoom.set(0, 0, 1)
  intoRoom.normalize()

  const idealPos = target.clone().add(intoRoom.multiplyScalar(1.15))
  idealPos.y = 1.5

  const toDoor = target.clone().sub(fromPos)
  const dist = toDoor.length()
  const facing = isFacingDoor(fromPos, target)

  if (facing) {
    if (dist <= 1.1) {
      return { position: fromPos.clone(), target, dollyOnly: true }
    }
    const step = Math.min(dist * 0.35, 1.0)
    const endPos = fromPos.clone().add(toDoor.normalize().multiplyScalar(step))
    endPos.y = THREE.MathUtils.lerp(fromPos.y, idealPos.y, 0.2)
    return { position: endPos, target, dollyOnly: true }
  }

  const blend = fromPos.clone().lerp(idealPos, 0.55)
  blend.y = THREE.MathUtils.lerp(fromPos.y, idealPos.y, 0.4)
  return { position: blend, target, dollyOnly: false }
}

function applyCameraView(pos: THREE.Vector3, target: THREE.Vector3) {
  camera.position.copy(pos)
  controls.target.copy(target)
  camera.lookAt(target)
}

function findHotspotObject(obj: THREE.Object3D | null): THREE.Object3D | null {
  let cur: THREE.Object3D | null = obj
  while (cur) {
    if (cur.userData?.isHotspot) return cur
    cur = cur.parent
  }
  return null
}

function setHotspotHighlight(hotspotId: string | null) {
  if (hotspotId === lastHoveredHotspotId) return
  lastHoveredHotspotId = hotspotId
  hotspotMeshes.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const mat = obj.material as THREE.MeshStandardMaterial
    if (!mat.emissive) return
    const id = obj.userData.hotspotId as string
    mat.emissiveIntensity = id === hotspotId ? 1.2 : (mat.map ? 0.55 : 0.4)
    if (id === hotspotId && !mat.map) mat.emissive.setHex(0x443322)
    else if (id !== hotspotId && !mat.map) mat.emissive.setHex(obj.userData.baseEmissive ?? 0x112233)
  })
}

function openHotspot(panelId: string) {
  if (zoomState !== 'idle' || isZoomed.value) return
  emit('doorOpen', panelId)
}

function findDoorGroup(obj: THREE.Object3D | null): THREE.Group | null {
  let cur: THREE.Object3D | null = obj
  while (cur) {
    if (cur.userData?.isDoor) return cur as THREE.Group
    cur = cur.parent
  }
  return null
}

function setDoorTarget(id: string | null) {
  doorGroups.forEach((g) => {
    g.userData.targetOpen = g.userData.doorId === id ? 1 : 0
  })
  openDoorId = id
}

function startZoomIn(id: string) {
  const group = doorGroups.find((g) => g.userData.doorId === id)
  if (!group) return

  controls.update()

  if (!hasStoredRestView) {
    savedRestPos.copy(camera.position)
    savedRestTarget.copy(controls.target)
    hasStoredRestView = true
  }

  const focus = getDoorFocus(group, camera.position)
  camFromPos.copy(camera.position)
  camToPos.copy(focus.position)
  camToTarget.copy(focus.target)

  if (focus.dollyOnly) {
    camFromTarget.copy(focus.target)
  } else {
    camFromTarget.copy(controls.target)
  }

  pendingDoorId = id
  zoomProgress = 0
  zoomState = 'in'
  isZoomed.value = true
  controls.enabled = false
  hoveredInteractive.value = null
  setDoorTarget(id)
}

function startZoomOut(callback?: () => void) {
  zoomOutCallback = callback ?? null
  camFromPos.copy(camera.position)
  camFromTarget.copy(controls.target)
  camToPos.copy(savedRestPos)
  camToTarget.copy(savedRestTarget)
  zoomProgress = 0
  zoomState = 'out'
  setDoorTarget(null)
}

function openDoor(id: string) {
  if (zoomState !== 'idle' && openDoorId !== id) return
  if (openDoorId === id && zoomState === 'in') return
  if (openDoorId && openDoorId !== id) {
    startZoomOut(() => startZoomIn(id))
    return
  }
  startZoomIn(id)
}

function closeAllDoors(callback?: () => void) {
  if (zoomState === 'idle' && !openDoorId) {
    callback?.()
    return
  }
  emit('doorClose')
  startZoomOut(() => {
    isZoomed.value = false
    openDoorId = null
    pendingDoorId = null
    controls.enabled = true
    controls.target.copy(savedRestTarget)
    camera.position.copy(savedRestPos)
    camera.lookAt(controls.target)
    controls.update()
    hasStoredRestView = false
    callback?.()
  })
}

function updateCameraZoom() {
  if (zoomState === 'idle') return

  zoomProgress = Math.min(1, zoomProgress + 0.024)
  const t = easeInOutCubic(zoomProgress)

  const pos = camFromPos.clone().lerp(camToPos, t)
  const targetT = zoomState === 'in' && camFromTarget.distanceToSquared(camToTarget) < 0.01
    ? camToTarget.clone()
    : camFromTarget.clone().lerp(camToTarget, t)
  applyCameraView(pos, targetT)

  if (zoomState === 'in' && zoomProgress >= 1) {
    applyCameraView(camToPos, camToTarget)
    if (pendingDoorId) {
      emit('doorOpen', pendingDoorId)
      pendingDoorId = null
    }
    zoomState = 'idle'
    zoomProgress = 0
  } else if (zoomState === 'out' && zoomProgress >= 1) {
    applyCameraView(camToPos, camToTarget)
    zoomState = 'idle'
    zoomProgress = 0
    zoomOutCallback?.()
    zoomOutCallback = null
  }
}

function onPointerMove(e: PointerEvent) {
  if (isZoomed.value) return
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
  tooltipStyle.value = { left: `${e.clientX}px`, top: `${e.clientY - 56}px` }
  needsHoverCheck = true
}

function setDoorHighlight(doorId: string | null) {
  if (doorId === lastHoveredDoorId) return
  lastHoveredDoorId = doorId
  doorGroups.forEach((g) => {
    const panel = (g.userData.hinge as THREE.Group).children[0] as THREE.Mesh
    const id = g.userData.doorId as string
    ;(panel.material as THREE.MeshStandardMaterial).emissive.setHex(
      id === doorId ? 0x443322 : 0x000000,
    )
  })
}

function updateInteractiveHover() {
  if (!raycaster || !camera || isZoomed.value || scenePaused) return
  raycaster.setFromCamera(pointer, camera)

  const doorHits = raycaster.intersectObjects(doorGroups, true)
  const doorGroup = doorHits.length ? findDoorGroup(doorHits[0]!.object) : null
  if (doorGroup) {
    const doorId = doorGroup.userData.doorId as string
    const door = props.doors.find((d) => d.id === doorId)
    hoveredInteractive.value = door
      ? { label: door.label, icon: door.icon, hint: 'Cliquer pour ouvrir' }
      : null
    document.body.style.cursor = 'pointer'
    setDoorHighlight(doorId)
    setHotspotHighlight(null)
    return
  }

  const hotspotHits = raycaster.intersectObjects(hotspotMeshes, true)
  const hotspot = hotspotHits.length ? findHotspotObject(hotspotHits[0]!.object) : null
  if (hotspot) {
    const hotspotId = hotspot.userData.hotspotId as string
    hoveredInteractive.value = {
      label: hotspot.userData.label as string,
      icon: hotspot.userData.icon as string,
      hint:
        hotspotId === 'tv'
          ? tvVideo?.isPlaying()
            ? 'Cliquer pour mettre en pause'
            : 'Cliquer pour lire la vidéo'
          : 'Cliquer pour explorer',
    }
    document.body.style.cursor = 'pointer'
    setDoorHighlight(null)
    setHotspotHighlight(hotspot.userData.hotspotId as string)
    return
  }

  hoveredInteractive.value = null
  document.body.style.cursor = 'default'
  setDoorHighlight(null)
  setHotspotHighlight(null)
}

function updateKeyboardMove() {
  if (!controls || props.inputLocked || isZoomed.value || zoomState !== 'idle') return
  if (keysPressed.size === 0) return

  const forward = new THREE.Vector3()
  camera.getWorldDirection(forward)
  forward.y = 0
  if (forward.lengthSq() < 0.001) return
  forward.normalize()

  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
  const move = new THREE.Vector3()

  if (keysPressed.has('ArrowUp')) move.add(forward)
  if (keysPressed.has('ArrowDown')) move.sub(forward)
  if (keysPressed.has('ArrowLeft')) move.sub(right)
  if (keysPressed.has('ArrowRight')) move.add(right)

  if (move.lengthSq() === 0) return
  move.normalize().multiplyScalar(MOVE_SPEED)

  controls.target.add(move)
  camera.position.add(move)
  enforceRoomBounds()
}

function onKeyDown(e: KeyboardEvent) {
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
  if (props.inputLocked || isZoomed.value) return
  e.preventDefault()
  keysPressed.add(e.key)
}

function onKeyUp(e: KeyboardEvent) {
  keysPressed.delete(e.key)
}

function onClick() {
  if (isZoomed.value || zoomState !== 'idle') return
  raycaster.setFromCamera(pointer, camera)

  const doorHits = raycaster.intersectObjects(doorGroups, true)
  const doorGroup = doorHits.length ? findDoorGroup(doorHits[0]!.object) : null
  if (doorGroup?.userData.doorId) {
    openDoor(doorGroup.userData.doorId as string)
    return
  }

  const hotspotHits = raycaster.intersectObjects(hotspotMeshes, true)
  const hotspot = hotspotHits.length ? findHotspotObject(hotspotHits[0]!.object) : null
  if (hotspot?.userData.hotspotId === 'tv' && tvVideo) {
    tvVideo.togglePlayPause().catch(() => {})
    return
  }
  if (hotspot?.userData.panelId) {
    openHotspot(hotspot.userData.panelId as string)
  }
}

function resize() {
  if (!renderer || !camera) return
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
}

function animate() {
  if (disposed) return
  animationId = requestAnimationFrame(animate)
  if (!isPageVisible || (scenePaused && zoomState === 'idle')) return

  if (needsHoverCheck) {
    needsHoverCheck = false
    updateInteractiveHover()
  }

  tvVideo?.update()

  doorGroups.forEach((g) => {
    const hinge = g.userData.hinge as THREE.Group
    let amount = g.userData.openAmount as number
    const target = g.userData.targetOpen as number
    if (Math.abs(target - amount) < 0.002) {
      hinge.rotation.y = -target * (Math.PI / 2) * 0.9
      return
    }
    amount += (target - amount) * 0.1
    g.userData.openAmount = amount
    hinge.rotation.y = -amount * (Math.PI / 2) * 0.9
  })

  updateCameraZoom()
  updateKeyboardMove()
  if (zoomState === 'idle') {
    controls.update()
    enforceRoomBounds()
  }
  renderer?.render(scene, camera)
}

function init() {
  const canvas = canvasRef.value
  if (!canvas || disposed) return

  perfLite =
    window.matchMedia('(max-width: 900px), (pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.devicePixelRatio > 2 ||
    (navigator.hardwareConcurrency ?? 8) <= 4

  maxPixelRatio = perfLite ? 1.15 : 1.75

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1410)
  scene.fog = new THREE.Fog(0x1a1410, 10, 24)

  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 50)
  camera.position.copy(defaultCamPos)

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !perfLite,
    alpha: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = false

  controls = new OrbitControls(camera, canvas)
  controls.target.copy(defaultCamTarget)
  controls.enablePan = false
  controls.minDistance = 2.8
  controls.maxDistance = 6.5
  controls.minPolarAngle = 0.55
  controls.maxPolarAngle = 1.52
  controls.enableDamping = !perfLite
  controls.dampingFactor = 0.08

  raycaster = new THREE.Raycaster()

  createRoom()
  createLights()

  const furniture = buildDetailedFurniture(scene, perfLite)
  hotspotMeshes.push(...furniture.hotspotMeshes)
  const windowGroup = buildWindow(scene, ROOM, hotspotMeshes)
  placeDoors()

  if (furniture.tvScreen) {
    tvVideo = setupTvVideo(furniture.tvScreen, publicAsset('himra.mp4'), renderer ?? undefined, perfLite)
  }

  hotspotMeshes.forEach((obj) => {
    if (obj instanceof THREE.Mesh) {
      const mat = obj.material as THREE.MeshStandardMaterial
      if (mat.emissive) obj.userData.baseEmissive = mat.emissive.getHex()
    }
  })

  const texLoader = new THREE.TextureLoader()
  Promise.all([
    texLoader.loadAsync(publicAsset('cadre.jpeg')),
    texLoader.loadAsync(publicAsset('avatar.jpg')),
    texLoader.loadAsync(publicAsset('horloge.jpg')),
    texLoader.loadAsync(publicAsset('ordinateur.png')),
  ])
    .then(([frameTex, photoTex, clockTex, monitorTex]) => {
      if (disposed) {
        frameTex.dispose()
        photoTex.dispose()
        clockTex.dispose()
        monitorTex.dispose()
        return
      }
      configureTexture(frameTex, renderer, { lite: perfLite })
      configureTexture(photoTex, renderer, { lite: perfLite })
      configureTexture(clockTex, renderer, { lite: perfLite })
      configureTexture(monitorTex, renderer, { lite: perfLite })
      loadedTextures.push(frameTex, photoTex, clockTex, monitorTex)
      scene.add(buildWallPhotoFrame(frameTex, photoTex, ROOM, perfLite))
      applyWindowTaskBoard(windowGroup, photoTex, boardTasks, loadedTextures)
      scene.add(buildWallClock(clockTex, hotspotMeshes, perfLite))
      if (furniture.monitorScreen) {
        applyMonitorWallpaper(furniture.monitorScreen, monitorTex, perfLite)
      }
      hotspotMeshes.forEach((obj) => {
        if (!(obj instanceof THREE.Mesh)) return
        const mat = obj.material as THREE.MeshStandardMaterial
        if (mat.emissive) obj.userData.baseEmissive = mat.emissive.getHex()
      })
    })
    .catch(() => {
      /* textures optionnelles — la scène reste utilisable */
    })

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('click', onClick)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  ready.value = true
  emit('ready')
  animate()
}

function onVisibilityChange() {
  isPageVisible = document.visibilityState === 'visible'
  if (!isPageVisible && tvVideo?.isPlaying()) {
    tvVideo.togglePlayPause().catch(() => {})
  }
  if (isPageVisible && !disposed && renderer) {
    animate()
  } else {
    cancelAnimationFrame(animationId)
  }
}

function dispose() {
  if (disposed) return
  disposed = true
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('click', onClick)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  keysPressed.clear()
  controls?.dispose()
  controls = null!
  if (scene) disposeObject3D(scene)
  loadedTextures.forEach((t) => t.dispose())
  loadedTextures.length = 0
  tvVideo?.dispose()
  tvVideo = null
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer = null
  document.body.style.cursor = 'default'
}

watch(
  () => props.inputLocked,
  (locked) => {
    scenePaused = !!locked
  },
)

defineExpose({ closeAllDoors })

onMounted(async () => {
  await nextTick()
  document.addEventListener('visibilitychange', onVisibilityChange)
  requestAnimationFrame(() => init())
})

onUnmounted(() => dispose())
</script>

<style scoped>
.apt {
  position: fixed;
  inset: 0;
  z-index: 0;
  transition: filter 0.5s ease;
}

.apt--zoomed {
  filter: brightness(0.5);
}

.apt__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.apt__tooltip {
  position: fixed;
  z-index: 50;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.6rem 1rem;
  background: rgba(245, 235, 224, 0.97);
  color: #2c2419;
  border-radius: 6px;
  font-size: 0.85rem;
  pointer-events: none;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.28);
}

.apt__tooltip i {
  font-size: 1.35rem;
  color: #8b6d4b;
}

.apt__tooltip small {
  font-size: 0.68rem;
  color: #6b5a48;
}

</style>
