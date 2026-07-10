import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const TABLE_TOP_Y = 0.58
const TROPHY_HEIGHT = 0.46
const BALL_SIZE = 0.22
const TROPHY_POS = new THREE.Vector3(-0.1, 0, 0)
const BALL_POS = new THREE.Vector3(0.14, 0, 0)
const GOLD = new THREE.Color(0xd4af37)

function tuneTrophyMaterial(material: THREE.Material): THREE.Material {
  if (material instanceof THREE.MeshStandardMaterial) {
    const tuned = material.clone()
    tuned.color.lerp(GOLD, 0.28)
    tuned.emissive.setHex(0x8a7020)
    tuned.emissiveIntensity = 0.12
    tuned.metalness = 0.62
    tuned.roughness = 0.32
    tuned.envMapIntensity = 1.15
    return tuned
  }

  if (material instanceof THREE.MeshPhysicalMaterial) {
    const tuned = material.clone()
    tuned.color.lerp(GOLD, 0.28)
    tuned.emissive.setHex(0x8a7020)
    tuned.emissiveIntensity = 0.12
    tuned.metalness = 0.62
    tuned.roughness = 0.32
    return tuned
  }

  if (material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial) {
    const tuned = material.clone()
    tuned.color.lerp(GOLD, 0.3)
    if ('emissive' in tuned) {
      tuned.emissive.setHex(0x5a4818)
      tuned.emissiveIntensity = 0.06
    }
    return tuned
  }

  if (material instanceof THREE.MeshBasicMaterial) {
    const tuned = material.clone()
    tuned.color.lerp(GOLD, 0.35)
    return tuned
  }

  return material
}

function tuneBallMaterial(material: THREE.Material): THREE.Material {
  if (material instanceof THREE.MeshStandardMaterial) {
    const tuned = material.clone()
    tuned.roughness = Math.max(tuned.roughness - 0.08, 0.35)
    tuned.metalness = Math.min(tuned.metalness, 0.08)
    tuned.envMapIntensity = 1.1
    return tuned
  }

  if (material instanceof THREE.MeshPhysicalMaterial) {
    const tuned = material.clone()
    tuned.roughness = Math.max(tuned.roughness - 0.08, 0.35)
    tuned.metalness = Math.min(tuned.metalness, 0.08)
    return tuned
  }

  return material
}

function placeOnTable(
  model: THREE.Object3D,
  targetSize: number,
  offset: THREE.Vector3,
  useHeight = false,
) {
  const bounds = new THREE.Box3().setFromObject(model)
  const size = bounds.getSize(new THREE.Vector3())
  const scale = useHeight
    ? targetSize / Math.max(size.y, 0.001)
    : targetSize / Math.max(size.x, size.y, size.z, 0.001)
  model.scale.setScalar(scale)

  bounds.setFromObject(model)
  const center = bounds.getCenter(new THREE.Vector3())
  model.position.set(
    offset.x - center.x,
    TABLE_TOP_Y - bounds.min.y,
    offset.z - center.z,
  )
}

function addTrophyLighting(table: THREE.Object3D) {
  const focus = new THREE.Object3D()
  focus.position.set(0, 0.75, 0)
  table.add(focus)

  const key = new THREE.SpotLight(0xfff5e0, 1.7, 4, Math.PI / 5.5, 0.38, 1.5)
  key.position.set(0.5, 1.25, 0.95)
  key.target = focus
  table.add(key)

  const windowFill = new THREE.PointLight(0xd8ecff, 0.78, 3.2)
  windowFill.position.set(0.1, 1, 1.45)
  table.add(windowFill)

  const rim = new THREE.PointLight(0xffe8b0, 0.45, 2.6)
  rim.position.set(-0.7, 1.05, -0.4)
  table.add(rim)
}

async function loadTrophyModel(url: string): Promise<THREE.Object3D | null> {
  try {
    const gltf = await new GLTFLoader().loadAsync(url)
    const model = gltf.scene.clone(true)

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true

      if (Array.isArray(child.material)) {
        child.material = child.material.map(tuneTrophyMaterial)
      } else {
        child.material = tuneTrophyMaterial(child.material)
      }
    })

    placeOnTable(model, TROPHY_HEIGHT, TROPHY_POS, true)
    return model
  } catch {
    return null
  }
}

async function loadBallModel(url: string): Promise<THREE.Object3D | null> {
  try {
    const gltf = await new GLTFLoader().loadAsync(url)
    const model = gltf.scene.clone(true)

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true

      if (Array.isArray(child.material)) {
        child.material = child.material.map(tuneBallMaterial)
      } else {
        child.material = tuneBallMaterial(child.material)
      }
    })

    placeOnTable(model, BALL_SIZE, BALL_POS)
    model.rotation.x = -0.08
    return model
  } catch {
    return null
  }
}

export async function loadTrophyTableDecor(
  table: THREE.Object3D,
  trophyUrl: string,
  ballUrl: string,
): Promise<void> {
  const [trophy, ball] = await Promise.all([
    loadTrophyModel(trophyUrl),
    loadBallModel(ballUrl),
  ])

  if (trophy) table.add(trophy)
  if (ball) table.add(ball)
  if (trophy || ball) addTrophyLighting(table)
}
