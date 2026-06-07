import * as THREE from 'three'

type Mat = THREE.MeshStandardMaterial

export interface HotspotPayload {
  id: string
  panelId: string
  label: string
  icon: string
}

export interface FurnitureBuildResult {
  root: THREE.Group
  swayLeaves: THREE.Object3D[]
  hotspotMeshes: THREE.Object3D[]
  tvScreen: THREE.Mesh | null
  monitorScreen: THREE.Mesh | null
}

export function tagHotspot(obj: THREE.Object3D, data: HotspotPayload) {
  obj.userData.isHotspot = true
  obj.userData.hotspotId = data.id
  obj.userData.panelId = data.panelId
  obj.userData.label = data.label
  obj.userData.icon = data.icon
  return obj
}

function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...opts })
}

function box(
  w: number,
  h: number,
  d: number,
  material: Mat,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  castShadow = false,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.position.set(x, y, z)
  m.castShadow = castShadow
  m.receiveShadow = false
  parent.add(m)
  return m
}

/** Écran plat noir par défaut, orienté vers le salon (+Z) */
function blackDisplayMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0x040406,
    fog: false,
    side: THREE.DoubleSide,
  })
}

function displayScreen(
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
) {
  box(w + 0.04, h + 0.04, 0.02, mat(0x080808), x, y, z - 0.012, parent)
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), blackDisplayMaterial())
  mesh.position.set(x, y, z)
  mesh.renderOrder = 2
  parent.add(mesh)
  return mesh
}

import type { BoardTask } from '~/composables/usePortfolioData'

function wrapCanvasLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawStickyNote(
  ctx: CanvasRenderingContext2D,
  task: BoardTask,
) {
  const { x, y, w, h, color, text, done, rot = 0 } = task
  const cx = x + w / 2
  const cy = y + h / 2

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)

  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(-w / 2 + 4, -h / 2 + 5, w, h)

  ctx.fillStyle = color
  ctx.fillRect(-w / 2, -h / 2, w, h)

  ctx.fillStyle = '#c0392b'
  ctx.beginPath()
  ctx.arc(0, -h / 2 + 9, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.arc(-1.5, -h / 2 + 7.5, 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = done ? '#2d6a32' : '#555'
  ctx.lineWidth = 2
  ctx.strokeRect(-w / 2 + 10, -h / 2 + 22, 14, 14)
  if (done) {
    ctx.strokeStyle = '#2d6a32'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(-w / 2 + 13, -h / 2 + 29)
    ctx.lineTo(-w / 2 + 18, -h / 2 + 34)
    ctx.lineTo(-w / 2 + 24, -h / 2 + 24)
    ctx.stroke()
  }

  ctx.fillStyle = '#2a2418'
  ctx.font = '600 14px system-ui, sans-serif'
  const lines = wrapCanvasLines(ctx, text, w - 28)
  lines.slice(0, 3).forEach((ln, i) => {
    ctx.fillText(ln, -w / 2 + 30, -h / 2 + 38 + i * 17)
  })

  ctx.restore()
}

function makeTaskBoardTexture(photoTexture: THREE.Texture, tasks: BoardTask[]) {
  const image = photoTexture.image as HTMLImageElement
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 400
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#b8956a'
  ctx.fillRect(0, 0, 640, 400)
  for (let i = 0; i < 1200; i++) {
    const shade = 0.02 + Math.random() * 0.06
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${shade})`
    ctx.fillRect(Math.random() * 640, Math.random() * 400, 1 + Math.random() * 2, 1 + Math.random() * 2)
  }

  const avatarSize = 72
  const avatarX = 22
  const avatarY = 22
  ctx.fillStyle = '#fff'
  ctx.fillRect(avatarX - 3, avatarY - 3, avatarSize + 6, avatarSize + 6)
  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(image, avatarX, avatarY, avatarSize, avatarSize)
  ctx.restore()

  ctx.fillStyle = '#c0392b'
  ctx.beginPath()
  ctx.arc(avatarX + avatarSize / 2, avatarY - 2, 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(42,36,24,0.55)'
  ctx.font = '700 13px system-ui, sans-serif'
  ctx.fillText('Lamine', avatarX, avatarY + avatarSize + 16)

  tasks.forEach((task) => drawStickyNote(ctx, task))

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function buildDiningChair(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY: number,
  fabricLight: Mat,
  woodDark: Mat,
  wood: Mat,
  lite: boolean,
) {
  const ch = new THREE.Group()
  ch.position.set(x, 0, z)
  ch.rotation.y = rotY
  parent.add(ch)
  box(0.42, 0.04, 0.42, wood, 0, 0.48, 0, ch, !lite)
  box(0.42, 0.45, 0.06, fabricLight, 0, 0.72, -0.15, ch)
  ;[
    [-0.15, -0.15],
    [0.15, -0.15],
    [-0.15, 0.15],
    [0.15, 0.15],
  ].forEach(([lx, lz]) => {
    box(0.06, 0.48, 0.06, woodDark, lx, 0.24, lz, ch)
  })
}

function buildOfficeChair(
  parent: THREE.Object3D,
  x: number,
  z: number,
  rotY: number,
  fabric: Mat,
  metal: Mat,
  lite: boolean,
) {
  const ch = new THREE.Group()
  ch.position.set(x, 0, z)
  ch.rotation.y = rotY
  parent.add(ch)
  box(0.5, 0.06, 0.5, fabric, 0, 0.48, 0, ch, !lite)
  box(0.5, 0.55, 0.06, fabric, 0, 0.75, -0.22, ch)
  ;[
    [-0.2, -0.2],
    [0.2, -0.2],
    [-0.2, 0.2],
    [0.2, 0.2],
  ].forEach(([lx, lz]) => {
    box(0.06, 0.5, 0.06, metal, lx, 0.25, lz, ch)
  })
}

export function buildDetailedFurniture(scene: THREE.Scene, lite = false): FurnitureBuildResult {
  const root = new THREE.Group()
  scene.add(root)

  const swayLeaves: THREE.Object3D[] = []
  const hotspotMeshes: THREE.Object3D[] = []
  let tvScreen: THREE.Mesh | null = null
  let monitorScreen: THREE.Mesh | null = null

  const wood = mat(0x6b4423)
  const woodDark = mat(0x4a3728)
  const fabric = mat(0x3d4f5f)
  const fabricDark = mat(0x2d3a47)
  const fabricLight = mat(0x5a6b7d)
  const metal = mat(0x888888, { metalness: 0.7, roughness: 0.3 })
  const bookColors = [0x8b4513, 0x2d5a27, 0x4a3728, 0x6b3a3a, 0x3d5a80]

  // —— Salon : canapé + table basse ——
  const sofa = new THREE.Group()
  sofa.position.set(-2.6, 0, 2.4)
  root.add(sofa)
  box(3, 0.42, 1.05, fabric, 0, 0.21, 0, sofa)
  box(3, 0.65, 0.32, fabric, 0, 0.55, 0.52, sofa)
  box(0.28, 0.55, 1.05, fabricDark, -1.45, 0.48, 0, sofa)
  box(0.28, 0.55, 1.05, fabricDark, 1.45, 0.48, 0, sofa)
  box(0.55, 0.18, 0.85, fabricLight, -0.9, 0.52, 0.05, sofa)
  box(0.55, 0.18, 0.85, fabricLight, 0.5, 0.52, 0.05, sofa)
  box(0.4, 0.12, 0.4, mat(0x9b6b4a), -0.2, 0.58, 0.15, sofa)
  const throwBlanket = box(1.2, 0.04, 0.7, mat(0x6b3a3a), 0.3, 0.46, 0.05, sofa)
  throwBlanket.rotation.y = 0.15

  const table = new THREE.Group()
  table.position.set(-1.6, 0, 1.25)
  root.add(table)
  box(1.6, 0.06, 0.9, wood, 0, 0.42, 0, table)
  ;[[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(([lx, lz]) => {
    box(0.07, 0.42, 0.07, woodDark, lx, 0.21, lz, table)
  })
  box(0.35, 0.04, 0.25, mat(0xeeeeee), 0.2, 0.46, 0.1, table)
  box(0.08, 0.1, 0.08, mat(0xffffff), -0.3, 0.48, -0.15, table)
  box(0.25, 0.03, 0.18, mat(0xc45c3a), 0.45, 0.46, -0.2, table)
  const magazine = box(0.25, 0.03, 0.18, mat(0x2d5a80), -0.15, 0.465, 0.05, table)
  tagHotspot(magazine, { id: 'table', panelId: 'links', label: 'Liens utiles', icon: 'link-45deg' })
  hotspotMeshes.push(magazine)
  box(0.06, 0.01, 0.12, mat(0x111111), 0.35, 0.465, -0.05, table)
  box(0.05, 0.005, 0.1, mat(0x336688, { emissive: 0x224466, emissiveIntensity: 0.5 }), 0.35, 0.472, -0.05, table)

  const armchair = new THREE.Group()
  armchair.position.set(-5.2, 0, 1.5)
  root.add(armchair)
  box(0.95, 0.4, 0.9, fabricLight, 0, 0.2, 0, armchair)
  box(0.95, 0.55, 0.25, fabric, 0, 0.5, 0.42, armchair)
  box(0.95, 0.35, 0.12, fabricDark, 0, 0.35, -0.48, armchair)

  // —— Bureau (mur est, zone nord-est) ——
  const desk = new THREE.Group()
  desk.position.set(5.2, 0, -2.8)
  root.add(desk)
  box(1.85, 0.06, 0.88, wood, 0, 0.76, 0, desk)
  ;[[-0.78, -0.32], [0.78, -0.32], [-0.78, 0.32], [0.78, 0.32]].forEach(([lx, lz]) => {
    box(0.08, 0.76, 0.08, woodDark, lx, 0.38, lz, desk)
  })
  const monW = 0.88
  const monH = 0.48
  const monY = 1.08
  const monZ = -0.355
  const monBezel = 0.045
  const monBezelMat = mat(0x111111, { roughness: 0.4, metalness: 0.15 })
  const monBezelZ = monZ - 0.015
  box(monW + monBezel * 2, monBezel, 0.025, monBezelMat, 0, monY + monH / 2 + monBezel / 2, monBezelZ, desk)
  box(monW + monBezel * 2, monBezel, 0.025, monBezelMat, 0, monY - monH / 2 - monBezel / 2, monBezelZ, desk)
  box(monBezel, monH, 0.025, monBezelMat, -monW / 2 - monBezel / 2, monY, monBezelZ, desk)
  box(monBezel, monH, 0.025, monBezelMat, monW / 2 + monBezel / 2, monY, monBezelZ, desk)
  monitorScreen = displayScreen(monW, monH, 0, monY, monZ, desk)
  tagHotspot(monitorScreen, { id: 'monitor', panelId: 'projects', label: 'Écran — Projets', icon: 'display' })
  hotspotMeshes.push(monitorScreen)
  box(0.12, 0.08, 0.06, mat(0x222222), 0, 0.82, -0.12, desk)
  box(0.42, 0.025, 0.14, mat(0x2a2a2a), -0.05, 0.805, -0.02, desk)
  box(0.05, 0.015, 0.08, mat(0x444444), 0.42, 0.802, 0.08, desk)
  box(0.08, 0.04, 0.08, mat(0x333333), 0.52, 0.815, 0.15, desk)
  box(0.14, 0.12, 0.1, mat(0x222222), -0.52, 0.84, 0.05, desk)
  const deskLampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.35, 8), metal)
  deskLampPole.position.set(-0.68, 0.98, 0.08)
  desk.add(deskLampPole)
  const deskLampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.12, 10, 1, true),
    mat(0xfff5e0, { emissive: 0xffcc88, emissiveIntensity: 0.9, side: THREE.DoubleSide }),
  )
  deskLampHead.position.set(-0.68, 1.18, 0.08)
  deskLampHead.rotation.x = Math.PI
  desk.add(deskLampHead)
  box(0.18, 0.06, 0.12, mat(0x1a1a1a), -0.65, 0.79, -0.22, desk)
  box(0.22, 0.08, 0.14, mat(0xeeeeee), -0.65, 0.83, -0.22, desk)
  box(0.22, 0.18, 0.08, mat(0x222222), 0.62, 0.88, -0.08, desk)
  box(0.16, 0.12, 0.06, mat(0x333333), 0.62, 0.96, -0.08, desk)

  buildOfficeChair(root, 4.85, -1.65, Math.PI + 0.12, fabric, metal, lite)

  const printer = new THREE.Group()
  printer.position.set(5.6, 0, -3.65)
  root.add(printer)
  box(0.35, 0.12, 0.28, mat(0xeeeeee), 0, 0.06, 0, printer)
  box(0.3, 0.08, 0.04, mat(0xcccccc), 0, 0.14, 0.05, printer)

  // —— Étagère (coin nord-ouest) ——
  const shelf = new THREE.Group()
  shelf.position.set(-5.5, 0, -4.2)
  root.add(shelf)
  box(2.2, 0.06, 0.38, wood, 0, 0.4, 0, shelf)
  box(2.2, 0.06, 0.38, wood, 0, 1.05, 0, shelf)
  box(2.2, 0.06, 0.38, wood, 0, 1.7, 0, shelf)
  box(2.2, 0.06, 0.38, wood, 0, 2.35, 0, shelf)
  box(0.06, 2.4, 0.38, woodDark, -1.05, 1.2, 0, shelf)
  box(0.06, 2.4, 0.38, woodDark, 1.05, 1.2, 0, shelf)
  ;[-0.7, -0.35, 0, 0.35, 0.7].forEach((bx, i) => {
    const book = box(0.12, 0.28 + (i % 3) * 0.04, 0.22, mat(bookColors[i % bookColors.length]!), bx, 0.55, 0.02, shelf)
    if (i === 2) {
      tagHotspot(book, { id: 'books', panelId: 'skills', label: 'Bibliothèque', icon: 'book' })
      hotspotMeshes.push(book)
    }
    box(0.1, 0.22, 0.2, mat(bookColors[(i + 2) % bookColors.length]!), bx + 0.15, 1.2, 0.02, shelf)
  })
  box(0.2, 0.25, 0.15, mat(0xc9a227, { metalness: 0.5 }), 0.5, 1.85, 0.05, shelf)
  box(0.12, 0.18, 0.1, mat(0xffd700, { metalness: 0.8, roughness: 0.2 }), -0.3, 1.88, 0.06, shelf)
  box(0.1, 0.14, 0.08, mat(0xc0c0c0, { metalness: 0.85 }), -0.15, 1.86, 0.06, shelf)
  box(0.14, 0.2, 0.18, mat(0x2d5a80), -0.55, 1.82, 0.02, shelf)
  box(0.12, 0.16, 0.16, mat(0x6b3a3a), -0.72, 1.8, 0.02, shelf)

  // —— Meuble TV (mur nord) ——
  const tvUnit = new THREE.Group()
  tvUnit.position.set(-0.5, 0, -4.6)
  root.add(tvUnit)
  box(2.4, 0.5, 0.45, woodDark, 0, 0.25, 0, tvUnit)

  const screenW = 1.5
  const screenH = 0.85
  const screenY = 0.85
  const screenZ = -0.165
  const bezel = 0.07
  const bezelMat = mat(0x111111, { roughness: 0.45, metalness: 0.12 })
  const bezelZ = screenZ - 0.025

  // Cadre autour de l'écran (baguettes en retrait vers le mur)
  box(screenW + bezel * 2, bezel, 0.04, bezelMat, 0, screenY + screenH / 2 + bezel / 2, bezelZ, tvUnit)
  box(screenW + bezel * 2, bezel, 0.04, bezelMat, 0, screenY - screenH / 2 - bezel / 2, bezelZ, tvUnit)
  box(bezel, screenH, 0.04, bezelMat, -screenW / 2 - bezel / 2, screenY, bezelZ, tvUnit)
  box(bezel, screenH, 0.04, bezelMat, screenW / 2 + bezel / 2, screenY, bezelZ, tvUnit)

  tvScreen = displayScreen(screenW, screenH, 0, screenY, screenZ, tvUnit)
  tagHotspot(tvScreen, { id: 'tv', panelId: 'projects', label: 'Télé — Himra', icon: 'tv' })
  hotspotMeshes.push(tvScreen)
  box(0.08, 0.15, 0.08, mat(0x222222), 0.5, 0.55, 0.1, tvUnit)

  const speaker = new THREE.Group()
  speaker.position.set(1.6, 0, -4.4)
  root.add(speaker)
  box(0.18, 0.32, 0.14, mat(0x222222), 0, 0.16, 0, speaker)
  box(0.12, 0.12, 0.02, mat(0x333333), 0, 0.18, 0.08, speaker)

  // —— Salle à manger (sud-est, dégagée de la porte Contact) ——
  const dining = new THREE.Group()
  dining.position.set(2.5, 0, 3.5)
  root.add(dining)
  box(1.4, 0.06, 0.85, wood, 0, 0.78, 0, dining)
  box(0.08, 0.78, 0.08, woodDark, -0.55, 0.39, -0.3, dining)
  box(0.08, 0.78, 0.08, woodDark, 0.55, 0.39, -0.3, dining)
  box(0.08, 0.78, 0.08, woodDark, -0.55, 0.39, 0.3, dining)
  box(0.08, 0.78, 0.08, woodDark, 0.55, 0.39, 0.3, dining)

  ;[[-0.95, 0], [0.95, 0]].forEach(([cx, cz]) => {
    buildDiningChair(dining, cx, cz, cx < 0 ? Math.PI / 2 : -Math.PI / 2, fabricLight, woodDark, wood, lite)
  })

  box(0.15, 0.2, 0.15, mat(0xeeeeee), 0, 0.84, 0, dining)
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.18, 10), mat(0xeeeeee))
  vase.position.set(0.3, 0.87, 0.12)
  dining.add(vase)
  for (let f = 0; f < 4; f++) {
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      mat(f % 2 === 0 ? 0xe57373 : 0xffb74d),
    )
    flower.position.set(0.3 + Math.sin(f * 1.5) * 0.05, 0.98 + f * 0.03, 0.12 + Math.cos(f * 1.5) * 0.05)
    dining.add(flower)
  }

  const rug2 = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.0),
    mat(0x7a3e2f, { roughness: 1 }),
  )
  rug2.rotation.x = -Math.PI / 2
  rug2.position.set(2.5, 0.012, 3.5)
  root.add(rug2)

  // —— Buffet (mur est, sud — dégagé de la porte Mes projets) ——
  const sideboard = new THREE.Group()
  sideboard.position.set(5.5, 0, 3.4)
  root.add(sideboard)
  box(1.4, 0.85, 0.4, wood, 0, 0.42, 0, sideboard)
  box(1.35, 0.02, 0.36, woodDark, 0, 0.5, 0, sideboard)
  box(0.25, 0.35, 0.25, mat(0x2d5a27), -0.4, 0.9, 0, sideboard)
  box(0.12, 0.2, 0.12, mat(0xc9a227, { metalness: 0.6 }), 0.3, 0.95, 0.05, sideboard)
  const trophy = box(0.14, 0.22, 0.1, mat(0xffd700, { metalness: 0.85, roughness: 0.15 }), 0.45, 0.98, 0.02, sideboard)
  tagHotspot(trophy, { id: 'trophy', panelId: 'stats', label: 'Trophées', icon: 'trophy' })
  hotspotMeshes.push(trophy)
  box(0.22, 0.05, 0.14, mat(0x222222), -0.15, 0.88, 0.08, sideboard)
  box(0.04, 0.02, 0.04, mat(0x00ff88, { emissive: 0x00aa55, emissiveIntensity: 0.8 }), -0.15, 0.915, 0.14, sideboard)

  // —— Kitchenette (mur est, sud — dégagée de la table) ——
  const kitchen = new THREE.Group()
  kitchen.position.set(5.9, 0, 2.55)
  root.add(kitchen)
  box(0.55, 0.88, 0.38, mat(0xeeeeee), 0, 0.44, 0, kitchen)
  box(0.45, 0.02, 0.32, woodDark, 0, 0.89, 0, kitchen)
  box(0.28, 0.18, 0.22, mat(0x333333), -0.05, 0.98, 0.02, kitchen)
  box(0.08, 0.12, 0.08, mat(0xcccccc), 0.12, 0.96, 0.05, kitchen)
  box(0.1, 0.14, 0.08, mat(0x8b4513), -0.18, 0.97, 0.05, kitchen)

  // —— Lampe sur pied (coin sud-est, hors passage) ——
  const lamp = new THREE.Group()
  lamp.position.set(4.6, 0, 4.35)
  root.add(lamp)
  box(0.35, 0.04, 0.35, woodDark, 0, 0.02, 0, lamp)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.35, 10), wood)
  pole.position.set(0, 0.7, 0)
  if (!lite) pole.castShadow = true
  lamp.add(pole)
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, 0.35, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      emissive: 0xffcc88,
      emissiveIntensity: 1.5,
      side: THREE.DoubleSide,
    }),
  )
  shade.position.set(0, 1.45, 0)
  lamp.add(shade)

  // —— Plantes ——
  const plant = new THREE.Group()
  plant.position.set(-5.4, 0, 4.3)
  root.add(plant)
  const potM = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.42, 16), mat(0x8b4513))
  potM.position.y = 0.21
  if (!lite) potM.castShadow = true
  plant.add(potM)
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55 + i * 0.08, 8), mat(0x2d6a32))
    leaf.position.set(Math.sin(i) * 0.15, 0.55 + i * 0.12, Math.cos(i) * 0.15)
    plant.add(leaf)
    swayLeaves.push(leaf)
  }

  const plantSmall = new THREE.Group()
  plantSmall.position.set(6.0, 0, -4.6)
  root.add(plantSmall)
  box(0.2, 0.18, 0.2, mat(0x8b4513), 0, 0.09, 0, plantSmall)
  for (let j = 0; j < 3; j++) {
    const sl = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), mat(0x3d8b40))
    sl.position.set(0, 0.28 + j * 0.08, 0)
    plantSmall.add(sl)
    swayLeaves.push(sl)
  }

  // —— Cadres muraux (mur nord, éloignés des portes Compétences / Parcours) ——
  ;[
    { x: -5.15, y: 2.15, z: -5.95, c: 0xc4a574 },
    { x: 5.15, y: 2.15, z: -5.95, c: 0x7eb8a4 },
  ].forEach(({ x, y, z, c }) => {
    const frame = new THREE.Group()
    frame.position.set(x, y, z)
    root.add(frame)
    box(0.9, 0.65, 0.04, woodDark, 0, 0, 0, frame)
    box(0.75, 0.5, 0.02, mat(c), 0, 0, 0.02, frame)
  })

  // —— Applique murale ——
  const sconce = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.25, 0.1),
    mat(0xfff5e0, { emissive: 0xffaa66, emissiveIntensity: 0.8 }),
  )
  sconce.position.set(-6.92, 2.2, -1)
  sconce.rotation.y = Math.PI / 2
  root.add(sconce)

  const mirror = new THREE.Group()
  mirror.position.set(6.9, 1.75, -1.8)
  mirror.rotation.y = -Math.PI / 2
  root.add(mirror)
  box(0.7, 1, 0.04, woodDark, 0, 0, 0, mirror)
  const mirrorGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.58, 0.82),
    new THREE.MeshStandardMaterial({ color: 0xddeeff, metalness: 0.9, roughness: 0.05 }),
  )
  mirrorGlass.position.z = 0.025
  mirror.add(mirrorGlass)

  return { root, swayLeaves, hotspotMeshes, tvScreen, monitorScreen }
}

/** Cadre photo au mur (texture cadre + portrait) */
export function buildWallPhotoFrame(
  frameTexture: THREE.Texture,
  photoTexture: THREE.Texture,
  room: { w: number; d: number },
  lite = false,
) {
  const group = new THREE.Group()
  group.position.set(-room.w / 2 + 0.11, 1.85, 1.55)
  group.rotation.y = Math.PI / 2

  const w = 0.92
  const h = 0.92
  const depth = 0.04

  frameTexture.colorSpace = THREE.SRGBColorSpace
  photoTexture.colorSpace = THREE.SRGBColorSpace

  box(
    w + 0.06,
    h + 0.06,
    depth,
    mat(0x6b5238, { emissive: 0x2a2018, emissiveIntensity: 0.25 }),
    0,
    0,
    -0.015,
    group,
    false,
  )

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.74, h * 0.74),
    new THREE.MeshBasicMaterial({ map: photoTexture }),
  )
  photo.position.z = depth * 0.5 + 0.008
  group.add(photo)

  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: frameTexture, transparent: true }),
  )
  frame.position.z = depth * 0.5 + 0.032
  group.add(frame)

  if (!lite) {
    const spot = new THREE.PointLight(0xfff4e0, 2.2, 5, 1.2)
    spot.position.set(0.85, 0.15, 0.45)
    group.add(spot)
  }

  return group
}

/** Horloge murale (texture horloge.jpg) */
export function buildWallClock(
  clockTexture: THREE.Texture,
  hotspotMeshes: THREE.Object3D[] = [],
  lite = false,
) {
  const group = new THREE.Group()
  group.position.set(4.15, 2.45, -5.93)

  clockTexture.colorSpace = THREE.SRGBColorSpace

  const size = 0.58
  box(size + 0.06, size + 0.06, 0.04, mat(0x222222), 0, 0, -0.02, group, !lite)

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(size * 0.5, 48),
    new THREE.MeshStandardMaterial({
      map: clockTexture,
      roughness: 0.85,
      metalness: 0.05,
      emissive: 0x111111,
      emissiveIntensity: 0.25,
    }),
  )
  face.position.z = 0.025
  group.add(face)

  tagHotspot(face, { id: 'clock', panelId: 'clock', label: 'Horloge', icon: 'clock' })
  hotspotMeshes.push(face)

  return group
}

export function buildWindow(
  scene: THREE.Scene,
  room: { w: number; d: number; h: number },
  hotspotMeshes: THREE.Object3D[] = [],
) {
  const win = new THREE.Group()
  win.position.set(-3.5, 1.5, room.d / 2 - 0.05)

  box(2.85, 1.65, 0.1, mat(0x4a3728), 0, 0, 0, win)
  box(2.75, 1.55, 0.06, mat(0x6b5238), 0, 0, -0.02, win)
  box(2.65, 1.45, 0.04, mat(0x8b7355), 0, 0, -0.035, win)

  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(2.45, 1.4),
    new THREE.MeshBasicMaterial({ color: 0xb8956a, fog: false }),
  )
  view.position.z = -0.058
  view.rotation.y = Math.PI
  win.add(view)
  win.userData.boardMesh = view

  tagHotspot(view, { id: 'window', panelId: 'tasks', label: 'Tableau — Tâches', icon: 'kanban' })
  hotspotMeshes.push(view)

  scene.add(win)
  return win
}

export function applyWindowTaskBoard(
  windowGroup: THREE.Group,
  photoTexture: THREE.Texture,
  tasks: BoardTask[],
  loadedTextures: THREE.Texture[] = [],
) {
  const view = windowGroup.userData.boardMesh as THREE.Mesh | undefined
  if (!view) return

  photoTexture.colorSpace = THREE.SRGBColorSpace
  const boardTex = makeTaskBoardTexture(photoTexture, tasks)
  loadedTextures.push(boardTex)

  const oldMat = view.material as THREE.Material
  view.material = new THREE.MeshBasicMaterial({ map: boardTex, fog: false })
  oldMat.dispose()
}
