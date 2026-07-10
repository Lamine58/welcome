import * as THREE from 'three'
import flagBrazil from '~/assets/images/flags/Flag_of_Brazil.svg?url'
import flagIvoryCoast from "~/assets/images/flags/Flag_of_Côte_d'Ivoire.svg.webp?url"
import flagFrance from '~/assets/images/flags/Flag_of_France.svg.webp?url'
import flagGermany from '~/assets/images/flags/Flag_of_Germany.svg?url'
import flagNorway from '~/assets/images/flags/Flag_of_Norway.svg.webp?url'
import flagPortugal from '~/assets/images/flags/Flag_of_Portugal.svg.webp?url'
import flagSpain from '~/assets/images/flags/Flag_of_Spain.svg.webp?url'
import playerMbappe from '~/assets/images/players/10858357_kylian_mbappe_20240617103335.jpg?url'
import playerMessi from '~/assets/images/players/4422643_lionel_messi_20240617223940.jpg?url'
import playerHaaland from '~/assets/images/players/250103758_haaland.jpg?url'
import playerRonaldo from '~/assets/images/players/3452384_cristiano_ronaldo_20240610134842.jpg?url'
import playerNeymar from '~/assets/images/players/2980864_neymar_20240802203240.jpg?url'
import playerYamal from '~/assets/images/players/8587768_lamine_yamal_20240611061422.jpg?url'

function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...opts })
}

export interface WorldCupPlayer {
  id: string
  name: string
  image: string
}

export const WORLD_CUP_PLAYERS: WorldCupPlayer[] = [
  { id: 'mbappe', name: 'Mbappé', image: playerMbappe },
  { id: 'messi', name: 'Messi', image: playerMessi },
  { id: 'neymar', name: 'Neymar', image: playerNeymar },
  { id: 'ronaldo', name: 'Ronaldo', image: playerRonaldo },
  { id: 'haaland', name: 'Haaland', image: playerHaaland },
  { id: 'yamal', name: 'Yamal', image: playerYamal },
]

export function makePlayerPlaceholderTexture(name: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, 400, 400)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 8
  ctx.strokeRect(10, 10, 380, 380)

  ctx.fillStyle = '#e8ddd0'
  ctx.fillRect(24, 24, 352, 280)

  ctx.fillStyle = '#8b7355'
  ctx.font = '600 15px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('CDM 2026', 200, 52)

  ctx.fillStyle = '#4a3728'
  ctx.font = '700 26px system-ui, sans-serif'
  ctx.fillText(name, 200, 340)

  ctx.font = '500 13px system-ui, sans-serif'
  ctx.fillStyle = '#8b7355'
  ctx.fillText('Photo bientôt', 200, 372)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeScoreboardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 520
  canvas.height = 200
  const ctx = canvas.getContext('2d')!

  const scorers = [
    { rank: 1, name: 'Kylian Mbappé', country: 'France', goals: 8 },
    { rank: 1, name: 'Lionel Messi', country: 'Argentine', goals: 8 },
    { rank: 3, name: 'Erling Haaland', country: 'Norvège', goals: 7 },
  ]

  ctx.fillStyle = '#111820'
  ctx.fillRect(0, 0, 520, 200)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 3
  ctx.strokeRect(4, 4, 512, 192)

  ctx.fillStyle = '#c9a227'
  ctx.font = '700 17px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Meilleurs buteurs', 260, 30)

  ctx.strokeStyle = 'rgba(201, 162, 39, 0.45)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(24, 42)
  ctx.lineTo(496, 42)
  ctx.stroke()

  ctx.fillStyle = '#8fa8c4'
  ctx.font = '600 13px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('#', 32, 62)
  ctx.fillText('Joueur', 72, 62)
  ctx.textAlign = 'right'
  ctx.fillText('Buts', 488, 62)

  scorers.forEach((row, i) => {
    const y = 92 + i * 36

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.beginPath()
    ctx.moveTo(24, y + 14)
    ctx.lineTo(496, y + 14)
    ctx.stroke()

    ctx.fillStyle = '#c9a227'
    ctx.font = '700 15px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(row.rank), 46, y)

    ctx.fillStyle = '#eef4fb'
    ctx.font = '600 15px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(row.name, 72, y - 2)

    ctx.fillStyle = '#8fa8c4'
    ctx.font = '500 12px system-ui, sans-serif'
    ctx.fillText(row.country, 72, y + 14)

    ctx.fillStyle = '#dce8f5'
    ctx.font = '700 18px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(String(row.goals), 488, y + 4)
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Déco CDM : tableau scores (+ drapeaux chargés via loadWorldCupFlagDecor) */
export function buildWorldCupDecor(
  scene: THREE.Scene,
  room: { w: number; d: number },
  loadedTextures: THREE.Texture[] = [],
) {
  const northZ = -room.d / 2 + 0.07

  const scoreTex = makeScoreboardTexture()
  loadedTextures.push(scoreTex)
  const scoreboard = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 0.52),
    new THREE.MeshBasicMaterial({ map: scoreTex, fog: false }),
  )
  scoreboard.position.set(1.55, 2.12, northZ)
  scene.add(scoreboard)
}

export const WORLD_CUP_FLAGS = [
  { id: 'france', url: flagFrance, x: -3 },
  { id: 'brazil', url: flagBrazil, x: -2 },
  { id: 'portugal', url: flagPortugal, x: -1 },
  { id: 'norway', url: flagNorway, x: 0 },
  { id: 'ivory-coast', url: flagIvoryCoast, x: 1 },
  { id: 'germany', url: flagGermany, x: 2 },
  { id: 'spain', url: flagSpain, x: 3 },
] as const

/** Guirlande de drapeaux au centre, accrochée des deux côtés avec corde courbée */
export async function loadWorldCupFlagDecor(
  scene: THREE.Scene,
  _room: { w: number; d: number },
  loader: THREE.TextureLoader,
  loadedTextures: THREE.Texture[],
) {
  const garlandZ = 0
  const anchorSpan = 9.6
  const anchorX = anchorSpan / 2
  const anchorY = 2.74
  const flagW = 0.38
  const flagH = 0.25
  const hangLength = 0.1

  const garlandCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-anchorX, anchorY, garlandZ),
    new THREE.Vector3(0, anchorY - 0.38, garlandZ + 0.03),
    new THREE.Vector3(anchorX, anchorY, garlandZ),
  )

  const textures = await Promise.all(WORLD_CUP_FLAGS.map((flag) => loader.loadAsync(flag.url)))
  textures.forEach((tex) => {
    tex.colorSpace = THREE.SRGBColorSpace
    loadedTextures.push(tex)
  })

  const rope = new THREE.Mesh(
    new THREE.TubeGeometry(garlandCurve, 96, 0.004, 6, false),
    mat(0xcccccc, { roughness: 1 }),
  )
  scene.add(rope)

  for (const side of [-1, 1] as const) {
    const hook = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 10, 10),
      mat(0x888888, { metalness: 0.45, roughness: 0.4 }),
    )
    hook.position.set(side * anchorX, anchorY + 0.02, garlandZ)
    scene.add(hook)

    const tie = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0025, 0.0025, 0.06, 4),
      mat(0xaaaaaa, { roughness: 1 }),
    )
    tie.position.set(side * anchorX, anchorY + 0.05, garlandZ)
    scene.add(tie)
  }

  WORLD_CUP_FLAGS.forEach((flag, i) => {
    const t = THREE.MathUtils.clamp((flag.x + anchorX) / anchorSpan, 0.06, 0.94)
    const ropePoint = garlandCurve.getPoint(t)
    const tangent = garlandCurve.getTangent(t).normalize()
    const flagTop = new THREE.Vector3(ropePoint.x, ropePoint.y - hangLength, ropePoint.z + 0.02)
    const flagCenter = flagTop.clone().add(new THREE.Vector3(0, -flagH / 2, 0))

    const cordCurve = new THREE.LineCurve3(ropePoint, flagTop)
    const cord = new THREE.Mesh(
      new THREE.TubeGeometry(cordCurve, 6, 0.0025, 4, false),
      mat(0xbbbbbb, { roughness: 1 }),
    )
    scene.add(cord)

    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(flagW, flagH),
      new THREE.MeshBasicMaterial({ map: textures[i], fog: false, side: THREE.DoubleSide }),
    )
    banner.position.copy(flagCenter)
    banner.rotation.x = 0.14 + tangent.y * 0.35
    banner.rotation.z = -tangent.x * 0.22
    scene.add(banner)
  })

  return textures
}

const CARD_PHOTO_MAX = 0.52

function photoSizeContain(texture: THREE.Texture, maxW: number, maxH: number) {
  const img = texture.image as { width?: number; height?: number } | undefined
  const iw = img?.width || 3
  const ih = img?.height || 4
  const aspect = iw / ih

  let w = maxW
  let h = w / aspect
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  return { w, h }
}

export function buildPlayerCard(
  texture: THREE.Texture,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  rotY = 0,
) {
  const card = new THREE.Group()
  card.position.set(x, y, z)
  card.rotation.y = rotY
  parent.add(card)

  texture.colorSpace = THREE.SRGBColorSpace
  const { w: photoW, h: photoH } = photoSizeContain(texture, CARD_PHOTO_MAX, CARD_PHOTO_MAX)
  const frameW = CARD_PHOTO_MAX + 0.08
  const frameH = CARD_PHOTO_MAX + 0.08

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(frameW, frameH, 0.03),
    mat(0x4a3728),
  )
  frame.position.z = -0.01
  card.add(frame)

  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(frameW - 0.02, frameH - 0.02, 0.015),
    mat(0xc9a227, { metalness: 0.4, roughness: 0.4 }),
  )
  rim.position.z = 0.01
  card.add(rim)

  const matte = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_PHOTO_MAX, CARD_PHOTO_MAX),
    new THREE.MeshBasicMaterial({ color: 0xe8ddd0, fog: false }),
  )
  matte.position.z = 0.022
  card.add(matte)

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(photoW, photoH),
    new THREE.MeshBasicMaterial({ map: texture, fog: false }),
  )
  photo.position.z = 0.025
  card.add(photo)

  return card
}

export function getPlayerImagePath(player: WorldCupPlayer) {
  return player.image
}

export interface PlayerCardPlacement {
  x: number
  y: number
  z: number
  rotY: number
}

/** Cadres joueurs dispersés sur les murs — pas alignés, loin des portes */
export const PLAYER_CARD_PLACEMENTS: PlayerCardPlacement[] = [
  { x: -6.92, y: 2.0, z: -4.7, rotY: Math.PI / 2 },
  { x: -4.6, y: 2.0, z: -5.92, rotY: 0 },
  { x: 6.92, y: 1.75, z: 3.8, rotY: -Math.PI / 2 },
  { x: -0.5, y: 2.22, z: -5.92, rotY: 0 },
  { x: 6.92, y: 2.18, z: -3.5, rotY: -Math.PI / 2 },
  { x: -6.92, y: 2.02, z: 4.3, rotY: Math.PI / 2 },
]
